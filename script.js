const upload = document.getElementById('upload');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const imgWidthInput = document.getElementById('imgWidth');
const imgHeightInput = document.getElementById('imgHeight');
const applyResizeBtn = document.getElementById('applyResize');

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

const logo = new Image();
logo.crossOrigin = "anonymous";
logo.src = "https://raw.githubusercontent.com/choir94/Lamumumeme/main/1000182508-removebg-preview.png";

let uploadedImage = null;
let topTextPos = { x: 0, y: 50 };
let bottomTextPos = { x: 0, y: 0 };
let logoPos = { x: 0, y: 0 };
let draggingElement = null;
let isDrawing = false;
let mode = "move";
let drawings = [];
let redoStack = [];

// Upload image
upload.addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = () => {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      imgWidthInput.value = uploadedImage.width;
      imgHeightInput.value = uploadedImage.height;
      resetPositions();
      drawMeme();
    };
    uploadedImage.src = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Resize
applyResizeBtn.addEventListener('click', () => {
  if (uploadedImage) {
    drawMeme();
  }
});

function resetPositions() {
  topTextPos.x = uploadedImage.width / 2;
  bottomTextPos.x = uploadedImage.width / 2;
  bottomTextPos.y = uploadedImage.height - 30;
  logoPos.x = uploadedImage.width - uploadedImage.width * 0.2 - 10;
  logoPos.y = uploadedImage.height - uploadedImage.width * 0.2 - 10;
}

// Inputs
[topTextInput, bottomTextInput, textColorInput].forEach(input => {
  input.addEventListener('input', drawMeme);
});

modeBtn.addEventListener('click', () => {
  mode = mode === "move" ? "draw" : "move";
  modeBtn.textContent = mode === "move" ? "Switch to Draw Mode ✏️" : "Switch to Move Mode 🖐️";
});

clearDrawingsBtn.addEventListener('click', () => {
  drawings = [];
  redoStack = [];
  drawMeme();
});

undoBtn.addEventListener('click', () => {
  if (drawings.length > 0) {
    redoStack.push(drawings.pop());
    drawMeme();
  }
});

redoBtn.addEventListener('click', () => {
  if (redoStack.length > 0) {
    drawings.push(redoStack.pop());
    drawMeme();
  }
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'lamumu-meme.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Touch + Mouse Events
["mousedown", "touchstart"].forEach(evt =>
  canvas.addEventListener(evt, (e) => {
    const pos = getPointerPos(e);
    if (mode === "move") {
      if (isTextClicked(pos, topTextInput.value, topTextPos)) draggingElement = 'top';
      else if (isTextClicked(pos, bottomTextInput.value, bottomTextPos)) draggingElement = 'bottom';
      else if (isLogoClicked(pos)) draggingElement = 'logo';
    } else if (mode === "draw") {
      isDrawing = true;
      drawings.push({ color: drawColorInput.value, size: brushSizeInput.value, points: [pos] });
    }
  })
);

["mousemove", "touchmove"].forEach(evt =>
  canvas.addEventListener(evt, (e) => {
    const pos = getPointerPos(e);
    if (mode === "move" && draggingElement) {
      if (draggingElement === 'top') topTextPos = pos;
      else if (draggingElement === 'bottom') bottomTextPos = pos;
      else if (draggingElement === 'logo') {
        logoPos.x = pos.x - (canvas.width * 0.2) / 2;
        logoPos.y = pos.y - (canvas.width * 0.2) / 2;
      }
      drawMeme();
    } else if (mode === "draw" && isDrawing) {
      const stroke = drawings[drawings.length - 1];
      stroke.points.push(pos);
      drawMeme();
    }
  })
);

["mouseup", "touchend"].forEach(evt =>
  canvas.addEventListener(evt, () => {
    draggingElement = null;
    isDrawing = false;
  })
);

// Helpers
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function isTextClicked(pos, text, txtPos) {
  ctx.font = `${Math.floor(canvas.width / 12)}px Arial Black`;
  const w = ctx.measureText(text).width;
  return pos.x >= txtPos.x - w / 2 && pos.x <= txtPos.x + w / 2 && pos.y >= txtPos.y - 40 && pos.y <= txtPos.y + 10;
}

function isLogoClicked(pos) {
  const size = canvas.width * 0.2;
  return pos.x >= logoPos.x && pos.x <= logoPos.x + size && pos.y >= logoPos.y && pos.y <= logoPos.y + size;
}

function drawMeme() {
  if (!uploadedImage) return;
  const w = parseInt(imgWidthInput.value);
  const h = parseInt(imgHeightInput.value);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(uploadedImage, 0, 0, w, h);

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

  const logoSize = canvas.width * 0.2;
  ctx.drawImage(logo, logoPos.x, logoPos.y, logoSize, logoSize);

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
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    r = Math.floor(r / 32) * 32;
    g = Math.floor(g / 32) * 32;
    b = Math.floor(b / 32) * 32;
    const noise = (Math.random() - 0.5) * 30;
    data[i] = clamp(r + noise);
    data[i+1] = clamp(g + noise);
    data[i+2] = clamp(b + noise);
  }
  ctx.putImageData(imgData, 0, 0);
}

function clamp(val) {
  return Math.max(0, Math.min(255, val));
}
