import "./css/QRCodeDownloadModal.css";

export default function QRCodeDownloadModal({
  open,
  onClose,
  title,
  options = []
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>

        <div className="qr-options">
          {options.map((opt) => (
            <button
              key={opt.label}
              className="btn"
              onClick={() => {
                opt.onClick();
                onClose();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button className="cancel-modal-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}