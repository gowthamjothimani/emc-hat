import json
import paho.mqtt.client as mqtt
from device_store import upsert_device
from db import get_db

MQTT_BROKER = "10.30.250.241"
MQTT_PORT = 1883
HEARTBEAT_TOPIC = "emc/testbench/heartbeat/+"
EMC_TEST_TOPIC = "emc_test"

def on_message(client, userdata, msg):
    try:
        # Parse the incoming message
        data = json.loads(msg.payload.decode())
        
        # Handle heartbeat messages
        if msg.topic.startswith("emc/testbench/heartbeat/"):
            upsert_device(data)
            print(
                f"📡 Heartbeat | {data['hostname']} | "
                f"CPU {data['cpu_percent']}% | Uptime {data['uptime_sec']}s"
            )
        
        # Handle EMC test data messages
        elif msg.topic == EMC_TEST_TOPIC:
            handle_emc_test_data(data)
            
    except Exception as e:
        print("❌ MQTT processing error:", e)

def handle_emc_test_data(data):
    """
    Process EMC test data received from the emc_test topic.
    Expected data structure:
    {
        "test_details": {
            "testername": "...",
            "pcbserial": "...",
            "modelnumber": "...",
            "projectdetail": "..."
        },
        "system-check": {
            "timestamp": "...",
            ...other system fields...
        },
        "qc_status": "PASS/FAIL",
        ...other test fields...
    }
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Extract data from nested structure
        test_details = data.get('test_details', {})
        system_check = data.get('system-check', {})
        
        pcb_serial = test_details.get('pcbserial', '')
        model_number = test_details.get('modelnumber', '')
        project_detail = test_details.get('projectdetail', '')
        tester_name = test_details.get('testername', '')
        qc_status = data.get('qc_status', '')
        timestamp = system_check.get('timestamp', '')
        
        # Insert test log data using the existing schema
        cursor.execute("""
            INSERT INTO test_logs 
            (pcb_serial, model_number, project_detail, tester_name, qc_status, timestamp, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            pcb_serial,
            model_number,
            project_detail,
            tester_name,
            qc_status,
            timestamp,
            json.dumps(data)
        ))
        
        conn.commit()
        conn.close()
        
        print(
            f"📊 EMC Test Data | PCB: {data.get('pcb_serial', 'Unknown')} | "
            f"Model: {data.get('model_number', 'Unknown')} | "
            f"Status: {data.get('qc_status', 'Unknown')}"
        )
    except Exception as e:
        print(f"❌ Error processing EMC test data: {e}")

def start_mqtt():
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    # Subscribe to both topics
    client.subscribe(HEARTBEAT_TOPIC)
    client.subscribe(EMC_TEST_TOPIC)
    
    client.loop_start()

    print("🚀 MQTT client started")
    print(f"   - Listening on: {HEARTBEAT_TOPIC}")
    print(f"   - Listening on: {EMC_TEST_TOPIC}")
