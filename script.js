const grid = document.getElementById("number-grid");
const countLabel = document.getElementById("count");
const randomButton = document.getElementById("random-button");
const clearButton = document.getElementById("clear-button");
const drawButton = document.getElementById("draw-button");
const result = document.getElementById("result");
const drawnNumbersContainer = document.getElementById("drawn-numbers");
const resultCount = document.getElementById("result-count");
const matchMessage = document.getElementById("match-message");

let selected = new Set();

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
  if (selected.has(number)) {
    selected.delete(number);
  } else if (selected.size < 6) {
    selected.add(number);
  }

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
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
