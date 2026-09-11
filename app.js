const config = window.APP_CONFIG;
const manifest = window.IMAGE_MANIFEST || {};

const partScreen = document.getElementById("part-screen");
const cueScreen = document.getElementById("cue-screen");
const partList = document.getElementById("part-list");
const partName = document.getElementById("part-name");
const cueImage = document.getElementById("cue-image");
const readyMessage = document.getElementById("ready-message");
const nextCountdown = document.getElementById("next-countdown");
const statusText = document.getElementById("status");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const changePartButton = document.getElementById("change-part");
const fullscreenButton = document.getElementById("fullscreen-button");

let selectedPart = null;
let cycle = [];
let currentIndex = 0;
let countdownIntervalId = null;
let countdownTimeoutId = null;
let running = false;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomWholeSeconds(minSeconds, maxSeconds) {
  const min = Math.ceil(minSeconds);
  const max = Math.floor(maxSeconds);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function availableGroupsFor(part) {
  const partManifest = manifest[part.slug] || {};
  return Object.entries(partManifest)
    .filter(([, images]) => Array.isArray(images) && images.length > 0)
    .sort(([a], [b]) => Number(a) - Number(b));
}

function buildPartButtons() {
  config.parts.forEach((part) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "part-button";
    button.textContent = part.name;
    const groups = availableGroupsFor(part);

    if (groups.length === 0) {
      button.disabled = true;
      button.title = "No images have been added for this part yet.";
      button.style.opacity = "0.45";
      button.style.cursor = "not-allowed";
    } else {
      button.addEventListener("click", () => selectPart(part));
    }
    partList.appendChild(button);
  });
}

function selectPart(part) {
  stopSequence(false);
  selectedPart = part;
  partName.textContent = part.name;
  showReady("Ready");
  hideNextCountdown();
  statusText.textContent = `${availableGroupsFor(part).length} image groups available.`;
  startButton.textContent = "Start";
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
  partScreen.classList.add("hidden");
  cueScreen.classList.remove("hidden");
}

function buildCycle(part) {
  // Shuffle the numbered folders, then choose ONE random image from each folder.
  return shuffle(availableGroupsFor(part)).map(([groupNumber, images]) => ({
    groupNumber,
    imagePath: randomChoice(images)
  }));
}

function showReady(message) {
  cueImage.classList.add("hidden");
  cueImage.removeAttribute("src");
  readyMessage.textContent = message;
  readyMessage.classList.remove("hidden");
}

function showImage(path) {
  readyMessage.classList.add("hidden");
  cueImage.src = encodeURI(path);
  cueImage.classList.remove("hidden");
}

function preloadImage(index) {
  if (index < 0 || index >= cycle.length) return;
  const img = new Image();
  img.src = encodeURI(cycle[index].imagePath);
}

function hideNextCountdown() {
  nextCountdown.classList.add("hidden");
  nextCountdown.textContent = "";
}

function clearCountdownTimers() {
  if (countdownIntervalId !== null) {
    window.clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  if (countdownTimeoutId !== null) {
    window.clearTimeout(countdownTimeoutId);
    countdownTimeoutId = null;
  }
}

function runCountdown(seconds, onTick, onDone) {
  clearCountdownTimers();

  const durationMs = seconds * 1000;
  const endTime = Date.now() + durationMs;
  let lastShown = null;

  const update = () => {
    if (!running) return;
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (remaining !== lastShown && remaining > 0) {
      lastShown = remaining;
      onTick(remaining);
    }
  };

  update();
  countdownIntervalId = window.setInterval(update, 100);
  countdownTimeoutId = window.setTimeout(() => {
    clearCountdownTimers();
    if (running) onDone();
  }, durationMs);
}

function startSequence() {
  if (!selectedPart || running) return;

  cycle = buildCycle(selectedPart);
  if (cycle.length === 0) {
    showReady("No images");
    statusText.textContent = "No numbered folders containing images were found for this part.";
    return;
  }

  currentIndex = 0;
  running = true;
  startButton.classList.add("hidden");
  stopButton.classList.remove("hidden");
  hideNextCountdown();

  // Preload the first image while the opening countdown is running.
  preloadImage(0);

  const initialDelay = randomWholeSeconds(
    config.initialDelayMin ?? 10,
    config.initialDelayMax ?? 45
  );

  statusText.textContent = "Starting soon…";
  runCountdown(
    initialDelay,
    (remaining) => showReady(`Starting in ${remaining}`),
    () => showCurrentCue()
  );
}

function showCurrentCue() {
  if (!running) return;

  const item = cycle[currentIndex];
  showImage(item.imagePath);
  statusText.textContent = `${currentIndex + 1} of ${cycle.length}`;

  // The final image stays on screen and has no next-image countdown.
  if (currentIndex === cycle.length - 1) {
    finishSequence();
    return;
  }

  preloadImage(currentIndex + 1);

  const waitSeconds = randomWholeSeconds(
    selectedPart.intervalMin,
    selectedPart.intervalMax
  );

  nextCountdown.classList.remove("hidden");
  runCountdown(
    waitSeconds,
    (remaining) => {
      nextCountdown.textContent = `Next: ${remaining}`;
    },
    () => {
      hideNextCountdown();
      currentIndex += 1;
      showCurrentCue();
    }
  );
}

function finishSequence() {
  running = false;
  clearCountdownTimers();
  hideNextCountdown();

  // Leave the final image visible until Start again is pressed.
  statusText.textContent = `Cycle complete - ${cycle.length} groups used.`;
  startButton.textContent = "Start again";
  startButton.classList.remove("hidden");
  stopButton.classList.add("hidden");
}

function stopSequence(showStatus = true) {
  running = false;
  clearCountdownTimers();
  hideNextCountdown();

  if (selectedPart) {
    showReady("Ready");
    if (showStatus) statusText.textContent = "Stopped.";
    startButton.textContent = "Start";
    startButton.classList.remove("hidden");
    stopButton.classList.add("hidden");
  }
}

function changePart() {
  stopSequence(false);
  selectedPart = null;
  cueScreen.classList.add("hidden");
  partScreen.classList.remove("hidden");
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (_) {}
}

startButton.addEventListener("click", startSequence);
stopButton.addEventListener("click", () => stopSequence(true));
changePartButton.addEventListener("click", changePart);
fullscreenButton.addEventListener("click", toggleFullscreen);

buildPartButtons();
