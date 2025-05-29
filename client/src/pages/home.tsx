import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="font-creepster text-4xl sm:text-6xl md:text-8xl text-red-500 mb-2 sm:mb-4 drop-shadow-lg leading-tight">
            HEINOUS TRIVIA
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-2 px-2">
            Welcome to Dr. Heinous's Chamber of Knowledge
          </p>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-4">
            Choose your haunt and test your wits against the most diabolical trivia questions 
            ever assembled. Each location offers unique challenges and terrifying rewards.
          </p>
        </div>

        {/* How to Access */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
              How to Enter a Haunt
            </h2>
            <div className="space-y-3 sm:space-y-4 text-gray-300">
              <p className="text-base sm:text-lg">
                Each haunt provides their own unique access link to their trivia experience.
              </p>
              <p className="text-sm sm:text-base">
                Contact your favorite haunt directly to receive their exclusive game link, 
                or ask them to sign up for Heinous Trivia to create their own horror trivia experience.
              </p>
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-red-900/30 border border-red-600/50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-2 sm:mb-3">
                  For Haunt Owners
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  Want to create your own horror trivia experience? 
                  Contact us directly to set up custom questions, themes, and leaderboards for your visitors.
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>

      <Footer showInstallButton={true} />
    </div>
  );
}