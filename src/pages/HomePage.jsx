import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import Loading from "../components/Loading";
import "./css/HomePage.css";
import "./css/SearchBar.css";

export default function HomePage() {
  const [bins, setBins] = useState({});
  const [newBinName, setNewBinName] = useState("");
  const [newBinId, setNewBinId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
  const filteredBinEntries = binEntries.filter(([id, bin]) => {
    const term = searchTerm.toLowerCase();
    return (
      id.toLowerCase().includes(term) ||
      bin.name.toLowerCase().includes(term) ||
      bin.items.some(item => item.toLowerCase().includes(term))
    );
  });

  const createBin = async () => {
    const name = newBinName.trim();
    const id = newBinId.trim();
    if (!name || !id) {
      alert("Please enter both a Bin Name and a Bin ID.");
      return;
    }
    if (bins[id]) {
      alert("Bin ID already exists! Please choose another.");
      return;
    }

    const updatedBin = {
      ...bins,
      [id]: { name, items: [] },
    };

    setBins(updatedBin);
    setNewBinName("");
    setNewBinId("");
    await saveAllBins(updatedBin);
  };

  return (
    <div className="home-page">
      <h2>🗂️ All Bins</h2>

      <div className="card create-card">
        <h3 className="card-title">➕ Create New Bin</h3>
        <div className="add-bar column">
          <input
            placeholder="Bin Name"
            value={newBinName}
            onChange={(e) => setNewBinName(e.target.value)}
            className="input"
          />
          <input
            placeholder="Bin ID (must be unique)"
            value={newBinId}
            onChange={(e) => setNewBinId(e.target.value)}
            className="input"
          />
          <button onClick={createBin} className="btn">
            Create Bin
          </button>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>

        <input
          className="search-input"
          placeholder="Search bins and items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm("")}>
            ✕
          </button>
        )}
      </div>

      {filteredBinEntries.length === 0 ? (
        <p className="no-bins">
          {searchTerm ? "No matching results!" : "No bins stored yet!"}
        </p>
      ) : (
        <ul className="bins-list">
          {filteredBinEntries.map(([id, bin]) => (
            <li key={id}>
              <Link to={`/bin/${id}`} className="bin-link">
                <span className="bin-name">{bin.name}</span>
                <span className="bin-id">({id})</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
