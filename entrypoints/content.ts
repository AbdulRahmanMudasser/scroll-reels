import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { browser } from "wxt/browser";
import { isScrollMessage, type ScrollMessage } from "../utils/messages";
import { createScrollSession } from "../utils/scroll-session";
import "../assets/styles/content.css";

const AUTO_SCROLL_FALLBACK_MS = 9000;
const NAVIGATION_SETTLE_DELAY_MS = 800;

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["https://www.instagram.com/*"],
  runAt: "document_idle",
  async main(ctx) {
    const session = createScrollSession();
    const timers = {
      advanceId: null as number | null,
      countdownId: null as number | null
    };
    let dock: HTMLButtonElement | null = null;
    let lastNavigationAt = 0;

    const isReelsPage = () => /^\/reels?(?:\/|$)/.test(window.location.pathname);

    const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(Math.max(0, totalSeconds) / 60).toString().padStart(2, "0");
      const seconds = Math.max(0, totalSeconds) % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const getStatus = () => session.getStatus(isReelsPage());

    const updateDock = () => {
      const status = getStatus();
      if (!dock) return;
      const label = dock.querySelector("span");
      const value = dock.querySelector("strong");
      if (!label || !value) return;

      dock.classList.toggle("completed", status.completed && !status.running);
      dock.hidden = !status.isReelsPage;
      label.textContent = status.running ? "running" : status.completed ? "done" : "ready";
      value.textContent = status.running ? formatTime(status.remainingSeconds) : status.completed ? "Finished" : "--:--";
    };

    const clearTimers = () => {
      if (timers.advanceId !== null) window.clearTimeout(timers.advanceId);
      if (timers.countdownId !== null) window.clearInterval(timers.countdownId);
      timers.advanceId = null;
      timers.countdownId = null;
    };

    const stopAutoScroll = (completed = false) => {
      clearTimers();
      session.stop(completed);
      updateDock();
    };

    const getControlLabel = (control: Element) => [
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      control.textContent
    ].filter(Boolean).join(" ").toLowerCase();

    const navigateToNextReel = () => {
      if (!isReelsPage()) return;
      lastNavigationAt = Date.now();
      const nextControl = [...document.querySelectorAll<HTMLElement>('button, [role="button"]')]
        .find((control) => getControlLabel(control).includes("next reel"));

      if (nextControl) {
        nextControl.click();
        return;
      }

      const wheelTarget = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) ?? document.body;
      wheelTarget.dispatchEvent(new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        deltaY: Math.max(500, window.innerHeight * 0.9)
      }));
      window.scrollBy({ behavior: "smooth", top: window.innerHeight * 0.92 });
    };

    const isCurrentVideo = (video: HTMLVideoElement) => {
      const rect = video.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      return rect.left <= centerX && rect.right >= centerX && rect.top <= centerY && rect.bottom >= centerY;
    };

    const getCurrentVideo = () => [...document.querySelectorAll("video")].find(isCurrentVideo) ?? null;

    const advanceToNextReel = () => {
      if (timers.advanceId !== null) window.clearTimeout(timers.advanceId);
      timers.advanceId = null;
      if (!getStatus().running || session.syncRemainingTime() <= 0) {
        if (getStatus().running) stopAutoScroll(true);
        return;
      }

      navigateToNextReel();
      timers.advanceId = ctx.setTimeout(scheduleNextAdvance, NAVIGATION_SETTLE_DELAY_MS);
    };

    const scheduleNextAdvance = () => {
      if (timers.advanceId !== null) window.clearTimeout(timers.advanceId);
      timers.advanceId = null;
      if (!getStatus().running) return;

      const video = getCurrentVideo();
      if (!video) {
        timers.advanceId = ctx.setTimeout(advanceToNextReel, AUTO_SCROLL_FALLBACK_MS);
        return;
      }

      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        timers.advanceId = ctx.setTimeout(scheduleNextAdvance, 1000);
        return;
      }

      const playbackRemainingMs = Math.max(1000, (video.duration - video.currentTime) * 1000 + 1000);
      timers.advanceId = ctx.setTimeout(() => {
        const activeVideo = getCurrentVideo();
        if (getStatus().running && activeVideo === video && (video.ended || video.currentTime >= video.duration - 0.25)) {
          advanceToNextReel();
          return;
        }
        scheduleNextAdvance();
      }, playbackRemainingMs);
    };

    const startAutoScroll = (minutes: number) => {
      if (!isReelsPage()) return;
      clearTimers();
      session.start(minutes);
      updateDock();
      scheduleNextAdvance();
      timers.countdownId = ctx.setInterval(() => {
        if (session.syncRemainingTime() <= 0) stopAutoScroll(true);
        else updateDock();
      }, 1000);
    };

    const ui = await createShadowRootUi(ctx, {
      anchor: "body",
      isolateEvents: true,
      name: "scroll-reels-timer",
      onMount(container) {
        dock = document.createElement("button");
        dock.type = "button";
        dock.className = "scroll-reels-meta";
        dock.setAttribute("aria-label", "Open Scroll Reels controls");
        dock.title = "Open Scroll Reels controls";
        dock.innerHTML = "<span>ready</span><strong>--:--</strong>";
        dock.addEventListener("click", () => {
          browser.runtime.sendMessage({ type: "OPEN_POPUP" } satisfies ScrollMessage).catch(() => undefined);
        });
        container.append(dock);
        updateDock();
        return dock;
      },
      position: "inline"
    });
    ui.mount();

    browser.runtime.onMessage.addListener((message: unknown) => {
      if (!isScrollMessage(message)) return undefined;
      if (message.type === "START") startAutoScroll(message.minutes);
      if (message.type === "STOP") stopAutoScroll();
      updateDock();
      return Promise.resolve(getStatus());
    });

    document.addEventListener("ended", (event) => {
      if (getStatus().running && event.target instanceof HTMLVideoElement && isCurrentVideo(event.target) && Date.now() - lastNavigationAt > 1200) {
        advanceToNextReel();
      }
    }, { capture: true, signal: ctx.signal });

    let lastPath = window.location.pathname;
    ctx.setInterval(() => {
      if (lastPath !== window.location.pathname) {
        lastPath = window.location.pathname;
        updateDock();
      }
    }, 500);
  }
});
