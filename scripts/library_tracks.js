const audioFiles = [
  { id: "waveform0", src: "audio/never_stop.mp3" },
  { id: "waveform1", src: "audio/the_journey.mp3" },
  { id: "waveform2", src: "audio/void_trip.mp3" },
  { id: "waveform3", src: "audio/built_4_this.mp3" },
  { id: "waveform4", src: "audio/ride_with_me.mp3" },
  { id: "waveform5", src: "audio/raw.mp3" },
  { id: "waveform6", src: "audio/all_the_smoke.mp3" },
  { id: "waveform7", src: "audio/neverending_story_vega_REMIX.mp3" },
  { id: "waveform8", src: "audio/singularity.mp3" },
  { id: "waveform9", src: "audio/dystopian_dreamz.mp3" },
  { id: "waveform10", src: "audio/summer_nights.mp3" },
  { id: "waveform11", src: "audio/waves.mp3" },
];

const waveforms = [];
const buttons = [];

// Init players
audioFiles.forEach((track, index) => {
  const ws = WaveSurfer.create({
    container: `#${track.id}`,
    waveColor: "#1c82ad",
    progressColor: "#064663",
    barWidth: 2,
    height: 60,
    responsive: true,
  });

  ws.load(track.src);
  waveforms.push(ws);
});

// Bind play/pause buttons
document.querySelectorAll(".btn-play").forEach((button, index) => {
  const icon = button.querySelector("i");
  buttons.push({ button, icon });

  button.addEventListener("click", () => {
    waveforms.forEach((wf, i) => {
      if (i !== index) {
        wf.pause();
        buttons[i].icon.classList.remove("fa-pause");
        buttons[i].icon.classList.add("fa-play");
      }
    });

    if (waveforms[index].isPlaying()) {
      waveforms[index].pause();
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      waveforms[index].play();
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  });
});
