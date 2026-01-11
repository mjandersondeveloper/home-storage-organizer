import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import Loading from "../components/Loading";

export default function BinPage() {
  const { binId } = useParams();
  const [bins, setBins] = useState({});
  const [bin, setBin] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

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
      <div>
        <p>Bin not found.</p>
        <Link to="/"
          style={{
            color: "#4f7cff",
            textDecoration: "none",
            fontWeight: 600,
          }}>🏠 Home</Link>
      </div>
    );
  }

  const addItem = async () => {
    if (!newItem.trim()) return;

    const updatedBin = {
      ...bins,
      [binId]: {
        ...bin,
        items: [...bin.items, newItem]
      }
    };

    setBins(updatedBin);
    setBin(updatedBin[binId]);
    setNewItem("");

    await saveAllBins(updatedBin);
  };

  const removeItem = async (index) => {
    const updatedItems = bin.items.filter((_, i) => i !== index);
    const updatedBin = {
      ...bins,
      [binId]: {
        ...bin,
        items: updatedItems
      }
    }

    setBins(updatedBin);
    setBin(updatedBin[binId]);

    await saveAllBins(updatedBin);
  };

  return (
    <div className="card">
      <div style={{ marginBottom: "12px" }}>
        <Link
          to="/"
          style={{
            color: "#4f7cff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          🏠 Home
        </Link>
      </div>
      
      <h2 style={{ marginTop: 0 }}>{bin.name}</h2>

      <ul className="item-list">
        {bin.items.map((item, index) => (
          <li key={index} className="item">
            <span>{item}</span>
            <button onClick={() => removeItem(index)}>Remove</button>
          </li>
        ))}
      </ul>

      <div className="add-bar">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addItem();
            }
          }}
        />
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
}
