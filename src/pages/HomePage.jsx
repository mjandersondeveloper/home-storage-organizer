import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBins, saveAllBins } from "../api/binStorage";
import { downloadAllQRCodesAsPNG } from "../utils/qrGenerator";
import Loading from "../components/Loading";
import "./css/HomePage.css";
import "./css/SearchBar.css";

export default function HomePage() {
  const [bins, setBins] = useState({});
  const [newBinName, setNewBinName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBinRoom, setNewBinRoom] = useState("");
  const [collapsedRooms, setCollapsedRooms] = useState({});
  const householdId = "worman-drive"; // Static household ID for now

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
    const allMatchingItems = bin.items.filter((item) =>
      item.toLowerCase().includes(term)
    );
    const matchingItems = allMatchingItems.slice(0, 5);
    const extraMatchesCount = allMatchingItems.length - matchingItems.length;
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

  const groupedBins = filteredBinsWithMatches.reduce((groups, entry) => {
    const room = entry.bin.room;
    if (!groups[room]) {
      groups[room] = [];
    }
    groups[room].push(entry);
    return groups;
  }, {});

  const toggleRoom = (room) => {
    setCollapsedRooms(prev => ({
    ...prev,
    [room]: !prev[room],
    }));
  };

  const generateNextBinId = (room, bins) => {
    const prefix = room.toLowerCase().replace(/\s+/g, "-");
    const existing = Object.keys(bins)
      .filter(id => id.startsWith(prefix + "-"))
      .map(id => parseInt(id.split("-").pop(), 10))
      .filter(n => !isNaN(n));

    const nextNumber = (existing.length ? Math.max(...existing) : 0) + 1;
    return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
  };

  const createBin = async () => {
    const name = newBinName.trim();
    const room = newBinRoom;

    if (!name || !room) {
      alert("Please enter both a Bin Name and Room.");
      return;
    }

    const id = generateNextBinId(room, bins);
    const updatedBin = {
      ...bins,
      [id]: { name, room, items: [] },
    };

    setBins(updatedBin);
    setNewBinName("");
    setNewBinRoom("");
    await saveAllBins(updatedBin);
  };

  return (
    <div className="home-page">
      <h2>🗂️ All Bins</h2>

      <button className="btn" onClick={() => downloadAllQRCodesAsPNG(bins, householdId)}>
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
          <select
            value={newBinRoom} onChange={(e) => setNewBinRoom(e.target.value)}
            className="input"
          >
            <option value="">Select Room</option>
            <option value="Basement">Basement</option>
            <option value="Garage">Garage</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Living Room">Living Room</option>
            <option value="Office">Office</option>
            <option value="Attic">Attic</option>
            <option value="Other">Other</option>
          </select>
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
        <div className="room-groups">
          {Object.entries(groupedBins)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([room, bins]) => (
              <div key={room} className="room-section">
                <h3 className="room-title" onClick={() => toggleRoom(room)}>
                  {room}
                  {/* <span className={`chevron ${collapsedRooms[room] ? "collapsed" : ""}`}>
                    ▶
                  </span> */}
                </h3>

                {!collapsedRooms[room] && (
                  <ul className="bins-list">
                    {bins.map(({ id, bin, matchingItems, extraMatchesCount }) => (
                      <li key={id}>
                        <Link to={`${householdId}/bin/${id}`} className="bin-link bin-link-with-preview">
                          <div className="bin-header">
                            <span className="bin-name">{bin.name}</span>
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
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
