import { Routes, Route, HashRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BinPage from "./pages/BinPage";

export default function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">📦 Home Bin Organizer</h1>

      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bin/:binId" element={<BinPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
