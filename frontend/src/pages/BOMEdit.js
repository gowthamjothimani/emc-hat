import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

const API = "http://10.30.250.241:5000/api";

export default function BOMEdit() {
  const { bomId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    project_name: "",
    pcb_version: "",
    date: "",
    engineer_name: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBOM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomId]);

  const loadBOM = async () => {
    try {
      const res = await axios.get(`${API}/bom/${bomId}`);
      setForm({
        project_name: res.data.project_name,
        pcb_version: res.data.pcb_version,
        date: res.data.date,
        engineer_name: res.data.engineer_name
      });
    } catch (err) {
      console.error("Failed to load BOM:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.project_name || !form.pcb_version || !form.date || !form.engineer_name) {
      alert("All fields are required");
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("project_name", form.project_name);
      formData.append("pcb_version", form.pcb_version);
      formData.append("date", form.date);
      formData.append("engineer_name", form.engineer_name);
      if (file) {
        formData.append("file", file);
      }

      await axios.put(`${API}/bom/${bomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("BOM updated successfully");
      navigate("/bom");
    } catch (err) {
      console.error("Failed to update BOM:", err);
      alert("Failed to update BOM: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading BOM details...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: "600", color: "#1a1a2e", marginBottom: "8px" }}>
          Edit BOM
        </h3>
        <Button
          variant="light"
          onClick={() => navigate("/bom")}
          style={{ fontSize: "12px" }}
        >
          ← Back to Production BOM
        </Button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
          maxWidth: "600px"
        }}
      >
        <Form>
          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>PCB Version</Form.Label>
            <Form.Control
              type="text"
              name="pcb_version"
              value={form.pcb_version}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Engineer Name</Form.Label>
            <Form.Control
              type="text"
              name="engineer_name"
              value={form.engineer_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "24px" }}>
            <Form.Label>Update BOM File (Optional)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <small style={{ color: "#6c757d" }}>
              Leave empty to keep current file
            </small>
            {file && (
              <div style={{ marginTop: "8px", color: "#28a745" }}>
                ✓ {file.name}
              </div>
            )}
          </Form.Group>
        </Form>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="secondary"
            onClick={() => navigate("/bom")}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
