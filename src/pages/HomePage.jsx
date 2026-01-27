import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import { downloadQRCodesAsPDF } from "../utils/qrGenerator";
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
 
 const filteredBinsWithMatches = Object.entries(bins)
  .map(([id, bin]) => {
    const term = searchTerm.toLowerCase();

    // All items that match the search
    const allMatchingItems = bin.items.filter((item) =>
      item.toLowerCase().includes(term)
    );

    // Show only first 5 matching items
    const matchingItems = allMatchingItems.slice(0, 5);

    // Number of additional matching items
    const extraMatchesCount = allMatchingItems.length - matchingItems.length;

    // Determine if bin matches at all
    const binMatchesSearch =
      id.toLowerCase().includes(term) ||
      bin.name.toLowerCase().includes(term) ||
      matchingItems.length > 0;

    if (!binMatchesSearch) return null;

    return { id, bin, matchingItems, extraMatchesCount };
  })
  .filter(Boolean)
  .sort((a, b) =>
    a.bin.name.toLowerCase().localeCompare(b.bin.name.toLowerCase())
  );

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

      <button className="btn" onClick={() => downloadQRCodesAsPDF(bins)}>
        ⬇️ Download All QR Codes
      </button>

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

      {filteredBinsWithMatches.length === 0 ? (
        <p className="no-bins">
          {searchTerm ? "No matching results!" : "No bins stored yet!"}
        </p>
      ) : (
        <ul className="bins-list">
          {filteredBinsWithMatches.map(
            ({ id, bin, matchingItems, extraMatchesCount }) => (
              <li key={id}>
                <Link to={`/bin/${id}`} className="bin-link bin-link-with-preview">
                  <div className="bin-header">
                    <span className="bin-name">{bin.name}</span>
                    {/* <span className="bin-id">({id})</span> */}
                  </div>

                  {searchTerm && matchingItems.length > 0 && (
                    <div className="bin-preview-list">
                      {matchingItems.map((item, index) => (
                        <div key={index} className="bin-preview-item">
                          {item}
                        </div>
                      ))}

                      {extraMatchesCount > 0 && (
                        <div className="bin-preview-item more">
                          +{extraMatchesCount} more…
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
