import json
import paho.mqtt.client as mqtt
from device_store import upsert_device

MQTT_BROKER = "10.30.250.241"
MQTT_PORT = 1883
TOPIC = "emc/testbench/heartbeat/+"

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        upsert_device(data)

        print(
            f"📡 Heartbeat | {data['hostname']} | "
            f"CPU {data['cpu_percent']}% | Uptime {data['uptime_sec']}s"
        )

    except Exception as e:
        print("❌ MQTT processing error:", e)

def start_mqtt():
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.subscribe(TOPIC)
    client.loop_start()

    print("🚀 MQTT heartbeat listener started")
