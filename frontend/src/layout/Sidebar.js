import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const menus = [
  { name: "Dashboard", path: "/" },
  { name: "Test Log", path: "/test-log" },
  { name: "Inventory", path: "/inventory" },
  { name: "Production BOM", path: "/bom" },
  { name: "Device Testing", path: "/device-config" },
  { name: "PCBA Assist", path: "/pcba-assist" },
  { name: "Settings", path: "/settings" },
  { name: "About", path: "/about" }
];

export default function Sidebar() {
  return (
    <Nav 
      className="flex-column sidebar-nav vh-100 p-3" 
      style={{ 
        width: 260,
        background: 'linear-gradient(180deg, #2a2a3e 0%, #262633 100%)',
        borderRight: '1px solid #1a1a2e'
      }}
    >
      {menus.map(m => (
        <Nav.Link 
          as={Link} 
          to={m.path} 
          key={m.name} 
          style={{ 
            color: '#b8b8cc',
            fontSize: '14px',
            fontWeight: '500',
            padding: '10px 12px',
            margin: '4px 0',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            borderLeft: '3px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#3a3a50';
            e.target.style.color = '#fff';
            e.target.style.borderLeftColor = '#0f3460';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#b8b8cc';
            e.target.style.borderLeftColor = 'transparent';
          }}
        >
          {m.name}
        </Nav.Link>
      ))}
    </Nav>
  );
}
