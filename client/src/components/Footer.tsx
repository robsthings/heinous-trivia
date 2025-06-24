import { PWAInstallButton } from "./PWAInstallButton";
import { useState, useEffect } from "react";

interface FooterProps {
  showInstallButton?: boolean;
}

export function Footer({ showInstallButton = false }: FooterProps) {
  const [isDeSpookified, setIsDeSpookified] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('heinous-despookify-mode');
    if (saved === 'true') {
      setIsDeSpookified(true);
      document.documentElement.classList.add('despookify-mode');
    }
  }, []);

  const toggleDeSpookify = () => {
    const newValue = !isDeSpookified;
    setIsDeSpookified(newValue);
    localStorage.setItem('heinous-despookify-mode', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('despookify-mode');
    } else {
      document.documentElement.classList.remove('despookify-mode');
    }

    // Dispatch custom event to notify other components
    document.dispatchEvent(new CustomEvent('despookify-toggle'));
  };

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#111827',
      borderTop: '1px solid #374151',
      padding: '12px 16px',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '768px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {showInstallButton && <PWAInstallButton />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>DeSpookify Mode:</span>
            <button
              onClick={toggleDeSpookify}
              style={{
                background: isDeSpookified ? '#16a34a' : '#374151',
                border: '1px solid',
                borderColor: isDeSpookified ? '#22c55e' : '#4b5563',
                borderRadius: '12px',
                width: '44px',
                height: '24px',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: '#ffffff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                position: 'absolute',
                top: '2px',
                left: isDeSpookified ? '22px' : '2px',
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }} />
            </button>
            <span style={{ color: isDeSpookified ? '#22c55e' : '#9ca3af', fontSize: '12px', fontWeight: '500' }}>
              {isDeSpookified ? 'ON' : 'OFF'}
            </span>
          </div>
          <a 
            href="https://heinoustrivia.com/privacy" 
            style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
          >
            Privacy Policy
          </a>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>|</span>
          <a 
            href="https://heinoustrivia.com/terms" 
            style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
          >
            Terms of Use
          </a>
        </div>
        <div style={{ color: '#6b7280', fontSize: '12px' }}>
          © 2025 Heinous Trivia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}