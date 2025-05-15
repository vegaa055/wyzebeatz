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
    waveColor: "#3aa39e",
    progressColor: "#216360",
    barWidth: 2,
    height: 60,
    responsive: true,
  });

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
