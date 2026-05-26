import sqlite3
import os

DB_NAME = "emc.db"
IMAGES_DIR = "uploads/images"
BOM_DIR = "uploads/bom"
PCBA_DIR = "uploads/pcba"

def get_db():
    return sqlite3.connect(DB_NAME, check_same_thread=False)

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Create directories
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(BOM_DIR, exist_ok=True)
    os.makedirs(PCBA_DIR, exist_ok=True)

    # ---------------- Uploaded Images ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE,
            filepath TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ---------------- Categories ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inventory_type TEXT,
            category_name TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Default categories
    default_categories = [
        ("tools", "Measurement"), ("tools", "Testing"), ("tools", "Hand Tools"), ("tools", "Power Tools"),
        ("iot", "Microcontroller"), ("iot", "Sensor"), ("iot", "Gateway"), ("iot", "Module"),
        ("components", "Passive"), ("components", "Active"), ("components", "Electromechanical"),
        ("others", "Mechanical"), ("others", "Assembly"), ("others", "Enclosure")
    ]
    
    for inv_type, cat_name in default_categories:
        c.execute(
            "INSERT OR IGNORE INTO categories (inventory_type, category_name) VALUES (?, ?)",
            (inv_type, cat_name)
        )

    # ---------------- Test Logs ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS test_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcb_serial TEXT,
            model_number TEXT,
            project_detail TEXT,
            tester_name TEXT,
            qc_status TEXT,
            timestamp TEXT,
            raw_json TEXT
        )
    """)

    # ---------------- Inventory : Testing Tools ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE,
            category TEXT,
            item_name TEXT,
            description TEXT,
            quantity INTEGER,
            unit TEXT,
            condition TEXT,
            location TEXT,
            assigned_to TEXT,
            purchase_date TEXT,
            vendor TEXT,
            remarks TEXT,
            image_url TEXT,

            tool_type TEXT,
            brand TEXT,
            model_number TEXT,
            serial_number TEXT,
            power_type TEXT,
            calibration_date TEXT
        )
    """)

    # ---------------- Inventory : IoT / Edge ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory_iot (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE,
            category TEXT,
            item_name TEXT,
            description TEXT,
            quantity INTEGER,
            unit TEXT,
            condition TEXT,
            location TEXT,
            assigned_to TEXT,
            purchase_date TEXT,
            vendor TEXT,
            remarks TEXT,
            image_url TEXT,

            device_type TEXT,
            processor TEXT,
            interfaces TEXT,
            firmware_version TEXT,
            mac_address TEXT,
            usage_status TEXT
        )
    """)

    # ---------------- Inventory : Components ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE,
            category TEXT,
            item_name TEXT,
            description TEXT,
            quantity INTEGER,
            unit TEXT,
            condition TEXT,
            location TEXT,
            assigned_to TEXT,
            purchase_date TEXT,
            vendor TEXT,
            remarks TEXT,
            image_url TEXT,

            component_type TEXT,
            part_number TEXT,
            value_rating TEXT,
            package_type TEXT,
            tolerance TEXT,
            min_stock INTEGER
        )
    """)

    # ---------------- Inventory : Others ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory_others (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE,
            category TEXT,
            item_name TEXT,
            description TEXT,
            quantity INTEGER,
            unit TEXT,
            condition TEXT,
            location TEXT,
            assigned_to TEXT,
            purchase_date TEXT,
            vendor TEXT,
            remarks TEXT,
            image_url TEXT,

            item_type TEXT,
            size_spec TEXT,
            material TEXT,
            compatible_with TEXT
        )
    """)

    # ---------------- Inventory : Common ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory_common (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT UNIQUE,
            category TEXT,
            item_name TEXT,
            description TEXT,
            quantity INTEGER,
            unit TEXT,
            condition TEXT,
            location TEXT,
            assigned_to TEXT,
            purchase_date TEXT,
            vendor TEXT,
            remarks TEXT,
            image_url TEXT
        )
    """)

    # ---------------- Production BOM ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS production_bom (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bom_id TEXT UNIQUE,
            project_name TEXT,
            pcb_version TEXT,
            date TEXT,
            engineer_name TEXT,
            file_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ---------------- PCBA / PCB Designs ----------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS pcba_designs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            design_id TEXT UNIQUE,
            project_name TEXT,
            board_name TEXT,
            description TEXT,
            schematic_file_path TEXT,
            board_file_path TEXT,
            pcb_version TEXT,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def get_tested_pcb_count():
    conn = sqlite3.connect('emc_test_data.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM test_log")  # 'test_log' = table where PCB test results are stored
    count = cursor.fetchone()[0]
    
    conn.close()
    return count
