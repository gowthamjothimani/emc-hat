export default function TestLogCard({ index, data, onOpen, onDelete }) {
  
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1.2fr 1fr 1fr 100px 160px 40px",
        gap: "16px",
        padding: "14px 20px",
        marginBottom: "10px",
        border: "1px solid #555",
        background: "#1e2d47",
        borderRadius: "8px",
        cursor: "pointer",
        alignItems: "center",
        fontSize: "14px",
        color: "#e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        marginLeft: "0px",
        marginRight: "0px"
      }}
      onClick={onOpen}
      title={`PCB: ${data.pcb_serial}\nModel: ${data.model}\nProject: ${data.project}`}
    >
      <span style={{ 
        textAlign: "center", 
        fontWeight: "bold",
        color: "#b0c4de"
      }}>
        {index}
      </span>
      <span style={{ 
        overflow: "hidden", 
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "monospace",
        fontSize: "13px"
      }}>
        {data.pcb_serial}
      </span>
      <span style={{ 
        overflow: "hidden", 
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "monospace",
        fontSize: "13px"
      }}>
        {data.model}
      </span>
      <span style={{ 
        overflow: "hidden", 
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}>
        {data.project}
      </span>
      <span style={{ 
        fontWeight: "bold",
        padding: "6px 10px",
        borderRadius: "4px",
        textAlign: "center",
        backgroundColor: data.qc === "PASSED" ? "#2e7d32" : data.qc === "FAILED" ? "#c62828" : "#f57c00",
        color: "#fff",
        fontSize: "12px",
        minWidth: "90px"
      }}>
        {data.qc}
      </span>
      <span style={{ 
        fontSize: "12px", 
        color: "#999",
        fontFamily: "monospace",
        minWidth: "140px"
      }}>
        {data.timestamp}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          background: "#d32f2f",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "14px",
          fontWeight: "bold",
          transition: "background 0.2s",
          minWidth: "40px"
        }}
        onMouseEnter={(e) => e.target.style.background = "#b71c1c"}
        onMouseLeave={(e) => e.target.style.background = "#d32f2f"}
      >
        🗑
      </button>
    </div>
  );
}
