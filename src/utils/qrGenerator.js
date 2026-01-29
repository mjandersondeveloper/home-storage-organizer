import QRCode from "qrcode";
import jsPDF from "jspdf";
import JSZip from "jszip";

export async function downloadSingleQRAsPNG(label, url) {
  const canvas = await generateStyledQrCanvas(label, url);
  const link = document.createElement("a");
  const safeName = (label)
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  link.download = `${safeName}-qr.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function downloadAllQRCodesAsPNG(bins, householdId) {
  const zip = new JSZip();
  const folder = zip.folder("bin-qr-codes");

  for (const [id, bin] of Object.entries(bins)) {
    const url = `${window.location.origin}/home-storage-organizer/#/${householdId}/bin/${id}`;
    const canvas = await generateStyledQrCanvas(bin.name, url);

    const blob = await canvasToBlob(canvas);

    const safeName = bin.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    folder.file(`${safeName}-qr.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = "bin-qr-codes.zip";
  link.click();

  URL.revokeObjectURL(link.href);
}

export async function downloadSingleQRAsPDF(label, url) {
  const canvas = await generateStyledQrCanvas(label, url);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("portrait", "pt", "letter");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const targetWidth = 360;
  const aspect = canvas.height / canvas.width;

  const renderWidth = Math.min(targetWidth, pageWidth - 120);
  const renderHeight = renderWidth * aspect;

  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);

  const safeName = label.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  pdf.save(`${safeName}-qr.pdf`);
}

export async function downloadQRCodesAsPDF(bins, householdId) {
  const pdf = new jsPDF("portrait", "pt", "letter");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const targetWidth = 360;

  let first = true;

  for (const [id, bin] of Object.entries(bins)) {
    if (!first) pdf.addPage();
    first = false;

    const url = `${window.location.origin}/home-storage-organizer/#/${householdId}/bin/${id}`;
    const canvas = await generateStyledQrCanvas(bin.name, url);
    const imgData = canvas.toDataURL("image/png");

    const aspect = canvas.height / canvas.width;
    const renderWidth = Math.min(targetWidth, pageWidth - 120);
    const renderHeight = renderWidth * aspect;

    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
  }

  pdf.save("bin-qr-codes.pdf");
}

export async function downloadQRCodesAsPDFGrid(bins, householdId) {
  const pdf = new jsPDF("portrait", "pt", "letter");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 50;
  const gap = 30;
  const targetWidth = 260;

  let x = margin;
  let y = margin;

  for (const [id, bin] of Object.entries(bins)) {
    const url = `${window.location.origin}/home-storage-organizer/#/${householdId}/bin/${id}`;
    const canvas = await generateStyledQrCanvas(bin.name, url);
    const imgData = canvas.toDataURL("image/png");

    const aspect = canvas.height / canvas.width;
    const renderWidth = targetWidth;
    const renderHeight = renderWidth * aspect;

    // New row
    if (x + renderWidth > pageWidth - margin) {
      x = margin;
      y += renderHeight + gap;
    }

    // New page
    if (y + renderHeight > pageHeight - margin) {
      pdf.addPage();
      x = margin;
      y = margin;
    }

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);

    x += renderWidth + gap;
  }

  pdf.save("bin-qr-codes-grid.pdf");
}

export async function generateStyledQrCanvas(label, url) {
  const size = 800;

  // Generate raw QR to a temp canvas
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "H",
    maskPattern: 3,
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
  const bottomPadding = 40;
  const width = size + padding * 2;

  // Temporary canvas just for measuring text
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.font = `600 80px "Segoe UI Rounded", system-ui, sans-serif`;

  const maxTextWidth = width - 120;
  const lineHeight = 90;

  const lines = wrapText(tempCtx, label, maxTextWidth);

  const dynamicTextHeight = lines.length * lineHeight;

  const height =
    size +
    padding * 2 +
    dividerSpacing +
    textTopSpacing +
    dynamicTextHeight +
    bottomPadding;

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

  // Draw each line centered
  lines.forEach((line, i) => {
    const y =
      dividerY +
      textTopSpacing +
      i * lineHeight;

    ctx.fillText(line, width / 2, y);
  });

  return canvas;
}

export async function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const { width } = ctx.measureText(testLine);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}