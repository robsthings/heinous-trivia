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
  console.log('=== CustomProgressBar DEBUG ===');
  console.log('hasConfig:', !!hauntConfig);
  console.log('hauntId:', hauntConfig?.id);
  console.log('tier:', hauntConfig?.tier);
  console.log('progressBarTheme:', hauntConfig?.progressBarTheme);
  console.log('isPremiumTier:', isPremiumTier);
  console.log('hasCustomTheme:', hasCustomTheme);
  console.log('progress:', progress);
  console.log('================================');
  
  // Force toxic theme rendering for testing
  if (hauntConfig?.progressBarTheme === 'toxic' && isPremiumTier) {
    console.log('🟢 TOXIC GREEN progress bar should render!');
    const themeColors = getProgressBarColors('toxic');
    console.log('🎨 Theme colors:', themeColors);
  }
  




  // Define progress bar color themes with hard-coded CSS classes for reliability
  const getProgressBarColors = (theme: string) => {
    const themes = {
      'crimson': { 
        className: 'h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out rounded-full shadow-red-500/50 shadow-lg animate-pulse' 
      },
      'blood': { 
        className: 'h-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-300 ease-out rounded-full shadow-red-600/50 shadow-lg animate-pulse' 
      },
      'electric': { 
        className: 'h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out rounded-full shadow-blue-500/50 shadow-lg animate-pulse' 
      },
      'toxic': { 
        className: 'h-full bg-gradient-to-r from-green-500 to-lime-400 transition-all duration-300 ease-out rounded-full shadow-green-500/50 shadow-lg animate-pulse' 
      },
      'purple': { 
        className: 'h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300 ease-out rounded-full shadow-purple-500/50 shadow-lg animate-pulse' 
      },
      'orange': { 
        className: 'h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-300 ease-out rounded-full shadow-orange-500/50 shadow-lg animate-pulse' 
      },
      'pink': { 
        className: 'h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300 ease-out rounded-full shadow-pink-500/50 shadow-lg animate-pulse' 
      },
      'gold': { 
        className: 'h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-300 ease-out rounded-full shadow-yellow-500/50 shadow-lg animate-pulse' 
      }
    };
    return themes[theme as keyof typeof themes] || themes.crimson;
  };

  // Apply custom theme for Pro/Premium haunts with progressBarTheme
  if (hasCustomTheme && hauntConfig.progressBarTheme) {
    const themeData = getProgressBarColors(hauntConfig.progressBarTheme);
    console.log('🎨 Applying theme:', hauntConfig.progressBarTheme, themeData);
    
    return (
      <div className={`relative w-full h-4 bg-gray-800 rounded-full overflow-hidden ${className}`}>
        {/* Custom themed progress bar */}
        <div 
          className={themeData.className}
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