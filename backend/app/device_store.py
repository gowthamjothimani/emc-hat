from datetime import datetime

# Global device state
DEVICES = {}

OFFLINE_TIMEOUT_SEC = 30

def upsert_device(data):
    hostname = data["hostname"]

    DEVICES[hostname] = {
        "device": data["device"],
        "device_id": data["device_id"],
        "hostname": hostname,
        "ip": data["ip"],
        "cpu_percent": data["cpu_percent"],
        "uptime_sec": data["uptime_sec"],
        "status": "ONLINE",
        "last_seen": datetime.utcnow()
    }

def get_all_devices():
    now = datetime.utcnow()
    devices = []

    for d in DEVICES.values():
        delta = (now - d["last_seen"]).total_seconds()
        d["status"] = "OFFLINE" if delta > OFFLINE_TIMEOUT_SEC else "ONLINE"
        # Convert datetime to ISO format string for JSON serialization
        device_copy = d.copy()
        device_copy["last_seen"] = d["last_seen"].isoformat()
        devices.append(device_copy)

    return devices

def delete_device(hostname):
    DEVICES.pop(hostname, None)
