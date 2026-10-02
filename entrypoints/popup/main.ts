import { browser } from "wxt/browser";
import type { ScrollMessage, ScrollStatus } from "../../utils/messages";
import "../../assets/styles/popup.css";

const durationInput = document.querySelector<HTMLInputElement>("#duration");
const startButton = document.querySelector<HTMLButtonElement>("#start-button");
const stopButton = document.querySelector<HTMLButtonElement>("#stop-button");
const statusText = document.querySelector<HTMLElement>("#status-text");
const countdown = document.querySelector<HTMLElement>("#countdown");
const statusCard = document.querySelector<HTMLElement>(".status-card");
const quickButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-minutes]")];

if (!durationInput || !startButton || !stopButton || !statusText || !countdown || !statusCard) {
  throw new Error("Scroll Reels popup is missing required controls.");
}

let activeTabId: number | null = null;
let pollTimer: number | null = null;
let runningDurationMinutes: number | null = null;

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const syncQuickButtons = () => {
  const selectedMinutes = Number(durationInput.value);
  quickButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.minutes) === selectedMinutes);
  });
};

const setStatus = (status: "idle" | "running" | "complete", remainingSeconds = 0) => {
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
};

const setUnavailable = () => {
  statusCard.classList.remove("running");
  statusText.textContent = "Open an Instagram Reel";
  countdown.textContent = "--:--";
  startButton.disabled = true;
  stopButton.disabled = true;
  durationInput.disabled = true;
  quickButtons.forEach((button) => {
    button.disabled = true;
  });
};

const sendToPage = async (message: ScrollMessage): Promise<ScrollStatus | null> => {
  if (activeTabId === null) return null;
  try {
    return await browser.tabs.sendMessage(activeTabId, message) as ScrollStatus;
  } catch {
    return null;
  }
};

const refreshStatus = async () => {
  const response = await sendToPage({ type: "GET_STATUS" });
  if (!response || !response.isReelsPage) {
    runningDurationMinutes = null;
    setUnavailable();
    return;
  }
  setStatus(response.running ? "running" : response.completed ? "complete" : "idle", response.remainingSeconds);
  if (response.running) {
    runningDurationMinutes ??= response.durationMinutes;
    durationInput.value = String(runningDurationMinutes);
    syncQuickButtons();
  } else {
    runningDurationMinutes = null;
  }
};

const beginPolling = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id ?? null;
  await refreshStatus();
  pollTimer = window.setInterval(() => void refreshStatus(), 1000);
};

durationInput.addEventListener("input", syncQuickButtons);

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    durationInput.value = button.dataset.minutes ?? "10";
    syncQuickButtons();
  });
});

startButton.addEventListener("click", async () => {
  const minutes = Math.min(180, Math.max(1, Number(durationInput.value) || 10));
  durationInput.value = String(minutes);
  runningDurationMinutes = minutes;
  syncQuickButtons();
  await sendToPage({ type: "START", minutes });
  await refreshStatus();
});

stopButton.addEventListener("click", async () => {
  await sendToPage({ type: "STOP" });
  runningDurationMinutes = null;
  await refreshStatus();
});

window.addEventListener("unload", () => {
  if (pollTimer !== null) window.clearInterval(pollTimer);
});

void beginPolling();
