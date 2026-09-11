// ============================================================
// SETTINGS
// Change values in this section later.
// Times are in SECONDS.
// ============================================================

const PARTS = [
  { name: "Flute", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Clarinet in B♭", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Horn in F", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Trumpet in B♭", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Tenor Trombone", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Percussion", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Piano", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Violin 1", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Violin 2", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Viola", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Violoncello", min: 1, max: 7, intervalMin: 8, intervalMax: 12 },
  { name: "Contrabass", min: 1, max: 7, intervalMin: 8, intervalMax: 12 }
];

// ============================================================
// APP CODE
// You should not normally need to edit below this line.
// ============================================================

const partScreen = document.getElementById("part-screen");
const cueScreen = document.getElementById("cue-screen");
const partList = document.getElementById("part-list");
const partName = document.getElementById("part-name");
const cue = document.getElementById("cue");
const statusText = document.getElementById("status");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const changePartButton = document.getElementById("change-part");

let selectedPart = null;
let remainingCues = [];
let timerId = null;
let running = false;
let shownCount = 0;

function buildPartButtons() {
  PARTS.forEach((part) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "part-button";
    button.textContent = part.name;
    button.addEventListener("click", () => selectPart(part));
    partList.appendChild(button);
  });
}

function selectPart(part) {
  stopSequence();

  selectedPart = part;
  partName.textContent = part.name;
  cue.textContent = "—";
  statusText.textContent = `Ready · cues ${part.min}–${part.max}`;

  partScreen.classList.add("hidden");
  cueScreen.classList.remove("hidden");

  startButton.textContent = "Start";
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
}

function makeCuePool(min, max) {
  const values = [];

  for (let value = min; value <= max; value += 1) {
    values.push(value);
  }

  // Fisher-Yates shuffle:
  // every value appears exactly once, in a random order.
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  return values;
}

function randomIntervalMilliseconds(minSeconds, maxSeconds) {
  const minMs = minSeconds * 1000;
  const maxMs = maxSeconds * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function startSequence() {
  if (!selectedPart || running) return;

  remainingCues = makeCuePool(selectedPart.min, selectedPart.max);
  shownCount = 0;
  running = true;

  startButton.classList.add("hidden");
  stopButton.classList.remove("hidden");

  showNextCue();
}

function showNextCue() {
  if (!running) return;

  if (remainingCues.length === 0) {
    finishSequence();
    return;
  }

  const nextCue = remainingCues.shift();
  shownCount += 1;

  const total = selectedPart.max - selectedPart.min + 1;
  cue.textContent = nextCue;
  statusText.textContent = `${shownCount} of ${total}`;

  if (remainingCues.length === 0) {
    // Keep the final cue visible. The cycle finishes immediately after it appears.
    finishSequence(true);
    return;
  }

  const waitMs = randomIntervalMilliseconds(
    selectedPart.intervalMin,
    selectedPart.intervalMax
  );

  timerId = window.setTimeout(showNextCue, waitMs);
}

function finishSequence(keepFinalCue = false) {
  running = false;

  if (timerId !== null) {
    window.clearTimeout(timerId);
    timerId = null;
  }

  if (!keepFinalCue) {
    cue.textContent = "—";
  }

  statusText.textContent = "Cycle complete — all cues have been used.";
  startButton.textContent = "Start again";
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
}

function stopSequence() {
  running = false;

  if (timerId !== null) {
    window.clearTimeout(timerId);
    timerId = null;
  }

  if (selectedPart) {
    cue.textContent = "—";
    statusText.textContent = "Stopped";
    startButton.textContent = "Start";
    startButton.classList.remove("hidden");
    stopButton.classList.add("hidden");
  }
}

function changePart() {
  stopSequence();
  selectedPart = null;
  cueScreen.classList.add("hidden");
  partScreen.classList.remove("hidden");
}

startButton.addEventListener("click", startSequence);
stopButton.addEventListener("click", stopSequence);
changePartButton.addEventListener("click", changePart);

buildPartButtons();
