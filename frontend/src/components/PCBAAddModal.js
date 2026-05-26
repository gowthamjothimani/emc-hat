import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "axios";

const API = "http://10.30.250.241:5000/api";

export default function PCBAAddModal({ show, onHide, onSave }) {
  const [form, setForm] = useState({
    project_name: "",
    board_name: "",
    description: "",
    pcb_version: "",
    created_by: ""
  });
  const [schematicFile, setSchematicFile] = useState(null);
  const [boardFile, setBoardFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleSchematicChange = (e) => {
    setSchematicFile(e.target.files[0]);
  };

  const handleBoardChange = (e) => {
    setBoardFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.project_name || !form.board_name || !form.pcb_version || !form.created_by) {
      alert("Project name, board name, PCB version, and creator are required");
      return;
    }

    if (!schematicFile && !boardFile) {
      alert("At least one file (schematic or board) is required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("project_name", form.project_name);
      formData.append("board_name", form.board_name);
      formData.append("description", form.description);
      formData.append("pcb_version", form.pcb_version);
      formData.append("created_by", form.created_by);
      
      if (schematicFile) {
        formData.append("schematic_file", schematicFile);
      }
      if (boardFile) {
        formData.append("board_file", boardFile);
      }

      await axios.post(`${API}/pcba`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset form
      setForm({
        project_name: "",
        board_name: "",
        description: "",
        pcb_version: "",
        created_by: ""
      });
      setSchematicFile(null);
      setBoardFile(null);

      onSave();
    } catch (err) {
      console.error("Failed to add design:", err);
      alert("Failed to add design: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({
        project_name: "",
        board_name: "",
        description: "",
        pcb_version: "",
        created_by: ""
      });
      setSchematicFile(null);
      setBoardFile(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add PCB Design</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Project Name *</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              placeholder="e.g., EMC-HAT-V1"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Board Name *</Form.Label>
            <Form.Control
              type="text"
              name="board_name"
              value={form.board_name}
              onChange={handleChange}
              placeholder="e.g., Main Board, Power Board"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>PCB Version *</Form.Label>
            <Form.Control
              type="text"
              name="pcb_version"
              value={form.pcb_version}
              onChange={handleChange}
              placeholder="e.g., 1.0, 1.1, 2.0"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Created By *</Form.Label>
            <Form.Control
              type="text"
              name="created_by"
              value={form.created_by}
              onChange={handleChange}
              placeholder="Your name"
            />
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Schematic File (KiCAD/PDF)</Form.Label>
            <Form.Control
              type="file"
              accept=".kicad_sch,.sch,.pdf"
              onChange={handleSchematicChange}
            />
            <small style={{ color: "#6c757d" }}>
              Supported: .kicad_sch, .sch, .pdf
            </small>
            {schematicFile && (
              <div style={{ marginTop: "8px", color: "#28a745" }}>
                ✓ {schematicFile.name}
              </div>
            )}
          </Form.Group>

          <Form.Group style={{ marginBottom: "16px" }}>
            <Form.Label>Board File (KiCAD/Gerber)</Form.Label>
            <Form.Control
              type="file"
              accept=".kicad_pcb,.brd,.gbp,.gbl"
              onChange={handleBoardChange}
            />
            <small style={{ color: "#6c757d" }}>
              Supported: .kicad_pcb, .brd, .gbp, .gbl
            </small>
            {boardFile && (
              <div style={{ marginTop: "8px", color: "#28a745" }}>
                ✓ {boardFile.name}
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
          {loading ? "Creating..." : "Create Design"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
