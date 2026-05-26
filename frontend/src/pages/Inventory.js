import InventoryCard from "../components/InventoryCard";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const nav = useNavigate();

  const cards = [
    { title: "Common Inventory Fields", path: "/inventory/common" },
    { title: "🔌Testing Tools", path: "/inventory/tools" },
    { title: "🔬IoT & Edge Devices", path: "/inventory/iot" },
    { title: "Electronics Components", path: "/inventory/components" },
    { title: "Mechanical / Others", path: "/inventory/others" }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20 }}>
      {cards.map(c => (
        <InventoryCard
          key={c.title}
          title={c.title}
          onClick={() => nav(c.path)}
        />
      ))}
    </div>
  );
}
