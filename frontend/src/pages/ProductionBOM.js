import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import BOMAddModal from "../components/BOMAddModal";
import BOMCard from "../components/BOMCard";
import "./ProductionBOM.css";

const API = "http://10.30.250.241:5000/api";

export default function ProductionBOM() {
  const [boms, setBOMs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = async () => {
    try {
      const res = await axios.get(`${API}/bom`);
      setBOMs(res.data);
    } catch (err) {
      console.error("Failed to load BOMs:", err);
    }
  };

  const handleAddBOM = async () => {
    await loadBOMs();
    setShowAdd(false);
  };

  const handleDeleteBOM = async (bomId) => {
    if (window.confirm("Are you sure you want to delete this BOM?")) {
      try {
        await axios.delete(`${API}/bom/${bomId}`);
        await loadBOMs();
      } catch (err) {
        console.error("Failed to delete BOM:", err);
      }
    }
  };

  return (
    <div className="production-bom-container">
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontWeight: "600", color: "#1a1a2e", marginBottom: "20px" }}>
          Production BOM
        </h3>
      </div>

      {boms.length === 0 ? (
        <div className="empty-state">
          <div className="add-bom-button" onClick={() => setShowAdd(true)}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>➕</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Add BOM</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              ➕ Add BOM
            </Button>
          </div>
          <div className="bom-grid">
            {boms.map((bom) => (
              <BOMCard
                key={bom.bom_id}
                bom={bom}
                onDelete={handleDeleteBOM}
              />
            ))}
          </div>
        </>
      )}

      <BOMAddModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleAddBOM} />
    </div>
  );
}
