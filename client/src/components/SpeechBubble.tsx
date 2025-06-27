import { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  messages: string[];
  isVisible: boolean;
  className?: string;
}

export function SpeechBubble({ messages, isVisible, className = "" }: SpeechBubbleProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isVisible || messages.length === 0) return;

    const currentMessage = messages[currentMessageIndex];
    
    if (!isDeleting && !isTyping) {
      // Start typing after sprite entrance animation completes
      const startTyping = setTimeout(() => {
        setIsTyping(true);
        setShowCursor(true);
      }, 1800); // Delay to coordinate with sprite slide-bounce-in animation
      return () => clearTimeout(startTyping);
    }

    if (isTyping && !isDeleting) {
      // Typewriter effect - adding characters
      if (displayedText.length < currentMessage.length) {
        const typeTimer = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 60 + Math.random() * 40); // Variable typing speed for realism
        return () => clearTimeout(typeTimer);
      } else {
        // Finished typing current message
        setIsTyping(false);
        
        // Wait before starting to delete (longer pause for reading)
        const deleteDelay = setTimeout(() => {
          setIsDeleting(true);
        }, 2000 + Math.random() * 1000);
        return () => clearTimeout(deleteDelay);
      }
    }

    if (isDeleting) {
      // Deleting effect - removing characters
      if (displayedText.length > 0) {
        const deleteTimer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30 + Math.random() * 20); // Faster deletion
        return () => clearTimeout(deleteTimer);
      } else {
        // Finished deleting, move to next message
        setIsDeleting(false);
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }
    }
  }, [isVisible, messages, currentMessageIndex, displayedText, isTyping, isDeleting]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  if (!isVisible || messages.length === 0) return null;

  return (
    <div style={{ position: 'relative' }} >
      {/* Speech bubble */}
      <div style={{
        position: 'relative',
        backgroundColor: "#111827",
        border: '2px solid #dc2626',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        maxWidth: 'clamp(20rem, 50vw, 28rem)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Bubble content */}
        <div style={{
          color: '#f87171',
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          fontWeight: '600',
          minHeight: '1.5em',
          display: 'flex',
          alignItems: 'center'
        }}>
          {displayedText}
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '1rem',
            backgroundColor: '#f87171',
            marginLeft: '0.25rem',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s ease'
          }} />
        </div>
        
        {/* Speech bubble tail pointing down */}
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #dc2626'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #111827'
          }}></div>
        </div>
      </div>
    </div>
  );
}