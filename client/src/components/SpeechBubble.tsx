import { useEffect, useState } from 'react';

interface SpeechBubbleProps {
  messages: string[];
  isVisible: boolean;
}

export function SpeechBubble({ messages, isVisible }: SpeechBubbleProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isVisible || messages.length === 0) return;

    const interval = setInterval(() => {
      const message = messages[currentIndex];
      if (charIndex < message.length) {
        setCurrentMessage(message.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else {
        // Message complete, wait then move to next
        setTimeout(() => {
          if (currentIndex < messages.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCharIndex(0);
            setCurrentMessage('');
          }
        }, 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, charIndex, messages, isVisible]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'rgba(139, 0, 0, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '1rem',
      maxWidth: '20rem',
      fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
      fontWeight: 'bold',
      textAlign: 'center',
      border: '2px solid #dc2626',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 50
    }}>
      {currentMessage}
      {showCursor && <span style={{opacity: 0.7}}>|</span>}
      
      {/* Triangle pointer */}
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid #dc2626',
        zIndex: 51
      }} />
    </div>
  );
}