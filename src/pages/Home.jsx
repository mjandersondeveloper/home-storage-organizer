import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import Loading from "../components/Loading";
import "./css/Home.css";

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

      {binEntries.length === 0 ? (
        <p className="no-bins">No bins stored yet.</p>
      ) : (
        <ul className="bins-list">
          {binEntries.map(([id, bin]) => (
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
