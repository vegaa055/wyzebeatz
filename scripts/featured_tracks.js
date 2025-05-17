const audioFiles = [
  { id: "waveform_never-stop", src: "audio/never_stop.mp3" },
  { id: "waveform_the-journey", src: "audio/the_journey.mp3" },
  { id: "waveform_neverending-story", src: "audio/neverending_story_vega_REMIX.mp3" },
];

const players = [];
const buttons = [];

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

document.querySelectorAll(".btn-play").forEach((button, index) => {
  const icon = button.querySelector("i");
  buttons.push({ button, icon });

  button.addEventListener("click", () => {
    players.forEach((wf, i) => {
      if (i !== index) {
        wf.pause();
        buttons[i].icon.classList.remove("fa-pause");
        buttons[i].icon.classList.add("fa-play");
      }
    });

    if (players[index].isPlaying()) {
      players[index].pause();
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      players[index].play();
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  });
});
