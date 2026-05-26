import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import PCBAAddModal from "../components/PCBAAddModal";
import PCBACard from "../components/PCBACard";
import "./PCBAAssist.css";

const API = "http://10.30.250.241:5000/api";

export default function PCBAAssist() {
  const [designs, setDesigns] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const res = await axios.get(`${API}/pcba`);
      setDesigns(res.data);
    } catch (err) {
      console.error("Failed to load PCBA designs:", err);
    }
  };

  const handleAddDesign = async () => {
    await loadDesigns();
    setShowAdd(false);
  };

  const handleDeleteDesign = async (designId) => {
    if (window.confirm("Are you sure you want to delete this PCB design?")) {
      try {
        await axios.delete(`${API}/pcba/${designId}`);
        await loadDesigns();
      } catch (err) {
        console.error("Failed to delete design:", err);
      }
    }
  };

  return (
    <div className="pcba-assist-container">
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontWeight: "600", color: "#1a1a2e", marginBottom: "20px" }}>
          PCBA / PCB Design Assistant
        </h3>
      </div>

      {designs.length === 0 ? (
        <div className="empty-state">
          <div className="add-pcba-button" onClick={() => setShowAdd(true)}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>➕</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Add PCB Design</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              ➕ Add PCB Design
            </Button>
          </div>
          <div className="pcba-grid">
            {designs.map((design) => (
              <PCBACard
                key={design.design_id}
                design={design}
                onDelete={handleDeleteDesign}
              />
            ))}
          </div>
        </>
      )}

      <PCBAAddModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleAddDesign} />
    </div>
  );
}
