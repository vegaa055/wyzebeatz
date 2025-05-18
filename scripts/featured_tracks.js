const players = [];
const buttons = [];

async function loadFeaturedTracks() {
  const response = await fetch("scripts/tracks.json");
  const allTracks = await response.json();
  const featuredTracks = allTracks.filter((track) => track.featured);

  const players = [];
  const buttons = [];

  featuredTracks.forEach((track, index) => {
    const wavesurfer = WaveSurfer.create({
      container: `#waveform_${index}`,
      waveColor: "#1c82ad",
      progressColor: "#064663",
      barWidth: 2,
      height: 60,
      responsive: true,
    });

    wavesurfer.load(track.file);
    players.push(wavesurfer);

    const button = document.querySelector(`.btn-play[data-id="${index}"]`);
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
}

document.addEventListener("DOMContentLoaded", loadFeaturedTracks);
