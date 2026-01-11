import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import Loading from "../components/Loading";
import { QRCodeCanvas } from "qrcode.react";


export default function BinPage() {
  const { binId } = useParams();
  const [bins, setBins] = useState({});
  const [bin, setBin] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const binUrl = `${window.location.origin}/home-storage-organizer/bin/${binId}`;

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

  const downloadQrCode = () => {
    const canvas = document.getElementById("bin-qr-code");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${bin.name}-qr.png`;
    link.click();
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

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <QRCodeCanvas
          id="bin-qr-code"
          value={binUrl}
          size={180}
          bgColor="#171a21"
          fgColor="#ffffff"
          level="H"
        />

        <button
          onClick={downloadQrCode}
          style={{
            marginTop: "10px",
            padding: "10px 18px",
            borderRadius: "14px",
            border: "none",
            background: "#4f7cff",
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          ⬇️ Download QR Code
        </button>
      </div>

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
