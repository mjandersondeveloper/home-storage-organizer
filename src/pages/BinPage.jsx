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
    const qrCanvas = document.getElementById("bin-qr-code");
    if (!qrCanvas || !bin?.name) return;

    const scale = 1;
    const qrSize = qrCanvas.width * scale;

    const padding = 24;
    const borderRadius = 20;
    const width = qrSize + padding * 2;

    const dividerSpacing = 20 * scale;
    const textTopSpacing = 25 * scale;
    const textHeight = 40 * scale;

    const height =
      qrSize +
      padding * 2 +
      dividerSpacing +
      textTopSpacing +
      textHeight;

    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = width;
    combinedCanvas.height = height;

    const ctx = combinedCanvas.getContext("2d");

    // --- Helper: rounded rectangle ---
    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // --- Background with rounded border ---
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 2 * scale;

    drawRoundedRect(0, 0, width, height, borderRadius);
    ctx.fill();
    ctx.stroke();

    // --- Draw QR ---
    ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

    // --- Divider line ---
    const dividerY = padding + qrSize + dividerSpacing;
    ctx.beginPath();
    ctx.moveTo(padding + 20, dividerY);
    ctx.lineTo(width - padding - 20, dividerY);
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // --- Bin name text ---
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${30 * scale}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      bin.name,
      width / 2,
      dividerY + textTopSpacing + textHeight / 2
    );

    // --- Export ---
    const pngUrl = combinedCanvas.toDataURL("image/png");
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
