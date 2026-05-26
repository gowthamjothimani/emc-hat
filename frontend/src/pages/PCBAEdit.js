import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Spinner, Alert } from "react-bootstrap";

const API_BASE = "http://10.30.250.241:5000";
const ALLOWED_PCB_EXTENSIONS = {
  kicad_sch: "KiCAD Schematic",
  kicad_pcb: "KiCAD PCB",
  sch: "Schematic",
  brd: "Board",
  gbp: "Gerber (Top)",
  gbl: "Gerber (Bottom)",
  pdf: "PDF"
};

export default function PCBAEdit() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    project_name: "",
    board_name: "",
    description: "",
    pcb_version: "",
    created_by: ""
  });

  const [files, setFiles] = useState({
    schematic_file: null,
    board_file: null
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDesign();
  }, [designId]);

  const fetchDesign = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/pcba/${designId}`);
      const design = response.data;
      setFormData({
        project_name: design.project_name,
        board_name: design.board_name,
        description: design.description || "",
        pcb_version: design.pcb_version,
        created_by: design.created_by
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching design:", err);
      setError(err.response?.data?.error || "Failed to load design");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (file) {
      const fileExt = file.name.split(".").pop().toLowerCase();
      const isValid = Object.keys(ALLOWED_PCB_EXTENSIONS).includes(fileExt);

      if (!isValid) {
        setError(
          `Invalid file format. Allowed: ${Object.keys(ALLOWED_PCB_EXTENSIONS).join(", ")}`
        );
        e.target.value = "";
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [name]: file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.project_name ||
      !formData.board_name ||
      !formData.pcb_version ||
      !formData.created_by
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submitData = new FormData();
      submitData.append("project_name", formData.project_name);
      submitData.append("board_name", formData.board_name);
      submitData.append("description", formData.description);
      submitData.append("pcb_version", formData.pcb_version);
      submitData.append("created_by", formData.created_by);

      if (files.schematic_file) {
        submitData.append("schematic_file", files.schematic_file);
      }
      if (files.board_file) {
        submitData.append("board_file", files.board_file);
      }

      await axios.put(`${API_BASE}/api/pcba/${designId}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess("Design updated successfully!");
      setTimeout(() => navigate(`/pcba/${designId}`), 1500);
    } catch (err) {
      console.error("Error updating design:", err);
      setError(err.response?.data?.error || "Failed to update design");
    } finally {
      setSubmitting(false);
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

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h2 style={{ marginBottom: "24px", color: "#1a1a2e" }}>
        Edit PCBA Design
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Project Name */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>Project Name *</Form.Label>
          <Form.Control
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleInputChange}
            placeholder="e.g., EMC Test Board"
            required
          />
        </Form.Group>

        {/* Board Name */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>Board Name *</Form.Label>
          <Form.Control
            type="text"
            name="board_name"
            value={formData.board_name}
            onChange={handleInputChange}
            placeholder="e.g., Main Control"
            required
          />
        </Form.Group>

        {/* Description */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Design notes and details..."
          />
        </Form.Group>

        {/* PCB Version */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>PCB Version *</Form.Label>
          <Form.Control
            type="text"
            name="pcb_version"
            value={formData.pcb_version}
            onChange={handleInputChange}
            placeholder="e.g., 1.0"
            required
          />
        </Form.Group>

        {/* Created By */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>Created By *</Form.Label>
          <Form.Control
            type="text"
            name="created_by"
            value={formData.created_by}
            onChange={handleInputChange}
            placeholder="Your name"
            required
          />
        </Form.Group>

        {/* Schematic File */}
        <Form.Group style={{ marginBottom: "16px" }}>
          <Form.Label style={{ fontWeight: "500" }}>
            Schematic File (Optional)
          </Form.Label>
          <Form.Control
            type="file"
            name="schematic_file"
            onChange={handleFileChange}
            accept={Object.keys(ALLOWED_PCB_EXTENSIONS).map((ext) => `.${ext}`).join(",")}
          />
          <small style={{ color: "#6c757d", marginTop: "4px", display: "block" }}>
            Supported: {Object.keys(ALLOWED_PCB_EXTENSIONS).join(", ")}
          </small>
          {files.schematic_file && (
            <small style={{ color: "#28a745", marginTop: "4px", display: "block" }}>
              ✓ Selected: {files.schematic_file.name}
            </small>
          )}
        </Form.Group>

        {/* Board File */}
        <Form.Group style={{ marginBottom: "24px" }}>
          <Form.Label style={{ fontWeight: "500" }}>
            Board File (Optional)
          </Form.Label>
          <Form.Control
            type="file"
            name="board_file"
            onChange={handleFileChange}
            accept={Object.keys(ALLOWED_PCB_EXTENSIONS).map((ext) => `.${ext}`).join(",")}
          />
          <small style={{ color: "#6c757d", marginTop: "4px", display: "block" }}>
            Supported: {Object.keys(ALLOWED_PCB_EXTENSIONS).join(", ")}
          </small>
          {files.board_file && (
            <small style={{ color: "#28a745", marginTop: "4px", display: "block" }}>
              ✓ Selected: {files.board_file.name}
            </small>
          )}
        </Form.Group>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              background: "#0f3460",
              border: "none",
              padding: "10px"
            }}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{ marginRight: "8px" }}
                />
                Saving...
              </>
            ) : (
              "💾 Save Changes"
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate(`/pcba/${designId}`)}
            disabled={submitting}
            style={{ flex: 1, padding: "10px" }}
          >
            ← Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
