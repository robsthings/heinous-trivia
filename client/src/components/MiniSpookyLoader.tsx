interface MiniSpookyLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function MiniSpookyLoader({ 
  message = "Loading...", 
  size = "md" 
}: MiniSpookyLoaderProps) {
  const sizeStyles = {
    sm: { fontSize: '1.125rem', padding: '1rem' },
    md: { fontSize: '1.25rem', padding: '1.5rem' },
    lg: { fontSize: '1.5rem', padding: '2rem' }
  };

  const iconSizes = {
    sm: '1.5rem',
    md: '1.875rem',
    lg: '2.25rem'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size]
    }}>
      {/* Animated skull */}
      <div style={{
        position: 'relative',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          fontSize: iconSizes[size],
          animation: 'pulse 2s infinite'
        }}>💀</div>
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          fontSize: iconSizes[size],
          animation: 'ping 1s infinite',
          opacity: 0.3
        }}>👻</div>
      </div>
      
      {/* Loading text */}
      <p style={{
        color: '#d1d5db',
        animation: 'pulse 2s infinite',
        fontWeight: '500'
      }}>
        {message}
      </p>
      
      {/* Mini loading dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.25rem',
        marginTop: '0.5rem'
      }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: '#f97316',
              borderRadius: '50%',
              animation: 'bounce 1s infinite',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}