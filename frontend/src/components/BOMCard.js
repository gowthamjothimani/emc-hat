import React from "react";
import { useNavigate } from "react-router-dom";

export default function BOMCard({ bom, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        padding: "16px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Card Header */}
      <div style={{ marginBottom: "12px" }}>
        <h5 style={{ margin: 0, color: "#1a1a2e", fontWeight: "600" }}>
          {bom.project_name}
        </h5>
        <small style={{ color: "#6c757d" }}>ID: {bom.bom_id}</small>
      </div>

      {/* Card Details */}
      <div style={{ marginBottom: "16px", fontSize: "13px", color: "#495057" }}>
        <div style={{ marginBottom: "6px" }}>
          <strong>PCB Version:</strong> {bom.pcb_version}
        </div>
        <div style={{ marginBottom: "6px" }}>
          <strong>Date:</strong> {bom.date}
        </div>
        <div style={{ marginBottom: "6px" }}>
          <strong>Engineer:</strong> {bom.engineer_name}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => navigate(`/bom/${bom.bom_id}`)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #0f3460",
            background: "#0f3460",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#0a2340";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#0f3460";
          }}
        >
          👁 View
        </button>

        <button
          onClick={() => navigate(`/bom/${bom.bom_id}/edit`)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ffc107",
            background: "#ffc107",
            color: "#000",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#e0a800";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ffc107";
          }}
        >
          ✎ Edit
        </button>

        <button
          onClick={() => onDelete(bom.bom_id)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #dc3545",
            background: "#dc3545",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#c82333";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#dc3545";
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
