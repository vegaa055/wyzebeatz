const waveforms = [];
const buttons = [];

async function loadTracks() {
  try {
    const response = await fetch("scripts/tracks.json");
    const tracks = await response.json();

    const container = document.getElementById("track-list");

    // Group tracks by genre
    const grouped = tracks.reduce((acc, track) => {
      acc[track.genre] = acc[track.genre] || [];
      acc[track.genre].push(track);
      return acc;
    }, {});

    let id = 0;
    for (const genre in grouped) {
      const genreHeading = document.createElement("h3");
      genreHeading.className = "genre-title";
      genreHeading.textContent = genre;
      container.appendChild(genreHeading);

      grouped[genre].forEach((track) => {
        const card = document.createElement("div");
        card.className = "track-card";

        card.innerHTML = `
          <div class="track-header">
            <button class="btn-play" data-id="${id}"><i class="fas fa-play"></i></button>
            <div class="track-title">${track.title}</div>

          </div>
          <div id="waveform${id}"></div>
        `;

        container.appendChild(card);

        const ws = WaveSurfer.create({
          container: `#waveform${id}`,
          waveColor: "#1c82ad",
          progressColor: "#064663",
          barWidth: 2,
          height: 60,
          responsive: true,
        });

        ws.load(track.file);
        waveforms.push(ws);
        id++;
      });
    }

    // Delay binding buttons until DOM is updated
    setupPlayButtons();
  } catch (error) {
    console.error("Failed to load tracks:", error);
  }
}

function setupPlayButtons() {
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
}

document.addEventListener("DOMContentLoaded", loadTracks);
