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
  const hasCustomProgressBar = isPremiumTier && hauntConfig?.progressBarUrl;

  if (hasCustomProgressBar) {
    // Custom progress bar with image/animation
    return (
      <div className={`relative w-full h-4 bg-gray-800 rounded-full overflow-hidden ${className}`}>
        {/* Custom progress bar background */}
        <div className="absolute inset-0 bg-gray-800 rounded-full" />
        
        {/* Custom progress fill using the provided image/animation */}
        <div 
          className="h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden"
          style={{ 
            width: `${Math.max(0, Math.min(100, progress))}%`,
            backgroundImage: `url(${hauntConfig.progressBarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better visibility if needed */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        
        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
          {Math.round(progress)}%
        </div>
      </div>
    );
  }

  // Default progress bar for Basic tier or haunts without custom progress bar
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