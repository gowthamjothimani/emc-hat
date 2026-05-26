from flask import Flask, jsonify, send_file
from flask import request
from flask_cors import CORS
import sqlite3, json, csv, io, os, uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from db import init_db, get_db, IMAGES_DIR, BOM_DIR, PCBA_DIR
from mqtt_client import start_mqtt
from device_store import get_all_devices, delete_device

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
ALLOWED_BOM_EXTENSIONS = {'xlsx', 'xls', 'csv'}
ALLOWED_PCB_EXTENSIONS = {'kicad_pcb', 'kicad_sch', 'sch', 'brd', 'gbp', 'gbl', 'pdf'}

app = Flask(__name__)
CORS(app)

init_db()
start_mqtt()


TABLE_MAP = {
    "tools": "inventory_tools",
    "iot": "inventory_iot",
    "components": "inventory_components",
    "others": "inventory_others",
    "common": "inventory_common"  # dedicated common inventory table
}


def rows_to_dicts(cursor, rows):
    cols = [c[0] for c in cursor.description]
    out = []
    for r in rows:
        d = {}
        for i, v in enumerate(r):
            d[cols[i]] = v
        out.append(d)
    return out


def get_table_for_type(t):
    return TABLE_MAP.get(t)


@app.route("/api/images/upload", methods=["POST"])
def upload_image():
    """Upload an image and store metadata"""
    if 'file' not in request.files:
        return jsonify({"error": "no file"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "no selected file"}), 400
    
    # Check file extension
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS):
        return jsonify({"error": "file type not allowed"}), 400
    
    try:
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(IMAGES_DIR, unique_name)
        
        # Save file
        file.save(filepath)
        
        # Store in database
        conn = get_db()
        conn.execute(
            "INSERT INTO uploaded_images (filename, filepath) VALUES (?, ?)",
            (unique_name, filepath)
        )
        conn.commit()
        
        return jsonify({"status": "ok", "image_url": unique_name})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/images/recent", methods=["GET"])
def get_recent_images():
    """Get recently uploaded images"""
    try:
        conn = get_db()
        c = conn.cursor()
        rows = c.execute(
            "SELECT filename FROM uploaded_images ORDER BY uploaded_at DESC LIMIT 20"
        ).fetchall()
        images = [r[0] for r in rows]
        return jsonify(images)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/images/<filename>", methods=["GET"])
def get_image(filename):
    """Serve an image"""
    try:
        filepath = os.path.join(IMAGES_DIR, secure_filename(filename))
        if not os.path.exists(filepath):
            return jsonify({"error": "not found"}), 404
        return send_file(filepath)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/categories/<inv_type>", methods=["GET"])
def get_categories(inv_type):
    """Get all categories for an inventory type"""
    conn = get_db()
    c = conn.cursor()
    rows = c.execute(
        "SELECT category_name FROM categories WHERE inventory_type=? ORDER BY category_name",
        (inv_type,)
    ).fetchall()
    categories = [r[0] for r in rows]
    return jsonify(categories)


@app.route("/api/categories/<inv_type>", methods=["POST"])
def add_category(inv_type):
    """Add a new category for an inventory type"""
    data = request.json or {}
    category_name = data.get("category_name")
    
    if not category_name:
        return jsonify({"error": "category_name required"}), 400
    
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO categories (inventory_type, category_name) VALUES (?, ?)",
            (inv_type, category_name)
        )
        conn.commit()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/inventory/<inv_type>", methods=["GET"])
def list_inventory(inv_type):
    """List items for inventory type. supports optional ?q=search"""
    table = get_table_for_type(inv_type)
    if not table:
        return jsonify({"error": "unknown inventory type"}), 400

    q = request.args.get("q")
    conn = get_db()
    c = conn.cursor()

    if q:
        pattern = f"%{q}%"
        # search common identifying fields
        sql = f"SELECT * FROM {table} WHERE item_id LIKE ? OR item_name LIKE ? OR part_number LIKE ? OR model_number LIKE ? ORDER BY id DESC"
        rows = c.execute(sql, (pattern, pattern, pattern, pattern)).fetchall()
    else:
        rows = c.execute(f"SELECT * FROM {table} ORDER BY id DESC").fetchall()

    return jsonify(rows_to_dicts(c, rows))


@app.route("/api/inventory/<inv_type>", methods=["POST"])
def add_inventory(inv_type):
    table = get_table_for_type(inv_type)
    if not table:
        return jsonify({"error": "unknown inventory type"}), 400

    data = request.json or {}
    # build insert dynamically from keys present
    cols = []
    vals = []
    for k, v in data.items():
        cols.append(k)
        vals.append(v)

    if not cols:
        return jsonify({"error": "no data"}), 400

    placeholders = ",".join(["?" for _ in cols])
    col_names = ",".join(cols)
    sql = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
    conn = get_db()
    try:
        conn.execute(sql, vals)
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"status": "ok"})


@app.route("/api/inventory/<inv_type>/<item_id>", methods=["DELETE"])
def delete_inventory(inv_type, item_id):
    table = get_table_for_type(inv_type)
    if not table:
        return jsonify({"error": "unknown inventory type"}), 400
    conn = get_db()
    conn.execute(f"DELETE FROM {table} WHERE item_id=?", (item_id,))
    conn.commit()
    return jsonify({"status": "deleted"})


@app.route("/api/inventory/<inv_type>/<item_id>", methods=["PUT"])
def update_inventory(inv_type, item_id):
    table = get_table_for_type(inv_type)
    if not table:
        return jsonify({"error": "unknown inventory type"}), 400
    data = request.json or {}
    if not data:
        return jsonify({"error": "no data"}), 400

    sets = ",".join([f"{k}=?" for k in data.keys()])
    vals = list(data.values())
    vals.append(item_id)
    sql = f"UPDATE {table} SET {sets} WHERE item_id=?"
    conn = get_db()
    conn.execute(sql, vals)
    conn.commit()
    return jsonify({"status": "updated"})


@app.route("/api/devices", methods=["GET"])
def get_devices():
    devices = get_all_devices()
    print(f"📤 API devices count: {len(devices)}")
    return jsonify(devices)

@app.route("/api/devices/<hostname>", methods=["DELETE"])
def remove_device(hostname):
    delete_device(hostname)
    return jsonify({"status": "deleted"})

@app.route("/api/testlogs")
def get_logs():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute("""
        SELECT id, pcb_serial, model_number,
               project_detail, qc_status, timestamp, raw_json
        FROM test_logs ORDER BY id DESC
    """).fetchall()

    logs = []
    for r in rows:
        pcb_serial = r[1]
        model_number = r[2]
        project_detail = r[3]
        qc_status = r[4]
        timestamp = r[5]
        raw_json_str = r[6]
        
        # Try to extract from raw_json if table columns are empty
        if raw_json_str:
            try:
                raw_data = json.loads(raw_json_str)
                if not pcb_serial and raw_data.get("test_details"):
                    pcb_serial = raw_data.get("test_details", {}).get("pcbserial", "")
                if not model_number and raw_data.get("test_details"):
                    model_number = raw_data.get("test_details", {}).get("modelnumber", "")
                if not project_detail and raw_data.get("test_details"):
                    project_detail = raw_data.get("test_details", {}).get("projectdetail", "")
                if not qc_status:
                    qc_status = raw_data.get("qc_status", "")
                if not timestamp and raw_data.get("system-check"):
                    timestamp = raw_data.get("system-check", {}).get("timestamp", "")
            except:
                pass
        
        logs.append({
            "id": r[0],
            "pcb_serial": pcb_serial or "—",
            "model": model_number or "—",
            "project": project_detail or "—",
            "qc": qc_status or "NOT_RUN",
            "timestamp": timestamp or "—"
        })
    return jsonify(logs)

@app.route("/api/testlogs/<int:id>")
def get_log(id):
    conn = get_db()
    c = conn.cursor()
    row = c.execute(
        "SELECT raw_json FROM test_logs WHERE id=?", (id,)
    ).fetchone()
    return jsonify(json.loads(row[0]))

@app.route("/api/testlogs/<int:id>", methods=["DELETE"])
def delete_log(id):
    conn = get_db()
    conn.execute("DELETE FROM test_logs WHERE id=?", (id,))
    conn.commit()
    return {"status": "deleted"}

@app.route("/api/testlogs/export")
def export_csv():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute("SELECT * FROM test_logs").fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "PCB Serial", "Model Number", "Project Detail", "QC Status", "Timestamp",
        "System Check", "Board Inspection", "Gas Status", "Efuse On/Off", "Fault Status",
        "Alarm", "Relay", "Raw JSON"
    ])

    for row in rows:
        raw_json_str = row[7]  # Assuming raw_json is the 8th column
        parsed_data = {
            "system_check": "",
            "board_inspection": "",
            "gas_status": "",
            "efuse": "",
            "fault_status": "",
            "alarm": "",
            "relay": ""
        }

        if raw_json_str:
            try:
                raw_data = json.loads(raw_json_str)
                parsed_data["system_check"] = raw_data.get("system-check", {}).get("status", "")
                parsed_data["board_inspection"] = raw_data.get("board-inspection", {}).get("status", "")
                parsed_data["gas_status"] = raw_data.get("gas-status", "")
                parsed_data["efuse"] = raw_data.get("efuse", "")
                parsed_data["fault_status"] = raw_data.get("fault-status", "")
                parsed_data["alarm"] = raw_data.get("alarm", "")
                parsed_data["relay"] = raw_data.get("relay", "")
            except json.JSONDecodeError:
                pass

        writer.writerow([
            row[0],  # ID
            row[1],  # PCB Serial
            row[2],  # Model Number
            row[3],  # Project Detail
            row[4],  # QC Status
            row[5],  # Timestamp
            parsed_data["system_check"],
            parsed_data["board_inspection"],
            parsed_data["gas_status"],
            parsed_data["efuse"],
            parsed_data["fault_status"],
            parsed_data["alarm"],
            parsed_data["relay"],
            raw_json_str  # Raw JSON
        ])

    mem = io.BytesIO()
    mem.write(output.getvalue().encode())
    mem.seek(0)

    return send_file(mem, as_attachment=True,
                     download_name="test_logs.csv",
                     mimetype="text/csv")


# ==================== PRODUCTION BOM ====================

@app.route("/api/bom", methods=["GET"])
def list_bom():
    """List all BOMs"""
    conn = get_db()
    c = conn.cursor()
    rows = c.execute(
        "SELECT id, bom_id, project_name, pcb_version, date, engineer_name, created_at FROM production_bom ORDER BY created_at DESC"
    ).fetchall()
    boms = []
    for r in rows:
        boms.append({
            "id": r[0],
            "bom_id": r[1],
            "project_name": r[2],
            "pcb_version": r[3],
            "date": r[4],
            "engineer_name": r[5],
            "created_at": r[6]
        })
    return jsonify(boms)


@app.route("/api/bom/<bom_id>", methods=["GET"])
def get_bom(bom_id):
    """Get BOM details including file path"""
    conn = get_db()
    c = conn.cursor()
    row = c.execute(
        "SELECT id, bom_id, project_name, pcb_version, date, engineer_name, file_path, created_at FROM production_bom WHERE bom_id=?",
        (bom_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    return jsonify({
        "id": row[0],
        "bom_id": row[1],
        "project_name": row[2],
        "pcb_version": row[3],
        "date": row[4],
        "engineer_name": row[5],
        "file_path": row[6],
        "created_at": row[7]
    })


@app.route("/api/bom", methods=["POST"])
def add_bom():
    """Add new BOM with file upload"""
    if 'file' not in request.files:
        return jsonify({"error": "no file"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "no selected file"}), 400
    
    # Check file extension
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_BOM_EXTENSIONS):
        return jsonify({"error": "only xlsx, xls, csv allowed"}), 400
    
    project_name = request.form.get("project_name")
    pcb_version = request.form.get("pcb_version")
    date = request.form.get("date")
    engineer_name = request.form.get("engineer_name")
    
    if not all([project_name, pcb_version, date, engineer_name]):
        return jsonify({"error": "all fields required"}), 400
    
    try:
        # Generate unique filename and BOM ID
        ext = file.filename.rsplit('.', 1)[1].lower()
        bom_id = f"BOM-{uuid.uuid4().hex[:8].upper()}"
        unique_name = f"{bom_id}.{ext}"
        filepath = os.path.join(BOM_DIR, unique_name)
        
        # Save file
        file.save(filepath)
        
        # Store in database
        conn = get_db()
        conn.execute(
            """INSERT INTO production_bom 
               (bom_id, project_name, pcb_version, date, engineer_name, file_path)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (bom_id, project_name, pcb_version, date, engineer_name, filepath)
        )
        conn.commit()
        
        return jsonify({"status": "ok", "bom_id": bom_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/bom/<bom_id>", methods=["PUT"])
def update_bom(bom_id):
    """Update BOM metadata and/or file"""
    conn = get_db()
    c = conn.cursor()
    
    # Get existing BOM
    row = c.execute(
        "SELECT file_path FROM production_bom WHERE bom_id=?", (bom_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    file_path = row[0]
    
    # Handle file upload if provided
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext not in ALLOWED_BOM_EXTENSIONS:
                return jsonify({"error": "only xlsx, xls, csv allowed"}), 400
            
            # Delete old file
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass
            
            # Save new file
            unique_name = f"{bom_id}.{ext}"
            file_path = os.path.join(BOM_DIR, unique_name)
            file.save(file_path)
    
    # Update metadata
    updates = []
    values = []
    
    if 'project_name' in request.form:
        updates.append("project_name=?")
        values.append(request.form.get("project_name"))
    if 'pcb_version' in request.form:
        updates.append("pcb_version=?")
        values.append(request.form.get("pcb_version"))
    if 'date' in request.form:
        updates.append("date=?")
        values.append(request.form.get("date"))
    if 'engineer_name' in request.form:
        updates.append("engineer_name=?")
        values.append(request.form.get("engineer_name"))
    
    if 'file' in request.files:
        updates.append("file_path=?")
        values.append(file_path)
    
    if updates:
        updates.append("updated_at=?")
        values.append(datetime.now().isoformat())
        values.append(bom_id)
        
        sql = f"UPDATE production_bom SET {', '.join(updates)} WHERE bom_id=?"
        conn.execute(sql, values)
        conn.commit()
    
    return jsonify({"status": "updated"})


@app.route("/api/bom/<bom_id>", methods=["DELETE"])
def delete_bom(bom_id):
    """Delete BOM and its file"""
    conn = get_db()
    c = conn.cursor()
    
    row = c.execute(
        "SELECT file_path FROM production_bom WHERE bom_id=?", (bom_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    file_path = row[0]
    
    # Delete file
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except:
        pass
    
    # Delete from database
    conn.execute("DELETE FROM production_bom WHERE bom_id=?", (bom_id,))
    conn.commit()
    
    return jsonify({"status": "deleted"})


@app.route("/api/bom/<bom_id>/file", methods=["GET"])
def download_bom_file(bom_id):
    """Download BOM file"""
    conn = get_db()
    c = conn.cursor()
    row = c.execute(
        "SELECT file_path FROM production_bom WHERE bom_id=?", (bom_id,)
    ).fetchone()
    
    if not row or not os.path.exists(row[0]):
        return jsonify({"error": "file not found"}), 404
    
    return send_file(row[0], as_attachment=True)


# ==================== PCBA / PCB DESIGNS ====================

@app.route("/api/pcba", methods=["GET"])
def list_pcba():
    """List all PCBA designs"""
    conn = get_db()
    c = conn.cursor()
    rows = c.execute(
        "SELECT id, design_id, project_name, board_name, description, pcb_version, created_by, created_at FROM pcba_designs ORDER BY created_at DESC"
    ).fetchall()
    designs = []
    for r in rows:
        designs.append({
            "id": r[0],
            "design_id": r[1],
            "project_name": r[2],
            "board_name": r[3],
            "description": r[4],
            "pcb_version": r[5],
            "created_by": r[6],
            "created_at": r[7]
        })
    return jsonify(designs)


@app.route("/api/pcba/<design_id>", methods=["GET"])
def get_pcba(design_id):
    """Get PCBA design details"""
    conn = get_db()
    c = conn.cursor()
    row = c.execute(
        "SELECT id, design_id, project_name, board_name, description, schematic_file_path, board_file_path, pcb_version, created_by, created_at FROM pcba_designs WHERE design_id=?",
        (design_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    return jsonify({
        "id": row[0],
        "design_id": row[1],
        "project_name": row[2],
        "board_name": row[3],
        "description": row[4],
        "schematic_file_path": row[5],
        "board_file_path": row[6],
        "pcb_version": row[7],
        "created_by": row[8],
        "created_at": row[9]
    })


@app.route("/api/pcba", methods=["POST"])
def add_pcba():
    """Add new PCBA design with file uploads"""
    project_name = request.form.get("project_name")
    board_name = request.form.get("board_name")
    description = request.form.get("description")
    pcb_version = request.form.get("pcb_version")
    created_by = request.form.get("created_by")
    
    if not all([project_name, board_name, pcb_version, created_by]):
        return jsonify({"error": "required fields: project_name, board_name, pcb_version, created_by"}), 400
    
    schematic_file = request.files.get("schematic_file")
    board_file = request.files.get("board_file")
    
    if not schematic_file and not board_file:
        return jsonify({"error": "at least one file (schematic or board) is required"}), 400
    
    try:
        design_id = f"PCB-{uuid.uuid4().hex[:8].upper()}"
        schematic_path = None
        board_path = None
        
        # Save schematic file
        if schematic_file and schematic_file.filename != '':
            ext = schematic_file.filename.rsplit('.', 1)[1].lower()
            if ext not in ALLOWED_PCB_EXTENSIONS:
                return jsonify({"error": "schematic file type not allowed"}), 400
            schematic_name = f"{design_id}_sch.{ext}"
            schematic_path = os.path.join(PCBA_DIR, schematic_name)
            schematic_file.save(schematic_path)
        
        # Save board file
        if board_file and board_file.filename != '':
            ext = board_file.filename.rsplit('.', 1)[1].lower()
            if ext not in ALLOWED_PCB_EXTENSIONS:
                return jsonify({"error": "board file type not allowed"}), 400
            board_name_file = f"{design_id}_brd.{ext}"
            board_path = os.path.join(PCBA_DIR, board_name_file)
            board_file.save(board_path)
        
        # Store in database
        conn = get_db()
        conn.execute(
            """INSERT INTO pcba_designs 
               (design_id, project_name, board_name, description, schematic_file_path, board_file_path, pcb_version, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (design_id, project_name, board_name, description, schematic_path, board_path, pcb_version, created_by)
        )
        conn.commit()
        
        return jsonify({"status": "ok", "design_id": design_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/pcba/<design_id>", methods=["PUT"])
def update_pcba(design_id):
    """Update PCBA design"""
    conn = get_db()
    c = conn.cursor()
    
    row = c.execute(
        "SELECT schematic_file_path, board_file_path FROM pcba_designs WHERE design_id=?", (design_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    schematic_path = row[0]
    board_path = row[1]
    
    # Handle file replacements
    if 'schematic_file' in request.files:
        file = request.files['schematic_file']
        if file.filename != '':
            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext not in ALLOWED_PCB_EXTENSIONS:
                return jsonify({"error": "schematic file type not allowed"}), 400
            try:
                if schematic_path and os.path.exists(schematic_path):
                    os.remove(schematic_path)
            except:
                pass
            schematic_name = f"{design_id}_sch.{ext}"
            schematic_path = os.path.join(PCBA_DIR, schematic_name)
            file.save(schematic_path)
    
    if 'board_file' in request.files:
        file = request.files['board_file']
        if file.filename != '':
            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext not in ALLOWED_PCB_EXTENSIONS:
                return jsonify({"error": "board file type not allowed"}), 400
            try:
                if board_path and os.path.exists(board_path):
                    os.remove(board_path)
            except:
                pass
            board_name_file = f"{design_id}_brd.{ext}"
            board_path = os.path.join(PCBA_DIR, board_name_file)
            file.save(board_path)
    
    # Update metadata
    updates = []
    values = []
    
    if 'project_name' in request.form:
        updates.append("project_name=?")
        values.append(request.form.get("project_name"))
    if 'board_name' in request.form:
        updates.append("board_name=?")
        values.append(request.form.get("board_name"))
    if 'description' in request.form:
        updates.append("description=?")
        values.append(request.form.get("description"))
    if 'pcb_version' in request.form:
        updates.append("pcb_version=?")
        values.append(request.form.get("pcb_version"))
    if 'created_by' in request.form:
        updates.append("created_by=?")
        values.append(request.form.get("created_by"))
    
    updates.append("schematic_file_path=?")
    values.append(schematic_path)
    updates.append("board_file_path=?")
    values.append(board_path)
    updates.append("updated_at=?")
    values.append(datetime.now().isoformat())
    values.append(design_id)
    
    sql = f"UPDATE pcba_designs SET {', '.join(updates)} WHERE design_id=?"
    conn.execute(sql, values)
    conn.commit()
    
    return jsonify({"status": "updated"})


@app.route("/api/pcba/<design_id>", methods=["DELETE"])
def delete_pcba(design_id):
    """Delete PCBA design and its files"""
    conn = get_db()
    c = conn.cursor()
    
    row = c.execute(
        "SELECT schematic_file_path, board_file_path FROM pcba_designs WHERE design_id=?", (design_id,)
    ).fetchone()
    
    if not row:
        return jsonify({"error": "not found"}), 404
    
    # Delete files
    for file_path in [row[0], row[1]]:
        if file_path:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass
    
    # Delete from database
    conn.execute("DELETE FROM pcba_designs WHERE design_id=?", (design_id,))
    conn.commit()
    
    return jsonify({"status": "deleted"})


@app.route("/api/pcba/<design_id>/file/<file_type>", methods=["GET"])
def download_pcba_file(design_id, file_type):
    """Download PCBA file (schematic or board)"""
    conn = get_db()
    c = conn.cursor()
    
    col = "schematic_file_path" if file_type == "schematic" else "board_file_path"
    row = c.execute(
        f"SELECT {col} FROM pcba_designs WHERE design_id=?", (design_id,)
    ).fetchone()
    
    if not row or not row[0] or not os.path.exists(row[0]):
        return jsonify({"error": "file not found"}), 404
    
    return send_file(row[0], as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)

