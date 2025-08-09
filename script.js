const upload = document.getElementById('upload');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const textColorInput = document.getElementById('textColor');
const drawColorInput = document.getElementById('drawColor');
const brushSizeInput = document.getElementById('brushSize');
const modeBtn = document.getElementById('modeBtn');
const clearDrawingsBtn = document.getElementById('clearDrawings');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const stickerGallery = document.getElementById('stickerGallery');

// Default logo
const logo = new Image();
logo.crossOrigin = "anonymous";
logo.src = "https://raw.githubusercontent.com/choir94/Lamumumeme/main/Logo.png";

// State
let uploadedImage = null;
let topTextPos = { x: 0, y: 50 };
let bottomTextPos = { x: 0, y: 0 };
let logoPos = { x: 0, y: 0 };
let stickers = [];
let draggingElement = null;
let isDrawing = false;
let mode = "move";
let drawings = [];
let redoStack = [];

// Upload gambar
upload.addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = () => {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      topTextPos.x = uploadedImage.width / 2;
      bottomTextPos.x = uploadedImage.width / 2;
      bottomTextPos.y = uploadedImage.height - 30;
      logoPos.x = uploadedImage.width - uploadedImage.width * 0.2 - 10;
      logoPos.y = uploadedImage.height - uploadedImage.width * 0.2 - 10;
      drawMeme();
    };
    uploadedImage.src = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Input handler
[topTextInput, bottomTextInput, textColorInput].forEach(input => {
  input.addEventListener('input', drawMeme);
});

// Mode switch
modeBtn.addEventListener('click', () => {
  mode = mode === "move" ? "draw" : "move";
  modeBtn.textContent = mode === "move" ? "Switch to Draw Mode ✏️" : "Switch to Move Mode 🖐️";
});

// Clear drawings
clearDrawingsBtn.addEventListener('click', () => {
  drawings = [];
  redoStack = [];
  drawMeme();
});

// Undo
undoBtn.addEventListener('click', () => {
  if (drawings.length > 0) {
    redoStack.push(drawings.pop());
    drawMeme();
  }
});

// Redo
redoBtn.addEventListener('click', () => {
  if (redoStack.length > 0) {
    drawings.push(redoStack.pop());
    drawMeme();
  }
});

// Pilih stiker dari galeri
stickerGallery.addEventListener('click', (e) => {
  if (e.target.tagName === "IMG") {
    const newSticker = {
      img: new Image(),
      x: canvas.width / 2 - 30,
      y: canvas.height / 2 - 30,
      size: 60
    };
    newSticker.img.crossOrigin = "anonymous";
    newSticker.img.src = e.target.src;
    stickers.push(newSticker);
    newSticker.img.onload = drawMeme;
  }
});

// Mouse events
canvas.addEventListener('mousedown', (e) => {
  const mousePos = getMousePos(e);

  if (mode === "move") {
    if (isTextClicked(mousePos, topTextInput.value, topTextPos)) {
      draggingElement = 'top';
    } else if (isTextClicked(mousePos, bottomTextInput.value, bottomTextPos)) {
      draggingElement = 'bottom';
    } else if (isLogoClicked(mousePos)) {
      draggingElement = 'logo';
    } else {
      // Cek klik stiker
      for (let i = stickers.length - 1; i >= 0; i--) {
        const st = stickers[i];
        if (mousePos.x >= st.x && mousePos.x <= st.x + st.size &&
            mousePos.y >= st.y && mousePos.y <= st.y + st.size) {
          draggingElement = { type: 'sticker', index: i };
          break;
        }
      }
    }
  } else if (mode === "draw") {
    isDrawing = true;
    drawings.push({ color: drawColorInput.value, size: brushSizeInput.value, points: [mousePos] });
  }
});

canvas.addEventListener('mousemove', (e) => {
  const mousePos = getMousePos(e);

  if (mode === "move" && draggingElement) {
    if (draggingElement === 'top') {
      topTextPos.x = mousePos.x;
      topTextPos.y = mousePos.y;
    } else if (draggingElement === 'bottom') {
      bottomTextPos.x = mousePos.x;
      bottomTextPos.y = mousePos.y;
    } else if (draggingElement === 'logo') {
      logoPos.x = mousePos.x - (canvas.width * 0.2) / 2;
      logoPos.y = mousePos.y - (canvas.width * 0.2) / 2;
    } else if (draggingElement.type === 'sticker') {
      stickers[draggingElement.index].x = mousePos.x - stickers[draggingElement.index].size / 2;
      stickers[draggingElement.index].y = mousePos.y - stickers[draggingElement.index].size / 2;
    }
    drawMeme();
  } else if (mode === "draw" && isDrawing) {
    const currentStroke = drawings[drawings.length - 1];
    currentStroke.points.push(mousePos);
    drawMeme();
  }
});

canvas.addEventListener('mouseup', () => {
  draggingElement = null;
  isDrawing = false;
});

// Download
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'lamumu-meme.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Helpers
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function isTextClicked(mousePos, text, pos) {
  ctx.font = `${Math.floor(canvas.width / 12)}px Arial Black`;
  const textWidth = ctx.measureText(text).width;
  return (
    mousePos.x >= pos.x - textWidth / 2 &&
    mousePos.x <= pos.x + textWidth / 2 &&
    mousePos.y >= pos.y - 40 &&
    mousePos.y <= pos.y + 10
  );
}

function isLogoClicked(mousePos) {
  const size = canvas.width * 0.2;
  return (
    mousePos.x >= logoPos.x &&
    mousePos.x <= logoPos.x + size &&
    mousePos.y >= logoPos.y &&
    mousePos.y <= logoPos.y + size
  );
}

function drawMeme() {
  if (!uploadedImage) return;

  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;
  ctx.drawImage(uploadedImage, 0, 0);

  // Teks
  ctx.font = `${Math.floor(canvas.width / 12)}px Arial Black`;
  ctx.fillStyle = textColorInput.value;
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.floor(canvas.width / 200);
  ctx.textAlign = "center";

  if (topTextInput.value) {
    ctx.fillText(topTextInput.value, topTextPos.x, topTextPos.y);
    ctx.strokeText(topTextInput.value, topTextPos.x, topTextPos.y);
  }

  if (bottomTextInput.value) {
    ctx.fillText(bottomTextInput.value, bottomTextPos.x, bottomTextPos.y);
    ctx.strokeText(bottomTextInput.value, bottomTextPos.x, bottomTextPos.y);
  }

  // Logo
  const logoSize = canvas.width * 0.2;
  ctx.drawImage(logo, logoPos.x, logoPos.y, logoSize, logoSize);

  // Stickers
  stickers.forEach(st => {
    ctx.drawImage(st.img, st.x, st.y, st.size, st.size);
  });

  // Drawings
  drawings.forEach(stroke => {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  });

  applyCrayonEffect();
}

function applyCrayonEffect() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    r = Math.floor(r / 32) * 32;
    g = Math.floor(g / 32) * 32;
    b = Math.floor(b / 32) * 32;
    const noise = (Math.random() - 0.5) * 30;
    data[i] = clamp(r + noise);
    data[i + 1] = clamp(g + noise);
    data[i + 2] = clamp(b + noise);
  }
  ctx.putImageData(imageData, 0, 0);
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}
