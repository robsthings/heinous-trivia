import type { HauntConfig } from "@shared/schema";

export function generateManifest(hauntConfig?: HauntConfig | null, hauntId?: string) {
  const primaryColor = hauntConfig?.theme?.primaryColor || "#8B0000";
  const backgroundColor = "#0A0A0A";
  const hauntName = hauntConfig?.name || "Heinous Trivia";
  
  // Create haunt-specific start URL that goes through launcher
  const startUrl = hauntId ? `/launcher/${hauntId}` : "/launcher.html";
  
  return {
    name: hauntName,
    short_name: hauntConfig?.name || "Heinous",
    description: hauntConfig?.description || "Horror-themed trivia game hosted by the villainous Dr. Heinous",
    theme_color: primaryColor,
    background_color: backgroundColor,
    display: "standalone",
    scope: "/",
    start_url: startUrl,
    orientation: "portrait-primary",
    categories: ["games", "entertainment", "trivia"],
    icons: [
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    screenshots: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow"
      }
    ]
  };
}

export function updateMetaThemeColor(color: string) {
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', color);
  }
}