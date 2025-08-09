const upload = document.getElementById('upload');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const textColorInput = document.getElementById('textColor');
const downloadBtn = document.getElementById('downloadBtn');

// Logo Lamumu dari repo GitHub
const logo = new Image();
logo.crossOrigin = "anonymous";
logo.src = "https://raw.githubusercontent.com/choir94/Lamumumeme/main/Logo.png";

// Posisi elemen (bisa di-drag)
let topTextPos = { x: 0, y: 50 };
let bottomTextPos = { x: 0, y: 0 };
let logoPos = { x: 0, y: 0 };

let draggingElement = null;
let uploadedImage = null;

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

[topTextInput, bottomTextInput, textColorInput].forEach(input => {
  input.addEventListener('input', drawMeme);
});

canvas.addEventListener('mousedown', (e) => {
  const mousePos = getMousePos(e);

  if (isTextClicked(mousePos, topTextInput.value, topTextPos)) {
    draggingElement = 'top';
  } else if (isTextClicked(mousePos, bottomTextInput.value, bottomTextPos)) {
    draggingElement = 'bottom';
  } else if (isLogoClicked(mousePos)) {
    draggingElement = 'logo';
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!draggingElement) return;
  const mousePos = getMousePos(e);

  if (draggingElement === 'top') {
    topTextPos.x = mousePos.x;
    topTextPos.y = mousePos.y;
  } else if (draggingElement === 'bottom') {
    bottomTextPos.x = mousePos.x;
    bottomTextPos.y = mousePos.y;
  } else if (draggingElement === 'logo') {
    logoPos.x = mousePos.x - (canvas.width * 0.2) / 2;
    logoPos.y = mousePos.y - (canvas.width * 0.2) / 2;
  }
  drawMeme();
});

canvas.addEventListener('mouseup', () => {
  draggingElement = null;
});

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

  applyCrayonEffect();
}

function applyCrayonEffect() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

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

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'lamumu-meme.png';
  link.href = canvas.toDataURL();
  link.click();
});
