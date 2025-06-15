import { Link } from "wouter";
import { PWAInstallButton } from "./PWAInstallButton";
import { useState, useEffect } from "react";

interface FooterProps {
  showInstallButton?: boolean;
}

export function Footer({ showInstallButton = false }: FooterProps) {
  // DeSpookify Mode state management with localStorage persistence
  const [isDeSpookified, setIsDeSpookified] = useState(false);

  // Load DeSpookify preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('heinous-despookify-mode');
    if (saved === 'true') {
      setIsDeSpookified(true);
      document.documentElement.classList.add('despookify-mode');
    }
  }, []);

  // Toggle DeSpookify Mode and update localStorage + document class
  const toggleDeSpookify = () => {
    const newValue = !isDeSpookified;
    setIsDeSpookified(newValue);
    localStorage.setItem('heinous-despookify-mode', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('despookify-mode');
    } else {
      document.documentElement.classList.remove('despookify-mode');
    }
  };

  return (
    <footer className="mt-auto py-4 border-t border-gray-700 bg-black/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center text-sm text-gray-400 space-y-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div>
              <Link href="/privacy" className="hover:text-red-400 transition-colors">
                Privacy Policy
              </Link>
              {" | "}
              <Link href="/terms" className="hover:text-red-400 transition-colors">
                Terms of Use
              </Link>
            </div>
            
            {/* DeSpookify Mode Toggle */}
            <div className="flex items-center">
              <button
                onClick={toggleDeSpookify}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-orange-400 transition-colors"
                title={`${isDeSpookified ? 'Enable' : 'Disable'} spooky fonts for question text`}
              >
                🕸️ DeSpookify Mode: {isDeSpookified ? 'ON' : 'OFF'}
              </button>
            </div>

            {showInstallButton && (
              <div className="flex items-center">
                <PWAInstallButton />
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            © 2025 Heinous Trivia. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}