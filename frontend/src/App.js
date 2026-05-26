import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import TestLog from "./pages/TestLog";
import Inventory from "./pages/Inventory";
import CommonInventory from "./pages/commonInventory";
import ToolsInventory from "./pages/toolsInventory";
import IoTInventory from "./pages/iotInventory";
import ComponentsInventory from "./pages/componentsInventory";
import OthersInventory from "./pages/othersInventory";
import DeviceTesting from "./pages/DeviceTesting";
import ProductionBOM from "./pages/ProductionBOM";
import BOMView from "./pages/BOMView";
import BOMEdit from "./pages/BOMEdit";
import PCBAAssist from "./pages/PCBAAssist";
import PCBAView from "./pages/PCBAView";
import PCBAEdit from "./pages/PCBAEdit";

import Placeholder from "./pages/Placeholder";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/test-log" element={<TestLog />} />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/common" element={<CommonInventory />} />
          <Route path="/inventory/tools" element={<ToolsInventory />} />
          <Route path="/inventory/iot" element={<IoTInventory />} />
          <Route path="/inventory/components" element={<ComponentsInventory />} />
          <Route path="/inventory/others" element={<OthersInventory />} />

          <Route path="/device-config" element={<DeviceTesting />} />

          <Route path="/bom" element={<ProductionBOM />} />
          <Route path="/bom/:bomId" element={<BOMView />} />
          <Route path="/bom/:bomId/edit" element={<BOMEdit />} />

          <Route path="/pcba-assist" element={<PCBAAssist />} />
          <Route path="/pcba/:designId" element={<PCBAView />} />
          <Route path="/pcba/:designId/edit" element={<PCBAEdit />} />

          <Route path="*" element={<Placeholder />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
