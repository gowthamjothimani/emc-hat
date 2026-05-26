import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner, Alert } from "react-bootstrap";

const API_BASE = "http://10.30.250.241:5000";

export default function PCBAView() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDesign();
  }, [designId]);

  const fetchDesign = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/pcba/${designId}`);
      setDesign(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching design:", err);
      setError(err.response?.data?.error || "Failed to load design");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div style={{ padding: "40px" }}>
        <Alert variant="danger">
          {error || "Design not found"}
        </Alert>
        <button
          onClick={() => navigate("/pcba-assist")}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#0f3460",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Back to PCBA Assist
        </button>
      </div>
    );
  }

  const getFileDownloadUrl = (fileType) => {
    return `${API_BASE}/api/pcba/${designId}/file/${fileType}`;
  };

  const getFileExtension = (filePath) => {
    if (!filePath) return "";
    return filePath.split(".").pop().toLowerCase();
  };

  const isViewableFormat = (ext) => {
    return ["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(ext);
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header Section */}
      <div
        style={{
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "2px solid #e9ecef"
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", color: "#1a1a2e" }}>
          {design.project_name}
        </h2>
        <p style={{ margin: "0", color: "#6c757d", fontSize: "14px" }}>
          Board: {design.board_name} | Version: {design.pcb_version} | By:{" "}
          {design.created_by}
        </p>
        {design.description && (
          <p style={{ margin: "8px 0 0 0", color: "#495057" }}>
            {design.description}
          </p>
        )}
      </div>

      {/* File Viewers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            design.schematic_file_path && design.board_file_path
              ? "1fr 1fr"
              : "1fr",
          gap: "24px",
          marginBottom: "24px"
        }}
      >
        {/* Schematic File */}
        {design.schematic_file_path && (
          <div
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "16px",
              background: "#f8f9fa"
            }}
          >
            <h5 style={{ marginBottom: "12px", color: "#1a1a2e" }}>
              📋 Schematic
            </h5>
            <p style={{ fontSize: "12px", color: "#6c757d", marginBottom: "12px" }}>
              File: {design.schematic_file_path.split("/").pop()}
            </p>

            {isViewableFormat(getFileExtension(design.schematic_file_path)) ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "12px"
                }}
              >
                {getFileExtension(design.schematic_file_path) === "pdf" ? (
                  <iframe
                    src={getFileDownloadUrl("schematic")}
                    style={{
                      width: "100%",
                      height: "500px",
                      border: "none"
                    }}
                    title="Schematic PDF"
                  />
                ) : (
                  <img
                    src={getFileDownloadUrl("schematic")}
                    alt="Schematic"
                    style={{
                      width: "100%",
                      maxHeight: "500px",
                      objectFit: "contain"
                    }}
                  />
                )}
              </div>
            ) : (
              <Alert variant="info" style={{ marginBottom: "12px" }}>
                File format (.{getFileExtension(design.schematic_file_path)}) not
                viewable inline. Download to view.
              </Alert>
            )}

            <a
              href={getFileDownloadUrl("schematic")}
              download
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#0f3460",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500"
              }}
            >
              ⬇ Download Schematic
            </a>
          </div>
        )}

        {/* Board File */}
        {design.board_file_path && (
          <div
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "16px",
              background: "#f8f9fa"
            }}
          >
            <h5 style={{ marginBottom: "12px", color: "#1a1a2e" }}>
              🛠 Board Layout
            </h5>
            <p style={{ fontSize: "12px", color: "#6c757d", marginBottom: "12px" }}>
              File: {design.board_file_path.split("/").pop()}
            </p>

            {isViewableFormat(getFileExtension(design.board_file_path)) ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "12px"
                }}
              >
                {getFileExtension(design.board_file_path) === "pdf" ? (
                  <iframe
                    src={getFileDownloadUrl("board")}
                    style={{
                      width: "100%",
                      height: "500px",
                      border: "none"
                    }}
                    title="Board Layout PDF"
                  />
                ) : (
                  <img
                    src={getFileDownloadUrl("board")}
                    alt="Board Layout"
                    style={{
                      width: "100%",
                      maxHeight: "500px",
                      objectFit: "contain"
                    }}
                  />
                )}
              </div>
            ) : (
              <Alert variant="info" style={{ marginBottom: "12px" }}>
                File format (.{getFileExtension(design.board_file_path)}) not
                viewable inline. Download to view.
              </Alert>
            )}

            <a
              href={getFileDownloadUrl("board")}
              download
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "#0f3460",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500"
              }}
            >
              ⬇ Download Board
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => navigate(`/pcba/${designId}/edit`)}
          style={{
            padding: "10px 20px",
            background: "#ffc107",
            color: "#000",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "14px",
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
          onClick={() => navigate("/pcba-assist")}
          style={{
            padding: "10px 20px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "14px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#5a6268";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#6c757d";
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
