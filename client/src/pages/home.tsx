import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function Home() {

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #000000 50%, #7f1d1d 100%)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: "clamp(1.5rem, 4vw, 3rem)",
          textAlign: "center"
        }}>
          <h1 style={{
            fontFamily: '"Creepster", cursive',
            fontSize: 'clamp(2.25rem, 8vw, 5rem)',
            color: '#ef4444',
            marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
            lineHeight: '1.1'
          }}>
            HEINOUS TRIVIA
          </h1>
          <p style={{
            fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
            color: '#d1d5db',
            marginBottom: '0.5rem',
            padding: '0 0.5rem'
          }}>
            Welcome to Dr. Heinous's Chamber of Knowledge
          </p>
          <p style={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            color: '#9ca3af',
            maxWidth: '42rem',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            Choose your haunt and test your wits against the most diabolical trivia questions 
            ever assembled. Each location offers unique challenges and terrifying rewards.
          </p>
        </div>

        {/* How to Access */}
        <div style={{
          maxWidth: '42rem',
          margin: '0 auto',
          textAlign: "center"
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: 'clamp(1rem, 4vw, 2rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.875rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: "1.5rem"
            }}>
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