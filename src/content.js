(() => {
  const AUTO_SCROLL_FALLBACK = 9000;
  const NAVIGATION_SETTLE_DELAY = 800;
  const ROOT_ID = "reelflow-root";
  const state = {
    running: false,
    completed: false,
    durationMinutes: 10,
    remainingSeconds: 0,
    isReelsPage: false,
    advanceId: null,
    timerId: null
  };
  let lastNavigationAt = 0;

  const isReelsPage = () => /^\/reels?(?:\/|$)/.test(window.location.pathname);

  function formatTime(totalSeconds) {
    const minutes = Math.floor(Math.max(0, totalSeconds) / 60).toString().padStart(2, "0");
    const seconds = Math.max(0, totalSeconds) % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  function updatePageState() {
    state.isReelsPage = isReelsPage();
    const root = document.getElementById(ROOT_ID);
    if (root) root.hidden = !state.isReelsPage;
  }

  function getStatus() {
    return {
      running: state.running,
      completed: state.completed,
      durationMinutes: state.durationMinutes,
      remainingSeconds: state.remainingSeconds,
      isReelsPage: state.isReelsPage
    };
  }

  function updateDock() {
    const meta = document.querySelector(".reelflow-meta");
    const label = document.querySelector(".reelflow-meta span");
    const value = document.querySelector(".reelflow-meta strong");
    if (!meta || !label || !value) return;
    meta.classList.toggle("running", state.running);
    meta.classList.toggle("completed", state.completed && !state.running);
    label.textContent = state.running ? "running" : state.completed ? "done" : "ready";
    value.textContent = state.running ? formatTime(state.remainingSeconds) : state.completed ? "Finished" : "--:--";
  }

  function clearTimers() {
    window.clearTimeout(state.advanceId);
    window.clearInterval(state.timerId);
    state.advanceId = null;
    state.timerId = null;
  }

  function stopAutoScroll(completed = false) {
    clearTimers();
    state.running = false;
    state.completed = completed;
    state.remainingSeconds = completed ? 0 : state.remainingSeconds;
    updateDock();
  }

  function activateNativeControl(control) {
    if (typeof control.click === "function") {
      control.click();
      return true;
    }
    if (typeof control.dispatchEvent === "function") {
      control.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  }

  function navigate(direction) {
    if (!state.isReelsPage) return;
    lastNavigationAt = Date.now();
    const directionName = direction > 0 ? "next" : "previous";
    const nativeButton = [...document.querySelectorAll('button, [role="button"]')].find((button) => {
      const label = [button.getAttribute("aria-label"), button.getAttribute("title"), button.textContent]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return label.includes(`${directionName} reel`);
    });
    if (nativeButton && activateNativeControl(nativeButton)) {
      return;
    }

    const key = direction > 0 ? "ArrowDown" : "ArrowUp";
    const activeElement = document.activeElement;
    const isTyping = activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);
    if (!isTyping) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key, code: key, bubbles: true, cancelable: true }));
    }

    const wheelTarget = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) || document.body;
    wheelTarget.dispatchEvent(new WheelEvent("wheel", {
      deltaY: direction * Math.max(500, window.innerHeight * 0.9),
      deltaMode: 0,
      bubbles: true,
      cancelable: true
    }));

    window.scrollBy({ top: direction * window.innerHeight * 0.92, behavior: "smooth" });
  }

  function isCurrentVideo(video) {
    const rect = video.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return rect.left <= centerX && rect.right >= centerX && rect.top <= centerY && rect.bottom >= centerY;
  }

  function getCurrentVideo() {
    return [...document.querySelectorAll("video")].find(isCurrentVideo) || null;
  }

  function scheduleNextAdvance() {
    window.clearTimeout(state.advanceId);
    if (!state.running) return;

    const video = getCurrentVideo();
    const videoDuration = Number.isFinite(video?.duration) && video.duration > 0
      ? Math.min(60000, Math.max(3000, video.duration * 1000 + 500))
      : AUTO_SCROLL_FALLBACK;

    state.advanceId = window.setTimeout(() => {
      if (!state.running) return;
      navigate(1);
      state.advanceId = window.setTimeout(scheduleNextAdvance, NAVIGATION_SETTLE_DELAY);
    }, videoDuration);
  }

  function startAutoScroll(minutes) {
    if (!state.isReelsPage) return;
    clearTimers();
    state.durationMinutes = Math.min(180, Math.max(1, Number(minutes) || 10));
    state.remainingSeconds = state.durationMinutes * 60;
    state.running = true;
    state.completed = false;
    updateDock();

    scheduleNextAdvance();
    state.timerId = window.setInterval(() => {
      state.remainingSeconds -= 1;
      if (state.remainingSeconds <= 0) stopAutoScroll(true);
      else updateDock();
    }, 1000);
  }

  function buildDock() {
    if (document.getElementById(ROOT_ID)) return;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("aria-label", "Scroll Reels timer");
    root.innerHTML = `
      <div class="reelflow-dock">
        <div class="reelflow-meta"><span>ready</span><strong>--:--</strong></div>
      </div>`;
    document.documentElement.appendChild(root);
    updateDock();
    updatePageState();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    updatePageState();
    if (message.type === "START") startAutoScroll(message.minutes);
    if (message.type === "STOP") stopAutoScroll(false);
    if (message.type === "NEXT") navigate(1);
    if (message.type === "PREVIOUS") navigate(-1);
    sendResponse(getStatus());
    return true;
  });

  document.addEventListener("ended", (event) => {
    if (state.running && event.target instanceof HTMLVideoElement && isCurrentVideo(event.target) && Date.now() - lastNavigationAt > 1200) {
      navigate(1);
      state.advanceId = window.setTimeout(scheduleNextAdvance, NAVIGATION_SETTLE_DELAY);
    }
  }, true);

  let lastPath = window.location.pathname;
  window.setInterval(() => {
    if (lastPath !== window.location.pathname) {
      lastPath = window.location.pathname;
      updatePageState();
    }
  }, 500);

  buildDock();
})();
