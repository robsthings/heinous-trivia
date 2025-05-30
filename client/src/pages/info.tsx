import { Link } from "wouter";

export default function Info() {
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
                  <span>Leaderboards + multiplayer = guests stay longer</span>
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
              <div className="text-4xl font-bold text-gray-300 mb-6">$99<span className="text-lg">/month</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 5 custom questions</li>
                <li>✓ 3 branded ads maximum</li>
                <li>✓ Basic horror themes</li>
                <li>✓ Mobile-responsive design</li>
                <li>✓ Player leaderboards</li>
                <li>✓ Email support</li>
              </ul>
              <p className="text-sm text-gray-400">Perfect for small venues and events</p>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-red-900 to-black border-2 border-red-500 rounded-lg p-8 text-center relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="font-nosifer text-2xl text-red-400 mb-4">PRO</h3>
              <div className="text-4xl font-bold text-white mb-6">$199<span className="text-lg">/month</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 15 custom questions</li>
                <li>✓ 5 branded ads maximum</li>
                <li>✓ Advanced horror themes</li>
                <li>✓ Custom branding & colors</li>
                <li>✓ Real-time multiplayer</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ Priority support</li>
              </ul>
              <p className="text-sm text-gray-400">Ideal for bars, restaurants, and entertainment venues</p>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-purple-900 to-black border-2 border-purple-500 rounded-lg p-8 text-center">
              <h3 className="font-nosifer text-2xl text-purple-400 mb-4">PREMIUM</h3>
              <div className="text-4xl font-bold text-white mb-6">$399<span className="text-lg">/month</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 50 custom questions</li>
                <li>✓ 10 branded ads maximum</li>
                <li>✓ Unlimited horror themes</li>
                <li>✓ Complete white-label solution</li>
                <li>✓ Advanced multiplayer features</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ 24/7 phone support</li>
              </ul>
              <p className="text-sm text-gray-400">Enterprise solution for large venues and franchises</p>
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
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Book Your Free Demo Now
          </a>
          <p className="text-sm text-gray-400 mt-4">
            Let's build your haunted trivia experience — response within 24 hours.
          </p>
          <ul className="text-sm text-gray-400 mt-4 space-y-1 max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span>✔️</span>
              <span>No tech skills needed</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✔️</span>
              <span>Custom preview</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✔️</span>
              <span>Simple Pricing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-nosifer text-xl text-red-500">HEINOUS TRIVIA</h3>
              <p className="text-gray-400 text-sm">Taking Over The World - Once Queue Line at a Time!</p>
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
    </div>
  );
}