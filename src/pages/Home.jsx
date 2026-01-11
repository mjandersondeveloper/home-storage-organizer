import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import Loading from "../components/Loading";

export default function Home() {
  const [bins, setBins] = useState({});
  const [newBinName, setNewBinName] = useState("");
  const [newBinId, setNewBinId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAllBins();
      setBins(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loading />;
  
  const binEntries = Object.entries(bins);

  const createBin = async () => {
    // Validate both name and ID are provided
    if (!newBinName.trim() || !newBinId.trim()) {
      alert("Please enter both a Bin Name and a Bin ID.");
      return;
    }

    // Prevent duplicate IDs
    if (bins[newBinId]) {
      alert("Bin ID already exists! Please choose another.");
      return;
    }

    const updated = {
      ...bins,
      [newBinId]: {
        name: newBinName,
        items: [],
      },
    };

    setBins(updated);
    setNewBinName("");
    setNewBinId("");

    await saveAllBins(updated);
  };

  return (
    <div>
      <h2>🗂️ All Bins</h2>

      {/* Create New Bin Form */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>➕ Create New Bin</h3>
        <div className="add-bar" style={{ flexDirection: "column", gap: "8px" }}>
          <input
            placeholder="Bin Name"
            value={newBinName}
            onChange={(e) => setNewBinName(e.target.value)}
          />
          <input
            placeholder="Bin ID (must be unique)"
            value={newBinId}
            onChange={(e) => setNewBinId(e.target.value)}
          />
          <button onClick={createBin}>Create Bin</button>
        </div>
      </div>

      {/* Existing bins */}
      {binEntries.length === 0 && <p>No bins stored yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {binEntries.map(([id, bin]) => (
          <li key={id} style={{ marginBottom: "10px" }}>
            <Link
              to={`/bin/${id}`}
              style={{
                textDecoration: "none",
                color: "#4f7cff",
                fontWeight: 600,
                display: "block",
                padding: "12px",
                borderRadius: "12px",
                background: "#171a21",
              }}
            >
              {bin.name} <span style={{ fontSize: "12px", color: "#999" }}>({id})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
