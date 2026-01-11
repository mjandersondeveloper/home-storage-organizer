import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";

export default function BinPage() {
  const { binId } = useParams();

  const [bins, setBins] = useState({});
  const [bin, setBin] = useState(null);
  const [newItem, setNewItem] = useState("");

  useEffect(() => { 
    async function fetchBins() {
      const binData = await getAllBins();
      setBins(binData);
      setBin(binData[binId]);
    }
    fetchBins();
  }, [binId]);

  if (!bin) {
    return <p>Bin not found!</p>
  }

  const addItem = async () => {
    if (!newItem.trim()) {
      return;
    }

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
  }

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
    <div>
      <h2>Bin: {bin.name}</h2>

      <ul>
        {bin.items.map((item, index) => (
          <li key={index}>
            {item}
            <button onClick={() => removeItem(index)}>❌</button>
          </li>
        ))}
      </ul>

       <div>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
        />
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
}
