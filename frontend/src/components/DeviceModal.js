import { Modal, Row, Col, Alert } from "react-bootstrap";
import DeviceCard from "./DeviceCard";

export default function DeviceModal({ show, onHide, devices, reload }) {
  return (
    <Modal size="lg" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Active Devices</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {devices.length === 0 ? (
          <Alert variant="info">
            No active devices. Waiting for device heartbeats via MQTT from broker at 10.30.250.241:1883
          </Alert>
        ) : (
          <Row>
            {devices.map(d => (
              <Col md={4} key={d.hostname}>
                <DeviceCard device={d} reload={reload} />
              </Col>
            ))}
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
}
