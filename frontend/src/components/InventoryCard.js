import React from "react";

export default function InventoryCard({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 24,
        border: "1px solid #3a4a5c",
        borderRadius: 12,
        cursor: "pointer",
        background: "linear-gradient(135deg, #1e2d47 0%, #263548 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 140,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 100, 200, 0.2)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#0066cc";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#3a4a5c";
      }}
      title={title}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 0% 0%, rgba(0, 100, 200, 0.1) 0%, transparent 50%)",
        pointerEvents: "none"
      }} />
      <h5 style={{ 
        margin: 0,
        color: "#b0c4de",
        fontSize: "16px",
        fontWeight: "600",
        textAlign: "center",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
        position: "relative"
      }}>
        {title}
      </h5>
    </div>
  );
}
