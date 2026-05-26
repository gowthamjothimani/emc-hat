import { useEffect, useState } from "react";
import axios from "axios";

export default function TestLogModal({ id, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`/api/testlogs/${id}`).then((res) => {
      console.log("Modal data:", res.data);
      setData(res.data);
    });
  }, [id]);

  if (!data) return null;

  // Extract test details
  const testDetails = data?.test_details || {};
  const pcbSerial = testDetails.pcbserial || "--";
  const modelNumber = testDetails.modelnumber || "--";
  const projectDetail = testDetails.projectdetail || "--";
  const testerName = testDetails.testername || "--";
  const qcStatus = data?.qc_status || "--";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={{ float: "right", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✖</button>

        {/* Header with test details */}
        <div style={{ 
          background: "#1e2d47", 
          color: "#e0e0e0", 
          padding: "16px", 
          borderRadius: "6px",
          marginBottom: "20px"
        }}>
          <h2 style={{ margin: "0 0 12px 0", color: "#b0c4de" }}>Test Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
            <div>
              <strong>PCB Serial:</strong> <span style={{ fontFamily: "monospace", color: "#90ee90" }}>{pcbSerial}</span>
            </div>
            <div>
              <strong>Model:</strong> <span style={{ fontFamily: "monospace", color: "#90ee90" }}>{modelNumber}</span>
            </div>
            <div>
              <strong>Project:</strong> <span style={{ color: "#87ceeb" }}>{projectDetail}</span>
            </div>
            <div>
              <strong>Tester:</strong> <span style={{ color: "#ffd700" }}>{testerName}</span>
            </div>
            <div style={{ gridColumn: "1" }}>
              <strong>QC Status:</strong> <span style={{ 
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: qcStatus === "PASSED" ? "#2e7d32" : qcStatus === "FAILED" ? "#c62828" : "#f57c00",
                color: "#fff",
                fontWeight: "bold"
              }}>
                {qcStatus}
              </span>
            </div>
          </div>
        </div>

        <Section title="🧠 System Check">
          {renderSection(data["system-check"])}
        </Section>

        <Section title="🔍 Board Inspection">
          {renderSection(data["board-inspection-status"])}
        </Section>

        <Section title="⛽ Gas Status">
          {renderSection(data["gas-status"])}
        </Section>

        <Section title="🔌 eFuse ON">
          {renderSection(data["efuse-turn-on-status"])}
        </Section>

        <Section title="🔌 eFuse OFF">
          {renderSection(data["efuse-turn-off-status"])}
        </Section>

        <Section title="⚠️ eFuse Fault Status">
          {renderSection(data["efuse-fault-status"])}
        </Section>

        <Section title="🪪 Card Reader">
          {renderSection(data["card-reader-status"])}
        </Section>

        <Section title="🚨 Alarm">
          {renderSection(data["alarm-status"])}
        </Section>

        <Section title="🔁 Relay Status">
          {renderSection(data["relay-status"])}
        </Section>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function renderSection(obj) {
  if (!obj || Object.keys(obj).length === 0) {
    return <p style={{ color: "#888" }}>-- Not tested --</p>;
  }

  return Object.entries(obj).map(([k, v]) => (
    <p key={k}>
      <strong>{k.replaceAll("_", " ")}:</strong> {v ?? "--"}
    </p>
  ));
}

/* ---------- styles ---------- */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  width: "650px",
  borderRadius: "8px",
  maxHeight: "80vh",
  overflowY: "auto",
};
