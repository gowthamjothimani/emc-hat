import Header from "./Header";
import Sidebar from "./Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div className="main-layout-container">
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
}
