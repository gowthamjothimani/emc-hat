import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import ImageUpload from "./ImageUpload";

export default function EditableInventoryCard({
  item,
  invType,
  onUpdate,
  onDelete,
  onEdit,
  fields,
  categories
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(item);
  const [selectedImage, setSelectedImage] = useState(item.image_url || "");

  const handleEditChange = (k, v) => {
    setEditForm(s => ({ ...s, [k]: v }));
  };

  const handleSaveEdit = async () => {
    try {
      const submitData = { ...editForm };
      if (selectedImage) {
        submitData.image_url = selectedImage;
      }
      await axios.put(`/api/inventory/${invType}/${encodeURIComponent(item.item_id)}`, submitData);
      onUpdate(submitData);
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${item.item_id}?`)) {
      try {
        await axios.delete(`/api/inventory/${invType}/${encodeURIComponent(item.item_id)}`);
        onDelete(item);
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  return (
    <>
      <div
        style={{
          minWidth: 300,
          border: "1px solid #3a4a5c",
          padding: 14,
          borderRadius: 10,
          background: "linear-gradient(135deg, #1e2d47 0%, #263548 100%)",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          color: "#e0e0e0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 100, 200, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = "#0066cc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "#3a4a5c";
        }}
      >
        {/* Background gradient accent */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(0, 100, 200, 0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Image Section */}
        {item.image_url && (
          <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', position: "relative" }}>
            <img
              src={`/api/images/${item.image_url}`}
              alt={item.item_id}
              style={{
                width: '100%',
                height: '140px',
                objectFit: 'cover',
                transition: "transform 0.3s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        )}

        {/* Content Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            {/* Item ID */}
            <div style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#90ee90",
              fontFamily: "monospace",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {item.item_id}
            </div>
            
            {/* Category Badge */}
            {item.category && (
              <div style={{
                display: "inline-block",
                fontSize: "11px",
                color: "#fff",
                backgroundColor: "#0066cc",
                padding: "2px 8px",
                borderRadius: "4px",
                marginBottom: 6,
                fontWeight: "600"
              }}>
                {item.category}
              </div>
            )}
            
            {/* Item Name */}
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: 6, color: "#b0c4de" }}>
              {item.item_name}
            </div>
            
            {/* Description */}
            {item.description && (
              <div style={{
                fontSize: "12px",
                color: "#999",
                marginBottom: 8,
                maxHeight: 40,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.4"
              }}>
                {item.description}
              </div>
            )}
            
            {/* Location */}
            {item.location && (
              <div style={{
                fontSize: "12px",
                color: "#87ceeb",
                marginBottom: 6,
                fontWeight: "500"
              }}>
                📍 {item.location}
              </div>
            )}
            
            {/* Quantity */}
            <div style={{ fontSize: "12px", color: "#ffd700", fontWeight: "600" }}>
              📦 Qty: <strong>{item.quantity} {item.unit || ""}</strong>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditForm(item);
                setSelectedImage(item.image_url || "");
                setShowEdit(true);
              }}
              title="Edit"
              style={{
                border: "1px solid #0066cc",
                background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0, 102, 204, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0052a3 0%, #003d80 100%)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 102, 204, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 102, 204, 0.3)";
              }}
            >
              ✎ Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="Delete"
              style={{
                border: "1px solid #d32f2f",
                background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(211, 47, 47, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #b71c1c 0%, #8b0000 100%)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(211, 47, 47, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(211, 47, 47, 0.3)";
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit {item.item_id}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Form>
            <Row style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid #ddd" }}>
              <Col md={12}>
                <Form.Group>
                  <Form.Label><strong>Category</strong></Form.Label>
                  <Form.Select
                    value={editForm.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                  >
                    <option value="">-- Select Category --</option>
                    {categories && categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Image Upload Section */}
            <Row style={{ marginBottom: 20 }}>
              <Col md={12}>
                <ImageUpload onImageSelect={setSelectedImage} selectedImage={selectedImage} />
              </Col>
            </Row>

            <Row>
              {fields.map((f) => (
                <Col md={f.name === "description" ? 12 : 6} key={f.name} style={{ marginBottom: 10 }}>
                  <Form.Group>
                    <Form.Label>{f.label}</Form.Label>
                    {f.type === "textarea" ? (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editForm[f.name] || ""}
                        onChange={(e) => handleEditChange(f.name, e.target.value)}
                      />
                    ) : (
                      <Form.Control
                        type={f.type ?? "text"}
                        value={editForm[f.name] || ""}
                        onChange={(e) => handleEditChange(f.name, e.target.value)}
                      />
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
