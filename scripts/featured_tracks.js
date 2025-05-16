<<<<<<< HEAD
<script src="https://unpkg.com/wavesurfer.js"></script>;
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

const players = [];

function createPlayer(containerId, buttonId, audioFile) {
  const wavesurfer = WaveSurfer.create({
    container: containerId,
=======
const audioFiles = [
  { id: "waveform_never-stop", src: "audio/never_stop.mp3" },
  { id: "waveform_the-journey", src: "audio/the_journey.mp3" },
  {
    id: "waveform_neverending-story",
    src: "audio/neverending_story_vega_REMIX.mp3",
  },
];

const players = [];

// Initialize players
audioFiles.forEach((track, index) => {
  const wavesurfer = WaveSurfer.create({
    container: `#${track.id}`,
>>>>>>> 32fd947d22a74474a7a9cccfa42ee535a2377352
    waveColor: "#3aa39e",
    progressColor: "#216360",
    barWidth: 2,
    height: 60,
    responsive: true,
  });

<<<<<<< HEAD
  wavesurfer.load(audioFile);
  players.push(wavesurfer);

  document.getElementById(buttonId).addEventListener("click", () => {
    // Pause all other players
    players.forEach((player) => {
      if (player !== wavesurfer) player.pause();
    });
    wavesurfer.playPause();
  });
}

createPlayer("#waveform_never-stop", "play-btn", "audio/never_stop.mp3");
createPlayer("#waveform_the-journey", "play-btn2", "audio/the_journey.mp3");
createPlayer(
  "#waveform_neverending-story",
  "play-btn3",
  "audio/neverending_story_vega_REMIX.mp3"
);
=======
  wavesurfer.load(track.src);
  players.push(wavesurfer);
});

// Bind play/pause logic
document.querySelectorAll(".btn-play").forEach((button) => {
  button.addEventListener("click", () => {
    const id = parseInt(button.dataset.id);

    players.forEach((wf, i) => {
      if (i !== id) wf.pause();
    });

    players[id].playPause();
  });
});
>>>>>>> 32fd947d22a74474a7a9cccfa42ee535a2377352
