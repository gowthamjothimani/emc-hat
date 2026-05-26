import { Navbar } from "react-bootstrap";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <Navbar 
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid #0f3460',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }} 
      variant="dark" 
      className="px-4 app-header"
    >
      <img src={logo} alt="logo" width="40" className="me-3" />
      <Navbar.Brand style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>
        EMC – Hardware Assessment Tool
      </Navbar.Brand>
    </Navbar>
  );
}
