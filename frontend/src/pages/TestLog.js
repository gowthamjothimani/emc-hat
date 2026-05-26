import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TestLogCard from "../components/TestLogCard";
import TestLogModal from "../components/TestLogModal";

export default function TestLog() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [qcFilter, setQcFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  const loadLogs = async () => {
    try {
      const res = await axios.get("/api/testlogs");
      setLogs(res.data);
    } catch (err) {
      console.error("Error loading test logs:", err);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh every 3 seconds to pick up new MQTT data
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- dynamic filter options ---------- */
  const models = useMemo(
    () => [...new Set(logs.map(l => l.model).filter(Boolean))],
    [logs]
  );

  const projects = useMemo(
    () => [...new Set(logs.map(l => l.project).filter(Boolean))],
    [logs]
  );

  /* ---------- filtering logic ---------- */
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const text = search.toLowerCase();

      const matchesSearch =
        !search ||
        l.pcb_serial?.toLowerCase().includes(text) ||
        l.model?.toLowerCase().includes(text) ||
        l.project?.toLowerCase().includes(text) ||
        l.qc?.toLowerCase().includes(text);

      const matchesQC =
        qcFilter === "ALL" || l.qc === qcFilter;

      const matchesModel =
        modelFilter === "ALL" || l.model === modelFilter;

      const matchesProject =
        projectFilter === "ALL" || l.project === projectFilter;

      return matchesSearch && matchesQC && matchesModel && matchesProject;
    });
  }, [logs, search, qcFilter, modelFilter, projectFilter]);

  return (
    <div>
      {/* ---------- Toolbar ---------- */}
      <div className="toolbar" style={toolbarStyle}>
        <h2>Test Logs</h2>
        <a
          href="/api/testlogs/export"
          download="test_logs.csv"
          style={{
            textDecoration: "none",
            fontSize: "24px",
            color: "#0f3460",
            marginLeft: "auto",
            cursor: "pointer"
          }}
        >
          ⬇️ Download Logs
        </a>
      </div>

      {/* ---------- Search + Filters ---------- */}
      <div style={filterBarStyle}>
        <input
          placeholder="Search PCB / Model / Project / QC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />

        <select value={qcFilter} onChange={e => setQcFilter(e.target.value)}>
          <option value="ALL">All QC</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
          <option value="NOT_RUN">NOT_RUN</option>
        </select>

        <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
          <option value="ALL">All Models</option>
          {models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="ALL">All Projects</option>
          {projects.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* ---------- Empty State ---------- */}
      {filteredLogs.length === 0 && (
        <p style={{ marginTop: 20, color: "#888" }}>
          No matching test logs found
        </p>
      )}

      {/* ---------- Log Cards ---------- */}
      {filteredLogs.map((l, i) => (
        <TestLogCard
          key={l.id}
          index={i + 1}
          data={l}
          onOpen={() => setSelected(l.id)}
          onDelete={async () => {
            await axios.delete(`/api/testlogs/${l.id}`);
            loadLogs();
          }}
        />
      ))}

      {selected && (
        <TestLogModal
          id={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ---------- styles ---------- */

const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const filterBarStyle = {
  display: "flex",
  gap: "10px",
  margin: "10px 0 20px",
  flexWrap: "wrap",
};

const inputStyle = {
  flex: 1,
  minWidth: "220px",
  padding: "6px",
};
