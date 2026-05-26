import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

export default function ImageUpload({ onImageSelect, selectedImage }) {
  const [recentImages, setRecentImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = async () => {
    try {
      const res = await axios.get("/api/images/recent");
      setRecentImages(res.data || []);
    } catch (err) {
      console.error("Failed to load recent images:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.image_url) {
        onImageSelect(res.data.image_url);
        await loadRecentImages();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Form.Group>
        <Form.Label style={{ fontWeight: "600" }}>Item Image</Form.Label>

        {/* Current Image Preview */}
        {selectedImage && (
          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f9f9f9"
            }}
          >
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
              Current Image:
            </div>
            <img
              src={`/api/images/${selectedImage}`}
              alt="selected"
              style={{
                maxWidth: "150px",
                maxHeight: "150px",
                borderRadius: "4px"
              }}
            />
          </div>
        )}

        {/* Upload Section */}
        <div style={{ marginBottom: "16px" }}>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ cursor: uploading ? "not-allowed" : "pointer" }}
          />
          {uploading && (
            <small style={{ color: "#0f3460", marginTop: "4px", display: "block" }}>
              Uploading...
            </small>
          )}
        </div>

        {/* Recent Images */}
        {recentImages.length > 0 && (
          <div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", fontWeight: "600" }}>
              Recent Uploads (click to select):
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                padding: "8px",
                background: "#f9f9f9",
                borderRadius: "6px",
                border: "1px solid #eee"
              }}
            >
              {recentImages.map((img) => (
                <div
                  key={img}
                  onClick={() => onImageSelect(img)}
                  style={{
                    flex: "0 0 auto",
                    cursor: "pointer",
                    border: selectedImage === img ? "2px solid #0f3460" : "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px",
                    background: selectedImage === img ? "#e3f2fd" : "#fff",
                    transition: "all 0.2s"
                  }}
                  title={img}
                >
                  <img
                    src={`/api/images/${img}`}
                    alt="recent"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "2px"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Form.Group>
    </div>
  );
}
