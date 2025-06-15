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
      // Start typing after a brief pause
      const startTyping = setTimeout(() => {
        setIsTyping(true);
        setShowCursor(true);
      }, 500);
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
    <div className={`relative ${className}`}>
      {/* Speech bubble */}
      <div className="relative bg-gray-900 border-2 border-red-600 rounded-lg px-4 py-3 max-w-xs sm:max-w-sm md:max-w-md shadow-lg">
        {/* Bubble content */}
        <div className="text-red-400 text-sm sm:text-base font-semibold min-h-[1.5em] flex items-center">
          {displayedText}
          <span className={`inline-block w-0.5 h-4 bg-red-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`} />
        </div>
        
        {/* Speech bubble tail pointing down */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-600"></div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}