const audioFiles = [
  { id: "waveform0", src: "audio/never_stop.mp3" },
  { id: "waveform1", src: "audio/the_journey.mp3" },
  { id: "waveform2", src: "audio/neverending_story_vega_REMIX.mp3" },
];

const waveforms = [];

audioFiles.forEach((track, index) => {
  const ws = WaveSurfer.create({
    container: `#${track.id}`,
    waveColor: "#3aa39e",
    progressColor: "#216360",
    barWidth: 2,
    height: 60,
    responsive: true,
  });

  ws.load(track.src);
  waveforms.push(ws);
});

document.querySelectorAll(".btn-play").forEach((button) => {
  button.addEventListener("click", () => {
    const id = parseInt(button.dataset.id);

    // Pause all others
    waveforms.forEach((wf, i) => {
      if (i !== id) wf.pause();
    });

    waveforms[id].playPause();
  });
});
