import type { HauntConfig } from "@shared/schema";

interface CustomProgressBarProps {
  progress: number; // 0-100
  hauntConfig: HauntConfig | null | undefined;
  className?: string;
}

export function CustomProgressBar({ progress, hauntConfig, className = "" }: CustomProgressBarProps) {
  // Define progress bar color themes with inline styles for guaranteed rendering
  const getProgressBarColors = (theme: string) => {
    const themes = {
      'crimson': { 
        background: 'linear-gradient(to right, #dc2626, #f87171)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
      },
      'blood': { 
        background: 'linear-gradient(to right, #991b1b, #dc2626)',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)'
      },
      'electric': { 
        background: 'linear-gradient(to right, #3b82f6, #22d3ee)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
      },
      'toxic': { 
        background: 'linear-gradient(to right, #10b981, #84cc16)',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
      },
      'purple': { 
        background: 'linear-gradient(to right, #9333ea, #a855f7)',
        boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
      },
      'orange': { 
        background: 'linear-gradient(to right, #ea580c, #fb923c)',
        boxShadow: '0 0 20px rgba(234, 88, 12, 0.5)'
      },
      'pink': { 
        background: 'linear-gradient(to right, #ec4899, #fb7185)',
        boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
      },
      'gold': { 
        background: 'linear-gradient(to right, #eab308, #f59e0b)',
        boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
      }
    };
    return themes[theme as keyof typeof themes] || themes.crimson;
  };

  // Check if haunt is eligible for custom progress bar (Pro/Premium only)
  const isPremiumTier = hauntConfig?.tier === 'pro' || hauntConfig?.tier === 'premium';
  const hasCustomTheme = isPremiumTier && hauntConfig?.progressBarTheme;



  // Apply custom theme for Pro/Premium haunts with progressBarTheme
  if (hasCustomTheme && hauntConfig.progressBarTheme) {
    const themeData = getProgressBarColors(hauntConfig.progressBarTheme);
    console.log('🎨 Applying custom theme:', hauntConfig.progressBarTheme);
    
    return (
      <div 
        className={`relative w-full h-4 rounded-full overflow-hidden ${className}`}
        style={{
          backgroundColor: '#1f2937',
          border: '2px solid #10b981',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }}
      >
        {/* Custom themed progress bar */}
        <div 
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{ 
            width: `${Math.max(0, Math.min(100, progress))}%`,
            background: themeData.background,
            boxShadow: themeData.boxShadow,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          {/* Glowing overlay effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
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