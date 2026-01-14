import QRCode from "qrcode";

export async function generateStyledQrCanvas(label, url) {
  const size = 800;

  // Generate raw QR to a temp canvas
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, url, {
    width: size,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    }
  });

  // Layout values (matches your existing style)
  const padding = 24;
  const borderRadius = 20;
  const dividerSpacing = 35;
  const textTopSpacing = 80;
  const textHeight = 40;
  const bottomPadding = 40;

  const width = size + padding * 2;
  const height = size + padding * 2 + dividerSpacing + textTopSpacing + textHeight + bottomPadding;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

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

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 2;
  drawRoundedRect(0, 0, width, height, borderRadius);
  ctx.fill();
  ctx.stroke();

  // QR
  ctx.drawImage(qrCanvas, padding, padding);

  // Divider
  const dividerY = padding + size + dividerSpacing;
  ctx.beginPath();
  ctx.moveTo(padding + 20, dividerY);
  ctx.lineTo(width - padding - 20, dividerY);
  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Label
  ctx.fillStyle = "#000";
  ctx.font = `600 80px "Segoe UI Rounded", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width / 2, dividerY + textTopSpacing + textHeight / 2);

  return canvas;
}
