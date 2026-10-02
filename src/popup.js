const durationInput = document.querySelector("#duration");
const startButton = document.querySelector("#start-button");
const stopButton = document.querySelector("#stop-button");
const statusText = document.querySelector("#status-text");
const countdown = document.querySelector("#countdown");
const statusCard = document.querySelector(".status-card");
const quickButtons = [...document.querySelectorAll("[data-minutes]")];

let activeTabId = null;
let pollTimer = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setStatus(status, remainingSeconds = 0) {
  const running = status === "running";
  statusCard.classList.toggle("running", running);
  statusText.textContent = running ? "Auto scrolling" : status === "complete" ? "Finished" : "Not running";
  countdown.textContent = running ? formatTime(remainingSeconds) : "--:--";
  startButton.disabled = running;
  stopButton.disabled = !running;
  durationInput.disabled = running;
  quickButtons.forEach((button) => {
    button.disabled = running;
  });
}

function syncQuickButtons() {
  const selectedMinutes = Number(durationInput.value);
  quickButtons.forEach((button) => button.classList.toggle("selected", Number(button.dataset.minutes) === selectedMinutes));
}

async function sendToPage(message) {
  if (!activeTabId) return null;
  try {
    return await chrome.tabs.sendMessage(activeTabId, message);
  } catch {
    return null;
  }
}

async function refreshStatus() {
  const response = await sendToPage({ type: "GET_STATUS" });
  if (!response) return;
  setStatus(response.running ? "running" : response.completed ? "complete" : "idle", response.remainingSeconds);
  if (response.running && response.durationMinutes) {
    durationInput.value = response.durationMinutes;
    syncQuickButtons();
  }
}

chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  activeTabId = tab?.id;
  refreshStatus();
  pollTimer = setInterval(refreshStatus, 1000);
});

durationInput.addEventListener("input", () => {
  syncQuickButtons();
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    durationInput.value = button.dataset.minutes;
    syncQuickButtons();
  });
});

startButton.addEventListener("click", async () => {
  const minutes = Math.min(180, Math.max(1, Number(durationInput.value) || 10));
  durationInput.value = minutes;
  syncQuickButtons();
  await sendToPage({ type: "START", minutes });
  await refreshStatus();
});

stopButton.addEventListener("click", async () => {
  await sendToPage({ type: "STOP" });
  await refreshStatus();
});

window.addEventListener("unload", () => clearInterval(pollTimer));
