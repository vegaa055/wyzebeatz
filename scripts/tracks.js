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

    featuredTracks.forEach((track, index) => {
      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="inner-border">
              <h5 class="card-title">${track.title}</h5>
              <p class="card-text">${track.genre} Instrumental</p>
              <div class="text-center mt-3">
                <div id="waveform_${index}"></div>
                  <button class="btn-play mt-2" data-id="${index}">
                    <i class="fas fa-play"></i>
                  </button>
                <div class="volume-controls justify-content-center mt-2">
                  <input
                    type="range"
                    class="volume-slider"
                    data-id="${index}"
                    min="0"
                    max="1"
                    step="0.01"
                    value="1"
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
          } else {
            players[index].play();
            icon.classList.remove("fa-play");
            icon.classList.add("fa-pause");
            button.classList.add("flipped");
          }
        });
      });

      document.querySelectorAll(".volume-slider").forEach((slider) => {
        const id = parseInt(slider.dataset.id);
        slider.addEventListener("input", () => {
          slider.classList.remove("muted");
          players[id].setVolume(parseFloat(slider.value));
          updateSliderGradient(slider);
        });
        updateSliderGradient(slider);
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
          } else {
            players[index].play();
            icon.classList.remove("fa-play");
            icon.classList.add("fa-pause");
            button.classList.add("flipped");
          }
        });
      });

      document.querySelectorAll(".volume-slider").forEach((slider) => {
        const id = parseInt(slider.dataset.id);
        slider.addEventListener("input", () => {
          slider.classList.remove("muted");
          players[id].setVolume(parseFloat(slider.value));
          updateSliderGradient(slider);
        });
        updateSliderGradient(slider);
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
}

function updateSliderGradient(slider) {
  const val = parseFloat(slider.value) * 100;
  if (slider.classList.contains("muted")) {
    slider.style.background = `linear-gradient(to right, #444 100%, #444 0%)`;
  } else {
    slider.style.background = `linear-gradient(to right, #3aa39e ${val}%, #1e1e1e ${val}%)`;
  }
}

document.addEventListener("DOMContentLoaded", loadTracks);
