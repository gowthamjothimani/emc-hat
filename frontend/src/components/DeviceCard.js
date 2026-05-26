import axios from "axios";
import { Card } from "react-bootstrap";
import bbImg from "../assets/beaglebone.png";

const API_BASE = "http://10.30.250.241:5000/api";

export default function DeviceCard({ device, reload }) {
  const remove = async () => {
    try {
      await axios.delete(`${API_BASE}/devices/${device.hostname}`);
      reload();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <Card className="mb-3 text-center">
      <Card.Header>
        {device.hostname}
        <span
          style={{ float: "right", cursor: "pointer" }}
          onClick={remove}
        >
          🗑
        </span>
      </Card.Header>

      <Card.Body>
        <img src={bbImg} width="80" alt="BBB" />
        <p><b>IP:</b> {device.ip}</p>
        <p><b>CPU:</b> {device.cpu_percent}%</p>
        <p><b>Uptime:</b> {device.uptime_sec}s</p>
        <span
          className={`badge ${
            device.status === "ONLINE" ? "bg-success" : "bg-secondary"
          }`}
        >
          {device.status}
        </span>
      </Card.Body>
    </Card>
  );
}
