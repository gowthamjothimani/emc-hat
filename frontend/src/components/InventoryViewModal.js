import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function InventoryViewModal({ show, onHide, item }) {
  if (!item) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{item.item_name ?? item.name ?? "Item Details"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.entries(item).map(([k, v]) => (
          <p key={k}>
            <strong>{k.replaceAll("_", " ")}: </strong>
            {v ?? "--"}
          </p>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
