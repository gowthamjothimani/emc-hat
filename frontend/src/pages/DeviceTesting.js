import React, { useState, useEffect } from "react";
import { Button, InputGroup, FormControl, Form } from "react-bootstrap";
import axios from "axios";

const API = "http://10.30.250.241:5000/api";

export default function DeviceTesting() {
  const [devices, setDevices] = useState([]);
  const [selectedIp, setSelectedIp] = useState("");
  const [manualIp, setManualIp] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [connected, setConnected] = useState(false);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const res = await axios.get(`${API}/devices`);
      setDevices(res.data);
      console.log("Devices loaded:", res.data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  };

  const handleConnect = () => {
    const ip = useManual ? manualIp : selectedIp;
    
    if (!ip || !ip.trim()) {
      alert("Please enter or select an IP address");
      return;
    }

    setSelectedIp(ip);
    setConnected(true);
    console.log(`Connected to device: ${ip}:5000`);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setSelectedIp("");
    setManualIp("");
    setUseManual(false);
    console.log("Disconnected from device");
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: "600", color: "#1a1a2e", marginBottom: "16px" }}>
          Device Testing
        </h3>

        {!connected ? (
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}
          >
            <h5 style={{ marginBottom: "16px", color: "#495057" }}>
              Select or Enter Device IP
            </h5>

            {/* Toggle between dropdown and manual input */}
            <Form.Group style={{ marginBottom: "16px" }}>
              <Form.Check
                type="radio"
                label="Select from active devices"
                name="inputMode"
                checked={!useManual}
                onChange={() => setUseManual(false)}
              />
              <Form.Check
                type="radio"
                label="Enter IP manually"
                name="inputMode"
                checked={useManual}
                onChange={() => setUseManual(true)}
              />
            </Form.Group>

            {/* Device dropdown */}
            {!useManual && (
              <Form.Group style={{ marginBottom: "16px" }}>
                <Form.Label>Active Devices</Form.Label>
                <Form.Select
                  value={selectedIp}
                  onChange={(e) => setSelectedIp(e.target.value)}
                >
                  <option value="">-- Select a device --</option>
                  {devices.map((d) => (
                    <option key={d.hostname} value={d.ip}>
                      {d.hostname} ({d.ip}) - {d.status}
                    </option>
                  ))}
                </Form.Select>
                {devices.length === 0 && (
                  <small style={{ color: "#dc3545" }}>
                    No active devices found. Check Dashboard first.
                  </small>
                )}
              </Form.Group>
            )}

            {/* Manual IP input */}
            {useManual && (
              <Form.Group style={{ marginBottom: "16px" }}>
                <Form.Label>BeagleBone IP Address</Form.Label>
                <InputGroup>
                  <FormControl
                    placeholder="e.g., 192.168.1.100"
                    value={manualIp}
                    onChange={(e) => setManualIp(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                  />
                  <span
                    style={{
                      background: "#e9ecef",
                      padding: "8px 12px",
                      border: "1px solid #dee2e6",
                      borderRadius: "0 4px 4px 0",
                      color: "#6c757d"
                    }}
                  >
                    :5000
                  </span>
                </InputGroup>
              </Form.Group>
            )}

            <Button
              variant="primary"
              onClick={handleConnect}
              style={{ marginTop: "8px" }}
            >
              Connect
            </Button>
          </div>
        ) : (
          <div
            style={{
              background: "#d4edda",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #c3e6cb",
              color: "#155724",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <strong>Connected to:</strong> {selectedIp}:5000
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDisconnect}
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              ✕ Close
            </Button>
          </div>
        )}
      </div>

      {/* Embedded webpage viewer */}
      {connected && (
        <div
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <iframe
            src={`http://${selectedIp}:5000`}
            style={{
              width: "100%",
              height: "700px",
              border: "none",
              display: "block"
            }}
            title="Device Interface"
            onError={(e) => {
              console.error("iframe error:", e);
            }}
          />
        </div>
      )}

      {!connected && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#6c757d",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px dashed #dee2e6"
          }}
        >
          <p>Select or enter a device IP and click Connect to view the device interface</p>
        </div>
      )}
    </div>
  );
}
