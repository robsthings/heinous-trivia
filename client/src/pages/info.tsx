import { Link } from "wouter";
import { useEffect } from "react";

// Tawk.to type declarations
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

export default function Info() {
  // Load Tawk.to chat widget
  useEffect(() => {
    const loadTawkTo = () => {
      // Only exclude localhost in development
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('127.0.0.1');
      
      if (isDevelopment) {
        console.log('Tawk.to chat widget disabled in development');
        return;
      }
      
      console.log('Loading Tawk.to chat widget for domain:', window.location.hostname);

      // Initialize Tawk.to
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      
      (function() {
        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/6841ac9da46165190e586891/1it08ki7i';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode?.insertBefore(s1, s0);
        
        s1.onload = () => {
          console.log('Tawk.to chat widget loaded successfully');
        };
        s1.onerror = () => {
          console.error('Failed to load Tawk.to chat widget');
        };
      })();
    };

    loadTawkTo();
  }, []);
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Close Button */}
      <button
        onClick={() => window.close()}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          width: '2.5rem',
          height: '2.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #dc2626',
          borderRadius: '50%',
          color: '#dc2626',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          e.currentTarget.style.color = '#dc2626';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Close window"
      >
        ×
      </button>
      
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, #000000 50%, rgba(88, 28, 135, 0.2) 100%)'
        }}></div>
        <div style={{
          position: 'relative',
          maxWidth: '72rem',
          margin: '0 auto',
          padding: 'clamp(3rem, 8vw, 5rem) 1rem'
        }}>
          <div style={{textAlign: "center"}}>
            <h1 style={{
              fontFamily: '"Nosifer", cursive',
              fontSize: 'clamp(2.25rem, 8vw, 4.5rem)',
              color: '#ef4444',
              animation: 'pulse 2s infinite',
              marginBottom: "1.5rem"
            }}>
              HEINOUS TRIVIA
            </h1>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              color: '#d1d5db',
              marginBottom: '0.5rem',
              maxWidth: '48rem',
              margin: '0 auto 0.5rem auto',
              lineHeight: '1.6'
            }}>
              Turn Your Haunted Attraction Into a Game Guests Won't Forget
            </h2>
            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
              color: '#9ca3af',
              marginBottom: '2rem',
              maxWidth: '48rem',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              A fully branded, scream-worthy trivia experience — built for lines, lobbies, and loyalty.
            </p>
            <img 
              src="/image (25).png" 
              alt="Heinous Trivia Horror Experience"
              style={{
                width: '100%',
                maxWidth: '42rem',
                margin: '0 auto',
                borderRadius: '0.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '2px solid #dc2626'
              }}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        padding: '4rem 0'
      }}>
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <h2 style={{
            fontFamily: '"Nosifer", cursive',
            fontSize: 'clamp(1.875rem, 6vw, 2.25rem)',
            color: '#f97316',
            marginBottom: '3rem',
            textAlign: "center"
          }}>
            Unleash Terror Through Trivia
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* For Your Guests */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#f87171',
                marginBottom: '1rem'
              }}>👻 For Your Guests</h3>
              <ul style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: '#d1d5db'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🎮</span>
                  <span>Mobile gameplay on any device</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🧠</span>
                  <span>Custom trivia that fits your brand</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🏆</span>
                  <span>Leaderboards + multiplayer = guests stay engaged</span>
                </li>
              </ul>
            </div>

            {/* For You */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#f87171',
                marginBottom: '1rem'
              }}>🧙‍♂️ For You</h3>
              <ul style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: '#d1d5db'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>📈</span>
                  <span>Live analytics on player activity</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🎨</span>
                  <span>Complete theme control (logos, colors, ads)</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>⚙️</span>
                  <span>Easy setup – no devs, no hassle</span>
                </li>
              </ul>
            </div>

            {/* Add-On Revenue */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#f87171',
                marginBottom: '1rem'
              }}>🧳 Add-On Revenue</h3>
              <ul style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: '#d1d5db'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>💰</span>
                  <span>In-game ad slots (for your merch or sponsors)</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🔁</span>
                  <span>Return play incentives</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span>🎟️</span>
                  <span>Event-based upgrades (holiday themes, seasonal packs)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div style={{
        padding: '4rem 0'
      }}>
        <div style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <h2 style={{
            fontFamily: '"Nosifer", cursive',
            fontSize: 'clamp(1.875rem, 6vw, 2.25rem)',
            color: '#f97316',
            marginBottom: '3rem',
            textAlign: "center"
          }}>
            Choose Your Level of Terror
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Basic Tier */}
            <div style={{
              background: 'linear-gradient(to bottom, #374151 0%, #000000 100%)',
              border: '2px solid #4b5563',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: "center"
            }}>
              <h3 className="font-nosifer text-2xl text-white mb-4">BASIC</h3>
              <div className="text-4xl font-bold text-gray-300 " style={{marginBottom: "1.5rem"}}>$99<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 5 custom questions</li>
                <li>✓ 3 branded ads maximum</li>
                <li>✓ Basic question packs</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ 3 Random Sidequests</li>
                <li>✓ Mobile-responsive design</li>
                <li>✓ Player leaderboards</li>
                <li>✓ Email support</li>
              </ul>

            </div>

            {/* Pro Tier - Updated to remove group mode */}
            <div style={{
              background: 'linear-gradient(to bottom, #7f1d1d 0%, #000000 100%)',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '2rem',
              position: 'relative',
              transform: 'scale(1.05)',
              textAlign: "center"
            }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="font-nosifer text-2xl text-red-400 mb-4">PRO</h3>
              <div className="text-4xl font-bold text-white " style={{marginBottom: "1.5rem"}}>$199<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 15 custom questions</li>
                <li>✓ 5 branded ads maximum</li>
                <li>✓ Advanced question packs</li>
                <li>✓ Custom branding & colors</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ 5 Random Sidequests</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ Priority support</li>
              </ul>

            </div>

            {/* Premium Tier */}
            <div style={{
              background: 'linear-gradient(to bottom, #581c87 0%, #000000 100%)',
              border: '2px solid #a855f7',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: "center"
            }}>
              <h3 className="font-nosifer text-2xl text-purple-400 mb-4">PREMIUM</h3>
              <div className="text-4xl font-bold text-white " style={{marginBottom: "1.5rem"}}>$399<span className="text-lg">/season</span></div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✓ Up to 50 custom questions</li>
                <li>✓ 10 branded ads maximum</li>
                <li>✓ Elite question packs</li>
                <li>✓ Custom branding & colors</li>
                <li>✓ Individual Player Mode</li>
                <li>✓ 10 Random Sidequests</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ One additional Basic game</li>
                <li>✓ Near white-label experience</li>
                <li>✓ Priority support</li>
              </ul>

            </div>
          </div>
          
          {/* Introductory Pricing Sticker */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #eab308 0%, #f97316 100%)',
              color: '#000000',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transform: 'rotate(-6deg)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>🎃 Introductory Pricing!</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(to right, #7f1d1d 0%, #000000 50%, #7f1d1d 100%)',
        padding: '4rem 0'
      }}>
        <div style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: "center"
        }}>
          <h2 style={{
            fontFamily: '"Nosifer", cursive',
            fontSize: 'clamp(1.875rem, 6vw, 2.25rem)',
            color: '#ffffff',
            marginBottom: "1.5rem"
          }}>
            Ready to Terrify Your Audience?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#d1d5db',
            marginBottom: '2rem',
            maxWidth: '42rem',
            margin: '0 auto 2rem auto'
          }}>
            Join the ranks of entertainment venues that have transformed their customer experience with Heinous Trivia
          </p>
          <a
            href="mailto:ResirWrecked@yahoo.com?subject=Heinous Trivia Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              padding: '1rem 3rem',
              borderRadius: '0.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Book Your Free Demo Now
          </a>
          <p style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginTop: '1rem'
          }}>
            Let's build your haunted trivia experience — response within 24 hours.
          </p>
          <ul style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            maxWidth: '20rem',
            margin: '1rem auto 0 auto',
            textAlign: "center",
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>✔️</span>
              <span>No tech skills needed</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>✔️</span>
              <span>Custom preview</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
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
              <h3 style={{ fontFamily: '"Creepster", cursive', fontSize: '1.25rem', color: '#ef4444' }}>HEINOUS TRIVIA</h3>
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
          <div className="border-t border-gray-800 mt-6 pt-6 " style={{textAlign: "center"}}>
            <p className="text-gray-500 text-sm">
              © 2025 Heinous Trivia. All rights reserved. Prepare to be terrified.
            </p>
          </div>
        </div>
      </footer>


    </div>
  );
}