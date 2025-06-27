import { HauntConfig } from '@/lib/types';

interface CustomProgressBarProps {
  progress: number; // 0-100
  hauntConfig: HauntConfig | null | undefined;
  className?: string;
}

function getProgressBarGradient(hauntConfig: HauntConfig | null | undefined): string {
  if (!hauntConfig?.progressBarTheme) {
    return 'linear-gradient(90deg, #dc2626 0%, #7c2d12 50%, #dc2626 100%)';
  }

  const themes = {
    'crimson-glow': 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
    'blood-red': 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)',
    'electric-blue': 'linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
    'toxic-green': 'linear-gradient(90deg, #166534 0%, #22c55e 50%, #166534 100%)',
    'mystic-purple': 'linear-gradient(90deg, #581c87 0%, #a855f7 50%, #581c87 100%)',
    'inferno-orange': 'linear-gradient(90deg, #c2410c 0%, #f97316 50%, #c2410c 100%)',
    'neon-pink': 'linear-gradient(90deg, #be185d 0%, #ec4899 50%, #be185d 100%)',
    'golden-glow': 'linear-gradient(90deg, #a16207 0%, #eab308 50%, #a16207 100%)'
  };

  return themes[hauntConfig.progressBarTheme as keyof typeof themes] || themes['crimson-glow'];
}

export function CustomProgressBar({ progress, hauntConfig, className = "" }: CustomProgressBarProps) {
  const gradient = getProgressBarGradient(hauntConfig);
  const glowColor = hauntConfig?.progressBarTheme === 'electric-blue' ? '#3b82f6' : 
                   hauntConfig?.progressBarTheme === 'toxic-green' ? '#22c55e' :
                   hauntConfig?.progressBarTheme === 'mystic-purple' ? '#a855f7' :
                   hauntConfig?.progressBarTheme === 'inferno-orange' ? '#f97316' :
                   hauntConfig?.progressBarTheme === 'neon-pink' ? '#ec4899' :
                   hauntConfig?.progressBarTheme === 'golden-glow' ? '#eab308' :
                   '#dc2626';

  return (
    <div style={{
      width: '100%',
      height: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative'
    }}>
      <div
        style={{
          height: '100%',
          background: gradient,
          width: `${Math.max(0, Math.min(100, progress))}%`,
          transition: 'width 0.3s ease',
          borderRadius: '0.5rem',
          boxShadow: `0 0 10px ${glowColor}40`,
          animation: 'pulse 2s infinite'
        }}
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 10px ${glowColor}40; }
          50% { box-shadow: 0 0 20px ${glowColor}80; }
        }
      `}</style>
    </div>
  );
}