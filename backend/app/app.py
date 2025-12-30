from flask import Flask, jsonify
from flask_cors import CORS
from mqtt_client import start_mqtt
from device_store import get_all_devices, delete_device

app = Flask(__name__)
CORS(app)

start_mqtt()

@app.route("/api/devices", methods=["GET"])
def get_devices():
    devices = get_all_devices()
    print(f"📤 API devices count: {len(devices)}")
    return jsonify(devices)

@app.route("/api/devices/<hostname>", methods=["DELETE"])
def remove_device(hostname):
    delete_device(hostname)
    return jsonify({"status": "deleted"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
