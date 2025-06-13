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
      console.log('Applying custom skin:', hauntConfig.skinUrl);
      // Apply custom background skin to main game container
      const gameContainer = document.querySelector('.game-container') as HTMLElement;
      if (gameContainer) {
        console.log('Found game container, applying styles');
        gameContainer.style.setProperty('background-image', `url(${hauntConfig.skinUrl})`, 'important');
        gameContainer.style.setProperty('background-size', 'cover', 'important');
        gameContainer.style.setProperty('background-position', 'center', 'important');
        gameContainer.style.setProperty('background-repeat', 'no-repeat', 'important');
        gameContainer.style.setProperty('background-attachment', 'fixed', 'important');
        console.log('Applied styles:', gameContainer.style.backgroundImage);
      } else {
        console.log('Game container not found, applying to body');
        // Fallback to body if container not found
        document.body.style.setProperty('background-image', `url(${hauntConfig.skinUrl})`, 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-position', 'center', 'important');
        document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
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