import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-creepster text-6xl md:text-8xl text-red-500 mb-4 drop-shadow-lg">
            HEINOUS TRIVIA
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Welcome to Dr. Heinous's Chamber of Knowledge
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose your haunt and test your wits against the most diabolical trivia questions 
            ever assembled. Each location offers unique challenges and terrifying rewards.
          </p>
        </div>

        {/* How to Access */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              How to Enter a Haunt
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                Each haunt provides their own unique access link to their trivia experience.
              </p>
              <p>
                Contact your favorite haunt directly to receive their exclusive game link, 
                or ask them to sign up for Heinous Trivia to create their own horror trivia experience.
              </p>
              <div className="mt-8 p-4 bg-red-900/30 border border-red-600/50 rounded-lg">
                <h3 className="text-xl font-semibold text-red-400 mb-3">
                  🎃 For Haunt Owners
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Ready to create your own horror trivia experience? 
                  Set up custom questions, themes, and leaderboards for your visitors.
                </p>
                <Link href="/admin">
                  <Button className="horror-button px-6 py-3 rounded-lg font-medium text-white">
                    Create Your Haunt 👻
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">Quick Access</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                🔧 Admin Portal
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                📋 Privacy Policy
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                📜 Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer showInstallButton={true} />
    </div>
  );
}