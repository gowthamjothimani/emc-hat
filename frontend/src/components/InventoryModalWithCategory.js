import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import ImageUpload from "./ImageUpload";

export default function InventoryModalWithCategory({
  show,
  onHide,
  fields,
  onSave,
  title,
  invType,
  onCategoryAdded
}) {
  const initial = fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});
  const [form, setForm] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Load categories when modal opens
  useEffect(() => {
    if (show && invType) {
      loadCategories();
    }
    setForm(initial);
    setShowNewCategoryInput(false);
    setNewCategory("");
    setSelectedImage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`/api/categories/${invType}`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await axios.post(`/api/categories/${invType}`, {
        category_name: newCategory
      });
      await loadCategories();
      setForm(s => ({ ...s, category: newCategory }));
      setNewCategory("");
      setShowNewCategoryInput(false);
      if (onCategoryAdded) onCategoryAdded();
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  const handle = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = () => {
    const submitData = { ...form };
    if (selectedImage) {
      submitData.image_url = selectedImage;
    }
    console.log("Saving item:", submitData);
    onSave(submitData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title ?? "Add Item"}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form>
          {/* Category Section */}
          <Row style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid #ddd" }}>
            <Col md={12}>
              <Form.Group>
                <Form.Label><strong>Category</strong></Form.Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Select
                    value={form.category}
                    onChange={(e) => handle("category", e.target.value)}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + Add
                  </Button>
                </div>
                {showNewCategoryInput && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <Form.Control
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button
                      variant="success"
                      onClick={addNewCategory}
                      size="sm"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Create
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Image Upload Section */}
          <Row style={{ marginBottom: 20 }}>
            <Col md={12}>
              <ImageUpload onImageSelect={setSelectedImage} selectedImage={selectedImage} />
            </Col>
          </Row>

          {/* Item Fields */}
          <Row>
            {fields.map((f) => (
              <Col md={f.name === "description" ? 12 : 6} key={f.name} style={{ marginBottom: 10 }}>
                <Form.Group>
                  <Form.Label>{f.label}</Form.Label>
                  {f.type === "textarea" ? (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form[f.name]}
                      onChange={(e) => handle(f.name, e.target.value)}
                      placeholder={f.placeholder ?? ""}
                    />
                  ) : (
                    <Form.Control
                      type={f.type ?? "text"}
                      value={form[f.name]}
                      onChange={(e) => handle(f.name, e.target.value)}
                      placeholder={f.placeholder ?? ""}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
