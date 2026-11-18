const grid = document.getElementById("number-grid");
const countLabel = document.getElementById("count");
const randomButton = document.getElementById("random-button");
const clearButton = document.getElementById("clear-button");
const drawButton = document.getElementById("draw-button");
const soundToggle = document.getElementById("sound-toggle");
const result = document.getElementById("result");
const drawnNumbersContainer = document.getElementById("drawn-numbers");
const resultCount = document.getElementById("result-count");
const matchMessage = document.getElementById("match-message");

let selected = new Set();
let soundEnabled = true;
let audioContext;

function playTone(frequency, startTime = 0, duration = 0.12, type = "sine", volume = 0.07) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ??= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + startTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch (error) {
    // Sound is optional; the game remains usable if Web Audio is unavailable.
  }
}

function playSelectionSound(isSelected) {
  playTone(isSelected ? 620 : 380, 0, 0.08, "triangle", 0.045);
}

function playRandomSound() {
  [440, 554, 659].forEach((frequency, index) => {
    playTone(frequency, index * 0.07, 0.12, "sine", 0.04);
  });
}

function playDrawSound(matchCount) {
  [392, 440, 523, 587, 659, 784].forEach((frequency, index) => {
    playTone(frequency, index * 0.11, 0.16, "sine", 0.045);
  });

  if (matchCount > 0) {
    [659, 784, 988].forEach((frequency, index) => {
      playTone(frequency, 0.78 + index * 0.12, 0.24, "triangle", 0.055);
    });
  } else {
    playTone(220, 0.82, 0.3, "sine", 0.04);
  }
}

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Ton ausschalten" : "Ton einschalten");
  soundToggle.textContent = soundEnabled ? "🔊 Ton an" : "🔇 Ton aus";
  if (soundEnabled) playTone(660, 0, 0.1, "sine", 0.04);
});

for (let number = 1; number <= 49; number += 1) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "number-button";
  button.textContent = number;
  button.dataset.number = number;
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => toggleNumber(number));
  grid.appendChild(button);
}

function toggleNumber(number) {
  let changed = false;
  if (selected.has(number)) {
    selected.delete(number);
    changed = true;
  } else if (selected.size < 6) {
    selected.add(number);
    changed = true;
  }

  if (changed) playSelectionSound(selected.has(number));
  result.hidden = true;
  updateSelection();
}

function updateSelection() {
  countLabel.textContent = `${selected.size} / 6`;
  drawButton.disabled = selected.size !== 6;

  grid.querySelectorAll(".number-button").forEach((button) => {
    const number = Number(button.dataset.number);
    const isSelected = selected.has(number);
    button.classList.toggle("selected", isSelected);
    button.classList.remove("matched");
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function drawNumbers() {
  const pool = Array.from({ length: 49 }, (_, index) => index + 1);
  const drawn = [];

  while (drawn.length < 6) {
    const index = Math.floor(Math.random() * pool.length);
    drawn.push(pool.splice(index, 1)[0]);
  }

  return drawn.sort((a, b) => a - b);
}

randomButton.addEventListener("click", () => {
  const numbers = drawNumbers();
  selected = new Set(numbers);
  result.hidden = true;
  updateSelection();
  playRandomSound();
});

clearButton.addEventListener("click", () => {
  selected.clear();
  result.hidden = true;
  updateSelection();
});

drawButton.addEventListener("click", () => {
  if (selected.size !== 6) return;

  const drawn = drawNumbers();
  const matches = drawn.filter((number) => selected.has(number));

  drawnNumbersContainer.replaceChildren();
  drawn.forEach((number) => {
    const ball = document.createElement("div");
    ball.className = "drawn-ball";
    if (matches.includes(number)) ball.classList.add("match");
    ball.textContent = number;
    drawnNumbersContainer.appendChild(ball);
  });

  resultCount.textContent = `${matches.length} Treffer`;

  if (matches.length === 0) {
    matchMessage.textContent = "Diesmal kein Treffer. Neue Runde?";
  } else {
    matchMessage.innerHTML = `<strong>${matches.length} richtige Zahl${matches.length === 1 ? "" : "en"}</strong>: ${matches.join(", ")}`;
  }

  grid.querySelectorAll(".number-button").forEach((button) => {
    const number = Number(button.dataset.number);
    button.classList.toggle("matched", matches.includes(number));
  });

  result.hidden = false;
  playDrawSound(matches.length);
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
