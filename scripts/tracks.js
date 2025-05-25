// scripts/tracks.js

const players = [];
const buttons = [];

// Load the tracks from the JSON file
// This function fetches the tracks from the JSON filter

async function loadTracks() {
  const response = await fetch("scripts/tracks.json");
  const allTracks = await response.json();

  const trackListContainer = document.getElementById("track-list");
  const portfolioSection = document.querySelector("#featured-tracks");

  // check if in portfolio section
  if (portfolioSection) {
    const featuredTracks = allTracks.filter((t) => t.featured);
    featuredTracks.forEach((track, index) => {
      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="inner-border">
              <h5 class="track-title text-center">${track.title}</h5>
              <p class="card-text">${track.genre}</p>
              <div class="mt-3">
                <div id="waveform_${index}" class="mb-3"></div>
                <div class="d-flex align-items-center justify-content-center gap-3">
                  <button
                    class="btn-play"
                    data-id="${index}"
                    data-title="${track.title}"
                  >
                    <i class="fas fa-play"></i>
                  </button>
                  <div class="volume-slider-wrapper" data-tooltip="100%">
                    <input
                      type="range"
                      class="volume-slider"
                      data-id="${index}"
                      min="0"
                      max="1"
                      step="0.01"
                      value="1"
                    />
                  </div>

                  <button class="mute-btn" data-id="${index}">
                    <i class="fas fa-volume-up"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      portfolioSection.appendChild(col);

      const ws = createWaveSurferInstance(index, track.file);
      setupFinishHandler(ws);
    });
  }

  // check if in track list section
  if (trackListContainer) {
    const grouped = allTracks.reduce((acc, track) => {
      acc[track.genre] = acc[track.genre] || [];
      acc[track.genre].push(track);
      return acc;
    }, {});

    let id = 0;
    for (const genre in grouped) {
      const heading = document.createElement("h3");
      heading.className = "genre-title";
      heading.textContent = genre;
      trackListContainer.appendChild(heading);

      grouped[genre].forEach((track) => {
        const card = document.createElement("div");
        card.className = "track-card";
        card.innerHTML = `
          <div class="inner-border">
            <div class="track-header">
              <div class="track-title">${track.title}</div>
            </div>
            <div class="track-body">
              <div class="waveform-container">
                <div id="waveform_${id}"></div>
                <div class="row">
                  <button
                    class="btn-play col-1"
                    data-id="${id}"
                    data-title="${track.title}"
                  >
                    <i class="fas fa-play"></i>
                  </button>
                  <div class="volume-controls col-10 d-flex align-items-center gap-2">
                    <div class="volume-slider-wrapper" data-tooltip="100%">
                      <input
                        type="range"
                        class="volume-slider"
                        data-id="${id}"
                        min="0"
                        max="1"
                        step="0.01"
                        value="1"
                      />
                    </div>
                    <button class="mute-btn" data-id="${id}">
                      <i class="fas fa-volume-up"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        `;

        trackListContainer.appendChild(card);
        const ws = createWaveSurferInstance(id, track.file);
        setupFinishHandler(ws);
        id++;
      });
    }
  }

  setTimeout(() => {
    bindPlayControls();
    bindVolumeControls();
  }, 100);
}

// Create a WaveSurfer instance for each track
// This function initializes the WaveSurfer instance
// and loads the audio file into it
function createWaveSurferInstance(id, file) {
  const ws = WaveSurfer.create({
    container: `#waveform_${id}`,
    waveColor: "#1c82ad",
    progressColor: "#064663",
    barWidth: 2,
    height: 60,
    responsive: true,
  });
  ws.load(file);
  players.push(ws);
  return ws;
}

// Setup finish handler for each WaveSurfer instance
// This will be called when the track finishes playing
// and will automatically play the next track in the list
// If there are no more tracks, it will hide the now playing bar
// and the visualizer
// It will also remove the playing highlight from the current track
// and add it to the next track If the next track is not available,
// it will hide the now playing bar and the visualizer
function setupFinishHandler(ws) {
  ws.on("finish", () => {
    const index = players.indexOf(ws);
    const nowPlayingBar = document.getElementById("now-playing");
    const nowPlayingTitle = document.getElementById("now-playing-title");
    const visualizer = document.getElementById("now-playing-visualizer");

    if (buttons[index]) {
      buttons[index].icon.classList.remove("fa-pause");
      buttons[index].icon.classList.add("fa-play");
      buttons[index].button.classList.remove("flipped");
    }

    const nextIndex = index + 1;
    if (players[nextIndex]) {
      players[nextIndex].play();
      if (buttons[nextIndex]) {
        buttons[nextIndex].icon.classList.remove("fa-play");
        buttons[nextIndex].icon.classList.add("fa-pause");
        buttons[nextIndex].button.classList.add("flipped");

        // 🔁 Clear all playing highlights
        document
          .querySelectorAll(".track-title")
          .forEach((el) => el.classList.remove("playing"));

        // ✅ Highlight the now-playing title
        const titleEl = buttons[nextIndex].button
          .closest(".track-card, .card")
          .querySelector(".track-title");

        if (titleEl) titleEl.classList.add("playing");
      }

      if (nowPlayingTitle) {
        const title =
          buttons[nextIndex].button.dataset.title || `Track ${nextIndex + 1}`;
        nowPlayingTitle.textContent = title;
      }
      nowPlayingBar?.classList.remove("d-none");
      visualizer?.classList.remove("d-none");
    } else {
      nowPlayingBar?.classList.add("d-none");
      if (nowPlayingTitle) nowPlayingTitle.textContent = "";
      visualizer?.classList.add("d-none");
      document
        .querySelectorAll(".track-title")
        .forEach((el) => el.classList.remove("playing"));
    }
  });
}

function bindPlayControls() {
  document.querySelectorAll(".btn-play").forEach((button, index) => {
    const icon = button.querySelector("i");
    const title = button.dataset.title;
    buttons.push({ button, icon });

    button.addEventListener("click", () => {
      const nowPlayingBar = document.getElementById("now-playing");
      const nowPlayingTitle = document.getElementById("now-playing-title");
      const visualizer = document.getElementById("now-playing-visualizer");

      players.forEach((wf, i) => {
        if (i !== index) {
          wf.pause();
          buttons[i].icon.classList.remove("fa-pause");
          buttons[i].icon.classList.add("fa-play");
          buttons[i].button.classList.remove("flipped");
        }
      });
      document
        .querySelectorAll(".track-title")
        .forEach((el) => el.classList.remove("playing"));

      if (players[index].isPlaying()) {
        players[index].pause();
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
        button.classList.remove("flipped");

        if (!players.some((p) => p.isPlaying())) {
          nowPlayingBar?.classList.add("d-none");
          if (nowPlayingTitle) nowPlayingTitle.textContent = "";
          visualizer?.classList.add("d-none");
          document
            .querySelectorAll(".track-title")
            .forEach((el) => el.classList.remove("playing"));
        }
      } else {
        players[index].play();
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
        button.classList.add("flipped");
        const titleElement = button
          .closest(".track-card, .card")
          .querySelector(".track-title");
        if (titleElement) {
          titleElement.classList.add("playing");
        }

        if (nowPlayingBar && nowPlayingTitle) {
          nowPlayingTitle.textContent = title;
          nowPlayingBar.classList.remove("d-none");
        }
        visualizer?.classList.remove("d-none");
      }
    });
  });
}

function bindVolumeControls() {
  document.querySelectorAll(".volume-slider").forEach((slider) => {
    const id = parseInt(slider.dataset.id);
    slider.parentElement.setAttribute("data-tooltip", "100%");

    slider.addEventListener("input", () => {
      const value = parseFloat(slider.value);
      const icon = document.querySelector(`.mute-btn[data-id="${id}"] i`);
      slider.classList.remove("muted");
      players[id].setVolume(value);
      updateSliderGradient(slider);
      slider.parentElement.setAttribute(
        "data-tooltip",
        `${Math.round(value * 100)}%`
      );

      if (value === 0) {
        icon.classList.remove("fa-volume-up");
        icon.classList.add("fa-volume-mute");
      } else {
        icon.classList.remove("fa-volume-mute");
        icon.classList.add("fa-volume-up");
      }
    });
  });

  document.querySelectorAll(".mute-btn").forEach((btn) => {
    const id = parseInt(btn.dataset.id);
    const icon = btn.querySelector("i");
    const slider = document.querySelector(`.volume-slider[data-id='${id}']`);
    let previousVolume = parseFloat(slider.value);

    btn.addEventListener("click", () => {
      if (players[id].getVolume() > 0) {
        previousVolume = players[id].getVolume();
        players[id].setVolume(0);
        slider.value = 0;
        slider.classList.add("muted");
        icon.classList.remove("fa-volume-up");
        icon.classList.add("fa-volume-mute");
        updateSliderGradient(slider);
      } else {
        players[id].setVolume(previousVolume || 1);
        slider.value = previousVolume || 1;
        slider.classList.remove("muted");
        icon.classList.remove("fa-volume-mute");
        icon.classList.add("fa-volume-up");
        updateSliderGradient(slider);
      }
    });
  });
}

function updateSliderGradient(slider) {
  const val = parseFloat(slider.value) * 100;
  if (slider.classList.contains("muted")) {
    slider.style.background = `linear-gradient(to right, #444 100%, #444 0%)`;
  } else {
    slider.style.background = `linear-gradient(to right, #395B64 ${val}%, #1e1e1e ${val}%)`;
  }
}

document.addEventListener("DOMContentLoaded", loadTracks);
