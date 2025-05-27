import { Link } from "wouter";
import { PWAInstallButton } from "./PWAInstallButton";

interface FooterProps {
  showInstallButton?: boolean;
}

export function Footer({ showInstallButton = false }: FooterProps) {
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
              {" | "}
              <Link href="/upload-guidelines" className="hover:text-red-400 transition-colors">
                Upload Guidelines
              </Link>
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