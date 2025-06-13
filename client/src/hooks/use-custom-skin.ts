import { useEffect } from "react";
import type { HauntConfig } from "@shared/schema";

// CUSTOM SKIN & PROGRESS BAR LOGIC
// Hook to apply custom background skins for Pro/Premium haunts
export function useCustomSkin(hauntConfig: HauntConfig | null | undefined) {
  useEffect(() => {
    if (!hauntConfig) return;

    // Only apply custom skins for Pro and Premium tiers
    const isPremiumTier = hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium';
    
    if (isPremiumTier && hauntConfig.skinUrl) {
      // For SVG backgrounds, fetch and convert to data URL for better compatibility
      if (hauntConfig.skinUrl.endsWith('.svg')) {
        fetch(hauntConfig.skinUrl)
          .then(response => response.text())
          .then(svgContent => {
            const encodedSvg = encodeURIComponent(svgContent);
            const dataUrl = `data:image/svg+xml,${encodedSvg}`;
            
            document.body.style.setProperty('background-image', `url("${dataUrl}")`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center', 'important');
            document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
            
            // Also clear any game container background that might be covering it
            const gameContainer = document.querySelector('.game-container') as HTMLElement;
            if (gameContainer) {
              gameContainer.style.setProperty('background', 'transparent', 'important');
            }
          })
          .catch(() => {
            // Fallback to direct URL if fetch fails
            document.body.style.setProperty('background-image', `url(${hauntConfig.skinUrl})`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center', 'important');
            document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
          });
      } else {
        // For non-SVG images, use direct URL
        document.body.style.setProperty('background-image', `url(${hauntConfig.skinUrl})`, 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-position', 'center', 'important');
        document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
        
        // Also clear any game container background that might be covering it
        const gameContainer = document.querySelector('.game-container') as HTMLElement;
        if (gameContainer) {
          gameContainer.style.setProperty('background', 'transparent', 'important');
        }
      }
    } else {
      // Remove custom skin and use default background
      const gameContainer = document.querySelector('.game-container') as HTMLElement;
      if (gameContainer) {
        gameContainer.style.backgroundImage = '';
        gameContainer.style.backgroundSize = '';
        gameContainer.style.backgroundPosition = '';
        gameContainer.style.backgroundRepeat = '';
        gameContainer.style.backgroundAttachment = '';
      }
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    }
  }, [hauntConfig?.skinUrl, hauntConfig?.tier]);
}