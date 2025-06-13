import type { HauntConfig } from "@shared/schema";

// CUSTOM SKIN & PROGRESS BAR LOGIC
interface CustomProgressBarProps {
  progress: number; // 0-100
  hauntConfig: HauntConfig | null | undefined;
  className?: string;
}

export function CustomProgressBar({ progress, hauntConfig, className = "" }: CustomProgressBarProps) {
  // Check if haunt is eligible for custom progress bar (Pro/Premium only)
  const isPremiumTier = hauntConfig?.tier === 'pro' || hauntConfig?.tier === 'premium';
  const hasCustomTheme = isPremiumTier && hauntConfig?.progressBarTheme;

  // Debug logging to see what's being received
  if (hauntConfig) {
    console.log('CustomProgressBar debug:', {
      hauntId: hauntConfig.id,
      tier: hauntConfig.tier,
      progressBarTheme: hauntConfig.progressBarTheme,
      isPremiumTier,
      hasCustomTheme
    });
  }
  




  // Define progress bar color themes
  const getProgressBarColors = (theme: string) => {
    const themes = {
      'crimson': { colors: 'from-red-600 to-red-400', shadow: 'shadow-red-500/50' },
      'blood': { colors: 'from-red-800 to-red-600', shadow: 'shadow-red-600/50' },
      'electric': { colors: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/50' },
      'toxic': { colors: 'from-green-500 to-lime-400', shadow: 'shadow-green-500/50' },
      'purple': { colors: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/50' },
      'orange': { colors: 'from-orange-600 to-orange-400', shadow: 'shadow-orange-500/50' },
      'pink': { colors: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/50' },
      'gold': { colors: 'from-yellow-500 to-amber-400', shadow: 'shadow-yellow-500/50' }
    };
    return themes[theme as keyof typeof themes] || themes.crimson;
  };

  // Apply custom theme for Pro/Premium haunts with progressBarTheme
  if (hasCustomTheme && hauntConfig.progressBarTheme) {
    const themeColors = getProgressBarColors(hauntConfig.progressBarTheme);
    
    return (
      <div className={`relative w-full h-4 bg-gray-800 rounded-full overflow-hidden ${className}`}>
        {/* Custom themed progress bar */}
        <div 
          className={`h-full bg-gradient-to-r ${themeColors.colors} transition-all duration-300 ease-out rounded-full ${themeColors.shadow} shadow-lg animate-pulse`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        >
          {/* Glowing overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        
        {/* Progress text overlay with enhanced readability */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
          {Math.round(progress)}%
        </div>
      </div>
    );
  }

  // Default progress bar for Basic tier or haunts without custom theme
  return (
    <div className={`relative w-full h-4 bg-gray-800 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300 ease-out rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
        {Math.round(progress)}%
      </div>
    </div>
  );
}