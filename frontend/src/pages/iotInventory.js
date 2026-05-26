import React, { useState, useEffect } from "react";
import { Button, InputGroup, FormControl, Form } from "react-bootstrap";
import axios from "axios";
import InventoryModalWithCategory from "../components/InventoryModalWithCategory";
import EditableInventoryCard from "../components/EditableInventoryCard";

const fields = [
  { name: "item_id", label: "Item ID" },
  { name: "item_name", label: "Item Name" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "condition", label: "Condition" },
  { name: "location", label: "Location" },
  { name: "assigned_to", label: "Assigned To" },
  { name: "purchase_date", label: "Purchase Date", type: "date" },
  { name: "vendor", label: "Vendor" },
  { name: "remarks", label: "Remarks" },
  { name: "device_type", label: "Device Type" },
  { name: "processor", label: "Processor / Chipset" },
  { name: "interfaces", label: "Interfaces (GPIO,SPI,I2C,UART,USB)" },
  { name: "firmware_version", label: "Firmware / OS Version" },
  { name: "mac_address", label: "MAC Address / UID" },
  { name: "usage_status", label: "Usage Status" }
];

export default function IoTInventory() {
  const [showAdd, setShowAdd] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(()=>{ 
    loadCategories();
    load(); 
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`/api/categories/iot`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const load = async (q, cat) => {
    try{
      let url = `/api/inventory/iot${q?`?q=${encodeURIComponent(q)}`:''}`
      const res = await axios.get(url);
      let filtered = res.data;
      if (cat) {
        filtered = filtered.filter(it => it.category === cat);
      }
      setItems(filtered);
    }catch(err){ console.error(err); }
  }

  const save = async (data) => {
    try{
      await axios.post(`/api/inventory/iot`, data);
      await load(search, categoryFilter);
      await loadCategories();
    }catch(err){ console.error(err); }
  };

  const handleUpdate = (updated) => {
    setItems(items.map(it => it.item_id === updated.item_id ? updated : it));
  };

  const handleDelete = (deleted) => {
    setItems(items.filter(it => it.item_id !== deleted.item_id));
  };

  const handleSearchChange = (q) => {
    setSearch(q);
    load(q, categoryFilter);
  };

  const handleCategoryFilterChange = (cat) => {
    setCategoryFilter(cat);
    load(search, cat);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3>IoT & Edge Devices Inventory</h3>
        <Button onClick={() => setShowAdd(true)}>+ Add Device</Button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <InputGroup style={{ maxWidth: 400 }}>
          <FormControl
            placeholder="Search by id/name/processor..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </InputGroup>

        <Form.Select
          style={{ maxWidth: 200 }}
          value={categoryFilter}
          onChange={(e) => handleCategoryFilterChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Select>

        {(search || categoryFilter) && (
          <Button
            variant="outline-secondary"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              load("", "");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Items Grid */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: 8 }}>
        {items.length === 0 && <div style={{ color: "#888", width: "100%" }}>No items found</div>}
        {items.map((it, idx) => (
          <EditableInventoryCard
            key={idx}
            item={it}
            invType="iot"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            fields={fields}
            categories={categories}
          />
        ))}
      </div>

      <InventoryModalWithCategory
        show={showAdd}
        onHide={() => setShowAdd(false)}
        fields={fields}
        onSave={save}
        title="Add IoT Device"
        invType="iot"
      />
    </div>
  );
}
