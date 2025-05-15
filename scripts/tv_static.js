const canvas = document.getElementById("tv-static-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawStatic() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const buffer = new Uint32Array(imageData.data.buffer);
  const len = buffer.length;

  for (let i = 0; i < len; i++) {
    const gray = Math.random() * 255;
    const alpha = 255;
    buffer[i] = (alpha << 24) | (gray << 16) | (gray << 8) | gray;
  }

  ctx.putImageData(imageData, 0, 0);
}

function loop() {
  drawStatic();
  requestAnimationFrame(loop);
}

loop();
