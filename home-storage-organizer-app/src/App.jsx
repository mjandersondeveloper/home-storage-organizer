import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import BinPage from "./pages/BinPage";

export default function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 Home Storage Organizer 📦</h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bin/:binId" element={<BinPage />} />
      </Routes>
    </div>
  );
}
