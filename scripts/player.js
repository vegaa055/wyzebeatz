const audio = document.getElementById("audio");
const trackListContainer = document.getElementById("track-list");
const currentTitle = document.getElementById("current-title");
const currentTimeDisplay = document.getElementById("current-time");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progressBar = document.getElementById("progress");
const volumeSlider = document.getElementById("volume");
const muteBtn = document.getElementById("mute");
const colorLow = document.getElementById("color-low");
const colorMid = document.getElementById("color-mid");
const colorHigh = document.getElementById("color-high");
const toggleColorCtrl = document.getElementById("toggle-color-controls");
const colorControlParams = document.getElementById("color-control-params");
const togglePlaylist = document.getElementById("toggle-playlist");
const playlist = document.getElementById("playlist");
const modeToggle = document.getElementById("mode-toggle");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let currentIndex = 0;
let isPlaying = false;
let isMuted = false;
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let source;
let animationId;
let bgHue = Math.random() * 360;
let bgHueBase = 0;
let bgHueOffset = 0;

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function lerpColor(color1, color2, t) {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
  };
}

function hexToHSL(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function isHueTooClose(h1, h2, threshold = 20) {
  const diff = Math.abs(h1 - h2);
  return diff < threshold || diff > 360 - threshold;
}

function getSafeBackgroundHue(forbiddenHues) {
  let attempts = 0;
  let safeHue;
  do {
    safeHue = Math.floor(Math.random() * 360);
    attempts++;
  } while (
    forbiddenHues.some((h) => isHueTooClose(safeHue, h)) &&
    attempts < 100
  );
  return safeHue;
}

function drawBackground() {
  const lowHSL = hexToHSL(colorLow.value);
  const midHSL = hexToHSL(colorMid.value);
  const highHSL = hexToHSL(colorHigh.value);
  const forbiddenHues = [lowHSL.h, midHSL.h, highHSL.h];

  // Slowly animate around the base hue
  bgHueOffset += 0.1;
  if (bgHueOffset > 360) bgHueOffset = 0;

  const animatedHue = (bgHueBase + bgHueOffset) % 360;
  const backgroundColor = `hsl(${animatedHue}, 40%, 7%)`;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateBackgroundHueBase() {
  const lowHSL = hexToHSL(colorLow.value);
  const midHSL = hexToHSL(colorMid.value);
  const highHSL = hexToHSL(colorHigh.value);
  const forbiddenHues = [lowHSL.h, midHSL.h, highHSL.h];

  bgHueBase = getSafeBackgroundHue(forbiddenHues);
  bgHueOffset = 0; // reset the animation offset
}

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
  draw();
}

function drawBars() {
  analyser.getByteFrequencyData(dataArray);
  drawBackground();
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const barWidth = (canvas.width / bufferLength) * 0.5;

  const lowRGB = hexToRgb(colorLow.value);
  const midRGB = hexToRgb(colorMid.value);
  const highRGB = hexToRgb(colorHigh.value);

  ctx.save();
  ctx.translate(centerX, centerY);

  for (let q = 0; q < 4; q++) {
    ctx.save();
    if (q === 1) ctx.scale(-1, 1);
    if (q === 2) ctx.scale(-1, -1);
    if (q === 3) ctx.scale(1, -1);

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const tRaw = i / bufferLength;
      const t = Math.sin((tRaw * Math.PI) / 2);

      let rgb;
      if (t < 0.5) {
        rgb = lerpColor(lowRGB, midRGB, t * 2);
      } else {
        rgb = lerpColor(midRGB, highRGB, (t - 0.5) * 2);
      }

      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.fillRect(x, 0, barWidth, -barHeight);
      x += barWidth + 1;
    }

    ctx.restore();
  }

  ctx.restore();
}

function drawOrb() {
  analyser.getByteFrequencyData(dataArray);
  drawBackground();

  const radius = Math.min(canvas.width, canvas.height) / 4;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;

    const raw = dataArray[i] / 256;

    // Apply perceptual scaling — boost higher frequencies
    const perceptualBoost = Math.pow(i / bufferLength, 5); // change 1.5 to adjust strength
    const adjusted = raw * (0.5 + perceptualBoost * 1.5); // base of 0.5 to keep lows alive

    const dist = radius * (1 + adjusted);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.fillStyle = getFrequencyColor(i, bufferLength);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function getFrequencyColor(index, total) {
  const third = Math.floor(total / 3);
  if (index < third) return colorLow.value;
  if (index < third * 2) return colorMid.value;
  return colorHigh.value;
}

function draw() {
  if (!analyser) return;
  animationId = requestAnimationFrame(draw);
  const mode = modeToggle.value;
  if (mode === "bars") {
    drawBars();
  } else if (mode === "orb") {
    drawOrb();
  }
}

function stopDrawing() {
  if (animationId) cancelAnimationFrame(animationId);
}

function loadTrack(index) {
  currentIndex = index;
  const track = tracks[index];
  currentTitle.textContent = track.title;
  document
    .querySelectorAll("#track-list li")
    .forEach((el) => el.classList.remove("active"));
  const activeItem = document.querySelector(
    `#track-list li[data-index="${index}"]`
  );
  if (activeItem) activeItem.classList.add("active");
  audio.src = track.file;
  audio.load();
  audio.play();
  if (!audioContext) initAudioContext();
  updateBackgroundHueBase();
}

function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    currentTitle.style.color = "#33ff33";
    currentTitle.style.textShadow = "rgba(51, 255, 51, 0.9) 0px 0px 20px";
  } else {
    audio.pause();
    playBtn.innerHTML = `<i class="fas fa-play"></i>`;
    currentTitle.style.color = "#f0f0f0";
    currentTitle.style.textShadow = "none";
  }
}

function updateProgressBar() {
  const current = audio.currentTime;
  const duration = audio.duration;
  progressBar.value = (current / duration) * 100;
  currentTimeDisplay.textContent = `${formatTime(current)} / ${formatTime(
    duration
  )}`;
}

function formatTime(time) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
}

function loadPlaylist() {
  fetch("/scripts/tracks.json")
    .then((response) => response.json())
    .then((data) => {
      tracks = data;
      data.forEach((track, index) => {
        const li = document.createElement("li");
        li.textContent = track.title;
        li.dataset.index = index;
        li.addEventListener("click", () => loadTrack(index));
        trackListContainer.appendChild(li);
      });
      loadTrack(0);
    });
}

function updateMuteIcon() {
  if (audio.muted || audio.volume === 0) {
    muteBtn.innerHTML = `<i class="fas fa-volume-mute"></i>`;
  } else if (audio.volume < 0.5) {
    muteBtn.innerHTML = `<i class="fas fa-volume-down"></i>`;
  } else {
    muteBtn.innerHTML = `<i class="fas fa-volume-up"></i>`;
  }
}

playBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", () =>
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length)
);

nextBtn.addEventListener("click", () =>
  loadTrack((currentIndex + 1) % tracks.length)
);

audio.addEventListener("timeupdate", updateProgressBar);
progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
  updateMuteIcon();
});

muteBtn.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    // Unmuting
    audio.muted = false;
    audio.volume = lastVolume;
    volumeSlider.value = lastVolume;
  } else {
    // Muting
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    audio.muted = true;
  }

  updateMuteIcon();
});

modeToggle.addEventListener("change", () => {
  stopDrawing();
  draw();
});

toggleColorCtrl.addEventListener("click", () => {
  const icon = toggleColorCtrl.querySelector("i");
  const isHidden = colorControlParams.style.display === "none";

  if (isHidden) {
    colorControlParams.style.display = "flex";
    icon.className = "fa fa-eye active"; // Unhidden icon
  } else {
    colorControlParams.style.display = "none";
    icon.className = "fa fa-eye-slash inactive"; // Hidden icon
  }
});

colorLow.addEventListener("input", updateBackgroundHueBase);
colorMid.addEventListener("input", updateBackgroundHueBase);
colorHigh.addEventListener("input", updateBackgroundHueBase);

togglePlaylist.addEventListener("click", () => {
  const isHidden = playlist.style.display === "none";
  const icon = togglePlaylist.querySelector("i");

  if (isHidden) {
    playlist.style.display = "flex";
    icon.className = "fa fa-eye active";
  } else {
    playlist.style.display = "none";
    icon.className = "fa fa-eye-slash inactive";
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

window.addEventListener("load", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loadPlaylist();
});
