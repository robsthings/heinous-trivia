import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto py-4 border-t border-gray-700 bg-black/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center text-sm text-gray-400">
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
      </div>
    </footer>
  );
}