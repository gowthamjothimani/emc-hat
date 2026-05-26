import React, { useState, useEffect } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import InventoryModalWithCategory from "../components/InventoryModalWithCategory";
import InventoryViewModal from "../components/InventoryViewModal";
import EditableInventoryCard from "../components/EditableInventoryCard";

const fields = [
  { name: "item_id", label: "Item ID" },
  { name: "category", label: "Category" },
  { name: "item_name", label: "Item Name" },
  { name: "description", label: "Description / Specifications" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "condition", label: "Condition" },
  { name: "location", label: "Location" },
  { name: "assigned_to", label: "Assigned To / Used In" },
  { name: "purchase_date", label: "Purchase Date", type: "date" },
  { name: "vendor", label: "Vendor / Source" },
  { name: "remarks", label: "Remarks" }
];

export default function CommonInventory() {
  const [showAdd, setShowAdd] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`/api/categories/common`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const load = async (q) => {
    try {
      const res = await axios.get(`/api/inventory/common${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const save = async (data) => {
    try {
      await axios.post(`/api/inventory/common`, data);
      await load(search);
    } catch (err) {
      console.error(err);
    }
  };

  const doDelete = async (it) => {
    try {
      await axios.delete(`/api/inventory/common/${encodeURIComponent(it.item_id)}`);
      await load(search);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewItem = (it) => {
    setSelected(it);
    setShowView(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Common Inventory Fields</h3>
        <Button onClick={() => setShowAdd(true)}>Add</Button>
      </div>

      <InputGroup className="mb-2" style={{ maxWidth: 480 }}>
        <FormControl placeholder="Search by id/name" value={search} onChange={(e)=>setSearch(e.target.value)} />
        <Button onClick={() => load(search)}>Search</Button>
      </InputGroup>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: 8 }}>
        {items.length === 0 && <div style={{ color: "#888", width: "100%" }}>No items found</div>}
        {items.map((it, idx) => (
          <EditableInventoryCard
            key={idx}
            item={it}
            invType="common"
            onUpdate={(updated) => setItems(items.map(x => x.item_id === updated.item_id ? updated : x))}
            onDelete={(deleted) => setItems(items.filter(x => x.item_id !== deleted.item_id))}
            fields={fields}
            categories={categories}
          />
        ))}
      </div>

      <InventoryModalWithCategory show={showAdd} onHide={() => setShowAdd(false)} fields={fields} onSave={save} title="Add Common Inventory" invType="common" onCategoryAdded={loadCategories} />
      <InventoryViewModal show={showView} onHide={() => setShowView(false)} item={selected} />
    </div>
  );
}
