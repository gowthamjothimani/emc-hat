import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import DeviceModal from "../components/DeviceModal";

const API = "http://10.30.250.241:5000/api";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [show, setShow] = useState(false);
  const [inventoryCounts, setInventoryCounts] = useState({
    components: 0,
    iot: 0,
    tools: 0,
    others: 0
  });
  const [testLogCount, setTestLogCount] = useState(0);

  const loadDevices = async () => {
    try {
      const res = await axios.get(`${API}/devices`);
      setDevices(res.data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  };

  const loadInventoryCounts = async () => {
    try {
      const types = ["components", "iot", "tools", "others"];
      const counts = {};
      
      for (const type of types) {
        const res = await axios.get(`${API}/inventory/${type}`);
        counts[type] = (res.data || []).length;
      }
      
      setInventoryCounts(counts);
    } catch (err) {
      console.error("Failed to load inventory counts:", err);
    }
  };

  const loadTestLogCount = async () => {
    try {
      const res = await axios.get(`${API}/testlogs`);
      setTestLogCount((res.data || []).length);
    } catch (err) {
      console.error("Failed to load test log count:", err);
    }
  };

  useEffect(() => {
    loadDevices();
    loadInventoryCounts();
    loadTestLogCount();
    
    const i = setInterval(() => {
      loadDevices();
      loadInventoryCounts();
      loadTestLogCount();
    }, 5000);
    
    return () => clearInterval(i);
  }, []);

  const dashboardCard = (title, count, color = "#0f3460") => (
    <Card
      className="text-center shadow-sm"
      style={{
        height: 140,
        borderTop: `4px solid ${color}`,
        background: '#f8f9fa'
      }}
    >
      <Card.Body>
        <h6 style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
          {title}
        </h6>
        <h1 style={{ color: color, fontWeight: '700', margin: 0 }}>
          {count}
        </h1>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>
          System Overview
        </h3>

        <Row className="g-4">
          <Col md={3}>
            <Card
              onClick={() => setShow(true)}
              className="text-center shadow-sm"
              style={{
                height: 140,
                borderTop: '4px solid #0f3460',
                cursor: "pointer",
                background: '#f8f9fa',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
            >
              <Card.Body>
                <h6 style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                  Active Devices
                </h6>
                <h1 style={{ color: '#0f3460', fontWeight: '700', margin: 0 }}>
                  {devices.length}
                </h1>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            {dashboardCard("Tested PCB Count", testLogCount, "#28a745")}
          </Col>

          <Col md={3}>
            {dashboardCard("Components", inventoryCounts.components, "#007bff")}
          </Col>

          <Col md={3}>
            {dashboardCard("IoT Devices", inventoryCounts.iot, "#6f42c1")}
          </Col>
        </Row>
      </div>

      <div>
        <h3 style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>
          Inventory Summary
        </h3>

        <Row className="g-4">
          <Col md={3}>
            {dashboardCard("Testing Tools", inventoryCounts.tools, "#fd7e14")}
          </Col>

          <Col md={3}>
            {dashboardCard("Other Items", inventoryCounts.others, "#dc3545")}
          </Col>

          <Col md={3}>
            {dashboardCard("Total Items", 
              Object.values(inventoryCounts).reduce((a, b) => a + b, 0),
              "#17a2b8"
            )}
          </Col>
        </Row>
      </div>

      <DeviceModal
        show={show}
        onHide={() => setShow(false)}
        devices={devices}
        reload={loadDevices}
      />
    </>
  );
}
