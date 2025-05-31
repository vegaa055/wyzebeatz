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
const playlistTitle = document.getElementById("playlist-title");

let tracks = [];
let currentIndex = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const sourceNode = audioCtx.createMediaElementSource(audio);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
sourceNode.connect(analyser);
analyser.connect(audioCtx.destination);

let bulletPoint = "\u2022";
let lastVolume = 1; // default full volume

// Fetch tracks
async function fetchTracks() {
  const response = await fetch("/scripts/tracks.json");
  tracks = await response.json();
  renderPlaylist();
  loadTrack(currentIndex);
}

function renderPlaylist() {
  trackListContainer.innerHTML = "";

  const genres = tracks.reduce((acc, track) => {
    if (!acc[track.genre]) acc[track.genre] = [];
    acc[track.genre].push(track);
    return acc;
  }, {});

  for (const genre in genres) {
    const header = document.createElement("li");
    header.textContent = genre;
    header.style.fontWeight = "bold";
    header.style.pointerEvents = "none";
    header.style.color = "#03b2c9";
    trackListContainer.appendChild(header);

    genres[genre].forEach((track, index) => {
      const actualIndex = tracks.indexOf(track);
      const li = document.createElement("li");
      li.textContent = bulletPoint + " " + track.title;
      li.style.color = "#fff";
      li.dataset.index = actualIndex;
      li.addEventListener("click", () => {
        currentIndex = actualIndex;
        loadTrack(currentIndex);
        playAudio();
      });
      trackListContainer.appendChild(li);
    });
  }
}

function loadTrack(index) {
  const track = tracks[index];
  audio.src = track.file;
  currentTitle.textContent = track.title;

  [...trackListContainer.querySelectorAll("li")].forEach((li) =>
    li.classList.remove("active")
  );
  const active = trackListContainer.querySelector(`[data-index="${index}"]`);
  if (active) active.classList.add("active");
}

function playAudio() {
  audioCtx.resume(); // Resume context if suspended (mobile)
  audio.play();
  playBtn.innerHTML = `<i class="fas fa-pause"></i>`;
  currentTitle.style.color = "#33ff33";
  currentTitle.style.textShadow = "rgba(51, 255, 51, 0.9) 0px 0px 20px";
}

function pauseAudio() {
  audio.pause();
  playBtn.innerHTML = `<i class="fas fa-play"></i>`;
  currentTitle.style.color = "#f0f0f0";
  currentTitle.style.textShadow = "none";
}

function togglePlay() {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex);
  playAudio();
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex);
  playAudio();
}

audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration || 0;
  progressBar.value = current;
  progressBar.max = duration;
  currentTimeDisplay.textContent = `${formatTime(current)} / ${formatTime(
    duration
  )}`;
});

progressBar.addEventListener("input", () => {
  audio.currentTime = progressBar.value;
});

audio.addEventListener("ended", nextTrack);
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

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

togglePlaylist.addEventListener("click", () => {
  const icon = togglePlaylist.querySelector("i");

  if (playlist.style.display === "none") {
    playlist.style.display = "flex";
    icon.className = "fa fa-eye active";
  } else {
    playlist.style.display = "none";
    icon.className = "fa fa-eye-slash inactive";
  }
});

toggleColorCtrl.addEventListener("click", () => {
  const icon = toggleColorCtrl.querySelector("i");

  if (colorControlParams.style.display === "none") {
    colorControlParams.style.display = "flex";
    icon.className = "fa fa-eye active"; // Unhidden icon
  } else {
    colorControlParams.style.display = "none";
    icon.className = "fa fa-eye-slash inactive"; // Hidden icon
  }
});

function updateMuteIcon() {
  if (audio.muted || audio.volume === 0) {
    muteBtn.innerHTML = `<i class="fas fa-volume-mute"></i>`;
  } else if (audio.volume < 0.5) {
    muteBtn.innerHTML = `<i class="fas fa-volume-down"></i>`;
  } else {
    muteBtn.innerHTML = `<i class="fas fa-volume-up"></i>`;
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function animateVisualizer() {
  const canvas = document.getElementById("visualizer");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

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

        // Nonlinear mapping across buffer
        const tRaw = i / bufferLength;
        const t = Math.sin((tRaw * Math.PI) / 2); // shifts more bars into highs (right side)

        // Get smooth gradient
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

  draw();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("visualizer");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Init
fetchTracks();
animateVisualizer();
