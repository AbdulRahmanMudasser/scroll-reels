import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Scroll Reels",
    description: "Automatically advance Instagram Reels for a selected time limit.",
    permissions: ["tabs"],
    host_permissions: ["https://www.instagram.com/*"],
    action: {
      default_title: "Scroll Reels"
    }
  }
});
