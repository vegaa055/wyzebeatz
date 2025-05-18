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
        <div class="track-body">
          <div class="waveform-container">
            <div id="waveform${id}"></div>
            <div class="volume-controls">
              <input
                type="range"
                class="volume-slider"
                data-id="${id}"
                min="0"
                max="1"
                step="0.01"
                value="1"
              />
              <button class="mute-btn" data-id="${id}">
                <i class="fas fa-volume-up"></i>
              </button>
            </div>
          </div>
        </div>
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
  // Volume control
  document.querySelectorAll(".volume-slider").forEach((slider) => {
    const id = parseInt(slider.dataset.id);
    slider.addEventListener("input", () => {
      waveforms[id].setVolume(parseFloat(slider.value));
    });
  });
  document.querySelectorAll(".mute-btn").forEach((btn) => {
    const id = parseInt(btn.dataset.id);
    const icon = btn.querySelector("i");
    const slider = document.querySelector(`.volume-slider[data-id="${id}"]`);
    let previousVolume = parseFloat(slider.value);

    btn.addEventListener("click", () => {
      const currentVolume = waveforms[id].getVolume();

      if (currentVolume > 0) {
        previousVolume = currentVolume;
        waveforms[id].setVolume(0);
        slider.value = 0;
        icon.classList.remove("fa-volume-up");
        icon.classList.add("fa-volume-mute");
      } else {
        waveforms[id].setVolume(previousVolume || 1);
        slider.value = previousVolume || 1;
        icon.classList.remove("fa-volume-mute");
        icon.classList.add("fa-volume-up");
      }
    });
  });
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
          buttons[i].button.classList.remove("flipped");
        }
      });

      if (waveforms[index].isPlaying()) {
        waveforms[index].pause();
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
        button.classList.remove("flipped");
      } else {
        waveforms[index].play();
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
        button.classList.add("flipped");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", loadTracks);
