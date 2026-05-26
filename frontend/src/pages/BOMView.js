import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";

const API = "http://10.30.250.241:5000/api";

export default function BOMView() {
  const { bomId } = useParams();
  const navigate = useNavigate();
  const [bom, setBom] = useState(null);
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBOM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomId]);

  const loadBOM = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/bom/${bomId}`);
      setBom(res.data);

      // Download and parse the Excel file
      if (res.data.file_path) {
        await parseBOMFile(res.data.file_path);
      }
    } catch (err) {
      console.error("Failed to load BOM:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseBOMFile = async (filePath) => {
    try {
      // Fetch the file
      const response = await axios.get(`${API}/bom/${bomId}/file`, {
        responseType: "arraybuffer"
      });

      const workbook = XLSX.read(response.data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Extract columns: Part, Value, Device Count (or similar names)
      const processed = data.map(row => {
        const part = row.Part || row.part || row.Part_Number || row.part_number || "";
        const value = row.Value || row.value || row.Description || row.description || "";
        const deviceCount = row["Device Count"] || row.device_count || row.Qty || row.qty || 0;

        return { part, value, deviceCount };
      }).filter(item => item.part); // Filter out empty rows

      setBomData(processed);
    } catch (err) {
      console.error("Failed to parse BOM file:", err);
      setBomData([]);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading BOM details...
      </div>
    );
  }

  if (!bom) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        BOM not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontWeight: "600", color: "#1a1a2e", marginBottom: "8px" }}>
            {bom.project_name}
          </h3>
          <Button
            variant="light"
            onClick={() => navigate("/bom")}
            style={{ fontSize: "12px" }}
          >
            ← Back to Production BOM
          </Button>
        </div>
      </div>

      {/* BOM Details */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #e9ecef"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>
              BOM ID
            </div>
            <div style={{ color: "#1a1a2e", fontWeight: "600", fontSize: "16px" }}>
              {bom.bom_id}
            </div>
          </div>

          <div>
            <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>
              PCB Version
            </div>
            <div style={{ color: "#1a1a2e", fontWeight: "600", fontSize: "16px" }}>
              {bom.pcb_version}
            </div>
          </div>

          <div>
            <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>
              Date
            </div>
            <div style={{ color: "#1a1a2e", fontWeight: "600", fontSize: "16px" }}>
              {bom.date}
            </div>
          </div>

          <div>
            <div style={{ color: "#6c757d", fontSize: "12px", marginBottom: "4px" }}>
              Engineer
            </div>
            <div style={{ color: "#1a1a2e", fontWeight: "600", fontSize: "16px" }}>
              {bom.engineer_name}
            </div>
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
            fontWeight: "600",
            color: "#1a1a2e"
          }}
        >
          Bill of Materials
        </div>

        {bomData.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>
            No BOM data found or unable to parse file
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px"
              }}
            >
              <thead>
                <tr style={{ background: "#f1f3f5" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      borderBottom: "2px solid #dee2e6"
                    }}
                  >
                    Part Number
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#495057",
                      borderBottom: "2px solid #dee2e6"
                    }}
                  >
                    Value / Description
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#495057",
                      borderBottom: "2px solid #dee2e6"
                    }}
                  >
                    Device Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {bomData.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #e9ecef",
                      background: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                    }}
                  >
                    <td style={{ padding: "12px 16px", color: "#1a1a2e", fontWeight: "500" }}>
                      {item.part}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#495057" }}>
                      {item.value}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        color: "#0f3460",
                        fontWeight: "600"
                      }}
                    >
                      {item.deviceCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {bomData.length > 0 && (
        <div style={{ marginTop: "24px", textAlign: "right", color: "#6c757d", fontSize: "13px" }}>
          Total Parts: <strong style={{ color: "#1a1a2e" }}>{bomData.length}</strong>
        </div>
      )}
    </div>
  );
}
