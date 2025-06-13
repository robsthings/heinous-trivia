import { useEffect } from "react";
import type { HauntConfig } from "@shared/schema";

// CUSTOM SKIN & PROGRESS BAR LOGIC
// Hook to apply custom background skins for Pro/Premium haunts
export function useCustomSkin(hauntConfig: HauntConfig | null | undefined) {
  useEffect(() => {
    console.log('useCustomSkin effect running with:', { 
      tier: hauntConfig?.tier, 
      skinUrl: hauntConfig?.skinUrl,
      hasConfig: !!hauntConfig 
    });
    
    if (!hauntConfig) return;

    // Only apply custom skins for Pro and Premium tiers
    const isPremiumTier = hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium';
    
    if (isPremiumTier && hauntConfig.skinUrl) {
      console.log('Applying custom skin:', hauntConfig.skinUrl);
      // Apply custom background skin to main game container
      const gameContainer = document.querySelector('.game-container') as HTMLElement;
      if (gameContainer) {
        console.log('Applying to game container');
        gameContainer.style.backgroundImage = `url(${hauntConfig.skinUrl})`;
        gameContainer.style.backgroundSize = 'cover';
        gameContainer.style.backgroundPosition = 'center';
        gameContainer.style.backgroundRepeat = 'no-repeat';
        gameContainer.style.backgroundAttachment = 'fixed';
      } else {
        console.log('Game container not found, applying to body');
        // Fallback to body if container not found
        document.body.style.backgroundImage = `url(${hauntConfig.skinUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
      }
    } else {
      console.log('Not applying skin - premium tier:', isPremiumTier, 'has skinUrl:', !!hauntConfig.skinUrl);
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