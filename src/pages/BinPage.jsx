import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import { downloadSingleQRAsPDF } from "../utils/qrGenerator";
import Loading from "../components/Loading";
import "./css/BinPage.css";
import "./css/SearchBar.css";

export default function BinPage() {
  const { binId } = useParams();
  const [bins, setBins] = useState({});
  const [bin, setBin] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => { 
    async function fetchBins() {
      setLoading(true);
      const binData = await getAllBins();
      setBins(binData);
      setBin(binData[binId]);
      setLoading(false);
    }
    fetchBins();
  }, [binId]);

  if (loading) return <Loading />;

  if (!bin) {
    return (
      <div className="card">
        <p>Bin not found.</p>
        <Link to="/" className="home-link">🏠 Home</Link>
      </div>
    );
  }

  const getBinUrl = (binId) =>
  `${window.location.origin}/home-storage-organizer/#/bin/${binId}`;

  const updateBin = async (updatedBin) => {
    setBins(updatedBin);
    setBin(updatedBin[binId]);
    await saveAllBins(updatedBin);
  };

  const addItem = async () => {
    const text = newItem.trim();
    if (!text) return;

    const updatedBin = {
      ...bins,
      [binId]: { ...bin, items: [...bin.items, text] },
    };

    setNewItem("");
    await updateBin(updatedBin);
  };

  const removeItem = async (index) => {
    const updatedItems = bin.items.filter((_, i) => i !== index);
    const updatedBin = { ...bins, [binId]: { ...bin, items: updatedItems } };
    await updateBin(updatedBin);
  };

  const saveEditedItem = async (index) => {
    const text = editValue.trim();
    if (!text) return;

    const updatedItems = [...bin.items];
    updatedItems[index] = text;

    const updatedBin = {
      ...bins,
      [binId]: { ...bin, items: updatedItems }
    };

    setEditingIndex(null);
    setEditValue("");
    await updateBin(updatedBin);
  }

  const cancelEditedItem = () => {
    setEditingIndex(null);
    setEditValue("");
  }

  const filteredItems = bin.items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div className="back-link">
        <Link to="/" className="home-link">🏠 Home</Link>
      </div>

      <h2 className="bin-title">{bin.name}</h2>

      <div className="qr-area">
        <button
          onClick={() => downloadSingleQRAsPDF(bin.name, getBinUrl(binId))}
          className="btn download-btn"
        >
          ⬇️ Download QR Code
        </button>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>

        <input
          className="search-input"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm("")}>
            ✕
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <p className="no-items">
          {searchTerm ? "No matching results!" : "No items in this bin yet!"}
        </p>
      ) : (
        <ul className="item-list">
          {filteredItems.map((item, filteredIndex) => {
            const realIndex = bin.items.findIndex((i) => i === item && !filteredItems.slice(0, filteredIndex).includes(i));
            return (
              <li key={realIndex} className="item">
                {editingIndex === realIndex ? (
                  <div className="edit-row">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditedItem(realIndex);
                      }}
                      onBlur={cancelEditedItem}
                      autoFocus
                      className="edit-input"
                    />

                    <button className="save-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => saveEditedItem(editingIndex)}>✓</button>
                    <button className="cancel-btn"  onMouseDown={(e) => e.preventDefault()} onClick={cancelEditedItem}>✕</button>
                  </div>
                ) : (
                  <div className="item-row">
                    <span className="item-text">{item}</span>

                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => {
                        setEditingIndex(realIndex);
                        setEditValue(item);
                      }}>Edit</button>

                      <button className="remove-btn" onClick={() => removeItem(realIndex)}>Remove</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="add-bar">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />
        <button onClick={addItem} className="btn">Add</button>
      </div>
    </div>
  );
}
