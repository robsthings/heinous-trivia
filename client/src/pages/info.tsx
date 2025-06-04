import { Link } from "wouter";
import { useEffect } from "react";

// Facebook SDK type declarations
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function Info() {
  // Load Facebook SDK and initialize Messenger Chat Widget
  useEffect(() => {
    const loadFacebookSDK = () => {
      // Only exclude localhost and dev environments
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('127.0.0.1') ||
                           window.location.hostname.includes('replit.dev');
      
      if (isDevelopment) {
        console.log('Facebook Messenger Chat Widget disabled in development');
        return;
      }
      
      console.log('Loading Facebook Messenger Chat Widget for production domain:', window.location.hostname);

      if (window.FB) {
        return;
      }

      window.fbAsyncInit = function() {
        try {
          window.FB.init({
            xfbml: true,
            version: 'v19.0'
          });
          console.log('Facebook SDK initialized successfully');
          
          // Parse the chat widget after SDK is ready
          setTimeout(() => {
            if (window.FB && window.FB.XFBML) {
              window.FB.XFBML.parse();
              console.log('Facebook chat widget parsed');
            }
          }, 1000);
        } catch (error) {
          console.error('Facebook SDK initialization failed:', error);
        }
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
        js.onload = () => {
          console.log('Facebook SDK script loaded successfully');
        };
        js.onerror = (error) => {
          console.error('Failed to load Facebook SDK script:', error);
        };
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">
            <h1 className="font-nosifer text-4xl sm:text-6xl lg:text-7xl text-red-500 mb-6 animate-pulse">
              HEINOUS TRIVIA
            </h1>
            <h2 className="text-xl sm:text-2xl text-gray-300 mb-2 max-w-3xl mx-auto leading-relaxed">
              Turn Your Haunted Attraction Into a Game Guests Won't Forget
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              A fully branded, scream-worthy trivia experience — built for lines, lobbies, and loyalty.
            </p>
            <img 
              src="/image (25).png" 
              alt="Heinous Trivia Horror Experience"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border-2 border-red-600"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-nosifer text-3xl sm:text-4xl text-orange-500 text-center mb-12">
            Unleash Terror Through Trivia
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Your Guests */}
            <div className="bg-black/60 border border-red-600 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">👻 For Your Guests</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span>🎮</span>
                  <span>Mobile gameplay on any device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🧠</span>
                  <span>Custom trivia that fits your brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🏆</span>
                  <span>Leaderboards + multiplayer = guests stay engaged</span>
                </li>
              </ul>
            </div>

            {/* For You */}
            <div className="bg-black/60 border border-red-600 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">🧙‍♂️ For You</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span>Live analytics on player activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎨</span>
                  <span>Complete theme control (logos, colors, ads)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⚙️</span>
                  <span>Easy setup – no devs, no hassle</span>
                </li>
              </ul>
            </div>

            {/* Add-On Revenue */}
            <div className="bg-black/60 border border-red-600 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">🧳 Add-On Revenue</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span>In-game ad slots (for your merch or sponsors)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔁</span>
                  <span>Return play incentives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎟️</span>
                  <span>Event-based upgrades (holiday themes, seasonal packs)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-nosifer text-3xl sm:text-4xl text-orange-500 text-center mb-12">
            Choose Your Level of Terror
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Tier */}
            <div className="bg-gradient-to-b from-gray-800 to-black border-2 border-gray-600 rounded-lg p-8 text-center">
              <h3 className="font-nosifer text-2xl text-white mb-4">BASIC</h3>
              <div className="text-4xl font-bold text-gray-300 mb-6">$99<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 5 custom questions</li>
                <li>✓ 3 branded ads maximum</li>
                <li>✓ Basic question packs</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ Mobile-responsive design</li>
                <li>✓ Player leaderboards</li>
                <li>✓ Email support</li>
              </ul>

            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-red-900 to-black border-2 border-red-500 rounded-lg p-8 text-center relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="font-nosifer text-2xl text-red-400 mb-4">PRO</h3>
              <div className="text-4xl font-bold text-white mb-6">$199<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 15 custom questions</li>
                <li>✓ 5 branded ads maximum</li>
                <li>✓ Advanced question packs</li>
                <li>✓ Custom branding & colors</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ Group Party Mode</li>
                <li>✓ Real-time multiplayer</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ Priority support</li>
              </ul>

            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-purple-900 to-black border-2 border-purple-500 rounded-lg p-8 text-center">
              <h3 className="font-nosifer text-2xl text-purple-400 mb-4">PREMIUM</h3>
              <div className="text-4xl font-bold text-white mb-6">$399<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 50 custom questions</li>
                <li>✓ 10 branded ads maximum</li>
                <li>✓ Elite question packs</li>
                <li>✓ Custom branding & colors</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ Group Party Mode</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ One additional Basic game</li>
                <li>✓ Near white-label experience</li>
                <li>✓ Priority support</li>
              </ul>

            </div>
          </div>
          
          {/* Introductory Pricing Sticker */}
          <div className="flex justify-center mt-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg transform -rotate-6 shadow-lg">
              <span className="font-bold text-sm">🎃 Introductory Pricing!</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-900 via-black to-red-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-nosifer text-3xl sm:text-4xl text-white mb-6">
            Ready to Terrify Your Audience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the ranks of entertainment venues that have transformed their customer experience with Heinous Trivia
          </p>
          <a
            href="mailto:ResirWrecked@yahoo.com?subject=Heinous Trivia Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Book Your Free Demo Now
          </a>
          <p className="text-sm text-gray-400 mt-4">
            Let's build your haunted trivia experience — response within 24 hours.
          </p>
          <ul className="text-sm text-gray-400 mt-4 space-y-1 max-w-xs mx-auto text-center">
            <li className="flex items-center justify-center gap-2">
              <span>✔️</span>
              <span>No tech skills needed</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <span>✔️</span>
              <span>Custom preview</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <span>✔️</span>
              <span>Simple Pricing</span>
            </li>
          </ul>

          {/* Security & Standards Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-600 rounded-lg px-3 py-2">
              <span className="text-green-400">🔒</span>
              <span className="text-xs text-green-300 font-medium">HTTPS Encrypted</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-600 rounded-lg px-3 py-2">
              <span className="text-blue-400">🛡️</span>
              <span className="text-xs text-blue-300 font-medium">Firebase Secured</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-900/30 border border-purple-600 rounded-lg px-3 py-2">
              <span className="text-purple-400">📱</span>
              <span className="text-xs text-purple-300 font-medium">PWA Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-900/30 border border-orange-600 rounded-lg px-3 py-2">
              <span className="text-orange-400">⚡</span>
              <span className="text-xs text-orange-300 font-medium">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-nosifer text-xl text-red-500">HEINOUS TRIVIA</h3>
              <p className="text-gray-400 text-sm">Taking Over The World - One Queue Line at a Time!</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a 
                href="mailto:ResirWrecked@yahoo.com" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Heinous Trivia. All rights reserved. Prepare to be terrified.
            </p>
          </div>
        </div>
      </footer>

      {/* Facebook Messenger Chat Widget */}
      <div 
        className="fb-customerchat"
        data-attribution="biz_inbox"
        data-page-id="181728020123621"
        data-theme-color="#8B0000"
        data-logged-in-greeting="Hi! How can we help you with Heinous Trivia?"
        data-logged-out-greeting="Hi! How can we help you with Heinous Trivia?"
      ></div>
      
      {/* Fallback contact button if Facebook widget doesn't load */}
      <div id="fb-messenger-fallback" style={{ display: 'none' }}>
        <a 
          href="https://m.me/181728020123621" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-colors"
          title="Chat with us on Messenger"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.6,21.27 9.6,21C9.6,20.77 9.59,20.14 9.58,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.58,7.17C10.39,6.95 11.2,6.84 12,6.84C12.8,6.84 13.61,6.95 14.42,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.49,20.68 14.49,21C14.49,21.27 14.74,21.59 15.25,21.5C19.23,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}