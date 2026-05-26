import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "axios";

const API = "http://10.30.250.241:5000/api";

export default function BOMAddModal({ show, onHide, onSave }) {
  const [form, setForm] = useState({
    project_name: "",
    pcb_version: "",
    date: "",
    engineer_name: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.project_name || !form.pcb_version || !form.date || !form.engineer_name || !file) {
      alert("All fields and file are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("project_name", form.project_name);
      formData.append("pcb_version", form.pcb_version);
      formData.append("date", form.date);
      formData.append("engineer_name", form.engineer_name);
      formData.append("file", file);

      await axios.post(`${API}/bom`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset form
      setForm({
        project_name: "",
        pcb_version: "",
        date: "",
        engineer_name: ""
      });
      setFile(null);

      onSave();
    } catch (err) {
      console.error("Failed to add BOM:", err);
      alert("Failed to add BOM: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({
        project_name: "",
        pcb_version: "",
        date: "",
        engineer_name: ""
      });
      setFile(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Production BOM</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              placeholder="e.g., EMC-HAT-V1"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>PCB Version</Form.Label>
            <Form.Control
              type="text"
              name="pcb_version"
              value={form.pcb_version}
              onChange={handleChange}
              placeholder="e.g., 1.0, 1.1, 2.0"
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
              placeholder="e.g., John Doe"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Upload BOM File (Excel/CSV)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <small style={{ color: "#6c757d" }}>
              Supported formats: .xlsx, .xls, .csv
            </small>
            {file && (
              <div style={{ marginTop: "8px", color: "#28a745" }}>
                ✓ {file.name}
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create BOM"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
