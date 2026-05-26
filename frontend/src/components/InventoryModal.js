import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function InventoryModal({ show, onHide, fields, onSave, title }) {
  const initial = fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});
  const [form, setForm] = useState(initial);

  // reset when fields change
  React.useEffect(() => setForm(initial), [show]);

  const handle = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = () => {
    console.log("Saving item:", form);
    onSave(form);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title ?? "Add Item"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {fields.map((f) => (
              <Col md={6} key={f.name} style={{ marginBottom: 10 }}>
                <Form.Group>
                  <Form.Label>{f.label}</Form.Label>
                  <Form.Control
                    type={f.type ?? "text"}
                    value={form[f.name]}
                    onChange={(e) => handle(f.name, e.target.value)}
                    placeholder={f.placeholder ?? ""}
                  />
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
