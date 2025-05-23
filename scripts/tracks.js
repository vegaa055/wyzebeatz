// scripts/tracks.js

async function loadTracks() {
  const response = await fetch("scripts/tracks.json");
  const allTracks = await response.json();

  const trackListContainer = document.getElementById("track-list");
  const portfolioSection = document.querySelector("#featured-tracks");

  const players = [];
  const buttons = [];

  // FEATURED TRACKS (Index Page)
  if (portfolioSection) {
    const featuredTracks = allTracks.filter((t) => t.featured);

    const nowPlayingBar = document.getElementById("now-playing");
    const nowPlayingTitle = document.getElementById("now-playing-title");

    featuredTracks.forEach((track, index) => {
      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="inner-border">
              <h5 class="card-title">${track.title}</h5>
              <p class="card-text">${track.genre} Instrumentals</p>
              <div class="mt-3">
                <div id="waveform_${index}" class="mb-3"></div>
                <div class="d-flex align-items-center justify-content-center gap-3">
                  <button class="btn-play" data-id="${index}" data-title="${track.title}">
                    <i class="fas fa-play"></i>
                  </button>
                  <input
                    type="range"
                    class="volume-slider"
                    data-id="${index}"
                    min="0"
                    max="1"
                    step="0.01"
                    value="1"
                    style="flex: 1; max-width: 120px;"
                  />
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

      const ws = WaveSurfer.create({
        container: `#waveform_${index}`,
        waveColor: "#1c82ad",
        progressColor: "#064663",
        barWidth: 2,
        height: 60,
        responsive: true,
      });

      ws.load(track.file);
      players.push(ws);
    });

    setTimeout(() => {
      document.querySelectorAll(".btn-play").forEach((button, index) => {
        const icon = button.querySelector("i");
        const title = button.dataset.title;

        buttons.push({ button, icon });

        button.addEventListener("click", () => {
          players.forEach((wf, i) => {
            if (i !== index) {
              wf.pause();
              buttons[i].icon.classList.remove("fa-pause");
              buttons[i].icon.classList.add("fa-play");
              buttons[i].button.classList.remove("flipped");
            }
          });

          if (players[index].isPlaying()) {
            players[index].pause();
            icon.classList.remove("fa-pause");
            icon.classList.add("fa-play");
            button.classList.remove("flipped");

            if (nowPlayingBar) {
              nowPlayingBar.classList.add("d-none");
              nowPlayingTitle.textContent = "";
            }
            const visualizer = document.getElementById(
              "now-playing-visualizer"
            );
            if (visualizer) visualizer.classList.remove("d-none");
          } else {
            players[index].play();
            icon.classList.remove("fa-play");
            icon.classList.add("fa-pause");
            button.classList.add("flipped");

            if (nowPlayingBar && nowPlayingTitle) {
              nowPlayingTitle.textContent = title;
              nowPlayingBar.classList.remove("d-none");
            }
            const visualizer = document.getElementById(
              "now-playing-visualizer"
            );
            if (visualizer) visualizer.classList.remove("d-none");
          }
        });
      });

      document.querySelectorAll(".volume-slider").forEach((slider) => {
        const id = parseInt(slider.dataset.id);
        slider.addEventListener("input", () => {
          const value = parseFloat(slider.value);
          const icon = document.querySelector(`.mute-btn[data-id="${id}"] i`);
          slider.classList.remove("muted");
          players[id].setVolume(value);
          updateSliderGradient(slider);

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
        const slider = document.querySelector(
          `.volume-slider[data-id='${id}']`
        );
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
    }, 100);
  }

  // FULL LIBRARY (Library Page)
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
              <button class="btn-play" data-id="${id}"><i class="fas fa-play"></i></button>
              <div class="track-title">${track.title}</div>
            </div>
            <div class="track-body">
              <div class="waveform-container">
                <div id="waveform_${id}"></div>
                <div class="volume-controls">
                  <input type="range" class="volume-slider" data-id="${id}" min="0" max="1" step="0.01" value="1" />
                  <button class="mute-btn" data-id="${id}"><i class="fas fa-volume-up"></i></button>
                </div>
              </div>
            </div>
          </div>
        `;

        trackListContainer.appendChild(card);

        const ws = WaveSurfer.create({
          container: `#waveform_${id}`,
          waveColor: "#1c82ad",
          progressColor: "#064663",
          barWidth: 2,
          height: 60,
          responsive: true,
        });

        ws.load(track.file);
        players.push(ws);
        id++;
      });
    }

    setTimeout(() => {
      document.querySelectorAll(".btn-play").forEach((button, index) => {
        const icon = button.querySelector("i");
        buttons.push({ button, icon });

        button.addEventListener("click", () => {
          const nowPlayingBar = document.getElementById("now-playing");
          const nowPlayingTitle = document.getElementById("now-playing-title");

          players.forEach((wf, i) => {
            if (i !== index) {
              wf.pause();
              buttons[i].icon.classList.remove("fa-pause");
              buttons[i].icon.classList.add("fa-play");
              buttons[i].button.classList.remove("flipped");
            }
          });

          if (players[index].isPlaying()) {
            players[index].pause();
            icon.classList.remove("fa-pause");
            icon.classList.add("fa-play");
            button.classList.remove("flipped");
            if (
              nowPlayingBar &&
              nowPlayingTitle &&
              !players.some((p) => p.isPlaying())
            ) {
              nowPlayingBar.classList.add("d-none");
              nowPlayingTitle.textContent = "";
              const visualizer = document.getElementById(
                "now-playing-visualizer"
              );
              if (visualizer) visualizer.classList.add("d-none");
            }
          } else {
            players[index].play();
            icon.classList.remove("fa-play");
            icon.classList.add("fa-pause");
            button.classList.add("flipped");
            if (nowPlayingBar && nowPlayingTitle) {
              nowPlayingTitle.textContent = button
                .closest(".track-card")
                .querySelector(".track-title").textContent;
              nowPlayingBar.classList.remove("d-none");
            }
            const visualizer = document.getElementById(
              "now-playing-visualizer"
            );
            if (visualizer) visualizer.classList.remove("d-none");
          }
        });
      });

      document.querySelectorAll(".volume-slider").forEach((slider) => {
        const id = parseInt(slider.dataset.id);
        slider.addEventListener("input", () => {
          const value = parseFloat(slider.value);
          const icon = document.querySelector(`.mute-btn[data-id="${id}"] i`);
          slider.classList.remove("muted");
          players[id].setVolume(value);
          updateSliderGradient(slider);

          slider.setAttribute("data-tooltip", `${Math.round(value * 100)}%`);

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
        const slider = document.querySelector(
          `.volume-slider[data-id='${id}']`
        );
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
    }, 100);

    slider.setAttribute("data-tooltip", "100%");
  }
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
