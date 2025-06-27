import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EmailAuthService } from "@/lib/emailAuth";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function HauntAuth() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/haunt-auth/:hauntId");
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle redirect flow on component mount
  useEffect(() => {
    const handleEmailLinkRedirect = async () => {
      console.log('Checking for email link redirect...');
      console.log('URL search params:', window.location.search);
      console.log('Full URL:', window.location.href);
      
      // Check if this is a redirect from email link
      const urlParams = new URLSearchParams(window.location.search);
      const hasEmailLinkParams = urlParams.has('apiKey') || urlParams.has('oobCode') || urlParams.has('mode');
      
      console.log('Has email link params:', hasEmailLinkParams);
      
      if (hasEmailLinkParams) {
        console.log('Processing email link authentication...');
        setIsCompleting(true);
        
        // Add a small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await EmailAuthService.completeEmailSignIn(hauntId);
        
        console.log('Authentication result:', result);
        
        if (result.success) {
          toast({
            title: "Authentication Successful",
            description: "Welcome to your haunt admin dashboard!",
          });
          
          // Clear URL parameters and redirect
          window.history.replaceState({}, document.title, `/haunt-auth/${hauntId}`);
          setLocation(`/haunt-admin/${hauntId}`);
        } else {
          toast({
            title: "Authentication Failed",
            description: result.error || "Unable to complete authentication",
            variant: "destructive"
          });
          setIsCompleting(false);
        }
      }
    };

    if (hauntId) {
      handleEmailLinkRedirect();
    }
  }, [hauntId, setLocation, toast]);

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hauntId || !email) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First validate that the email is authorized for this haunt
      const validateResponse = await fetch(`/api/haunt/${hauntId}/email-auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      
      if (!validateResponse.ok) {
        throw new Error('Failed to validate email authorization');
      }
      
      const validation = await validateResponse.json();
      
      if (!validation.authorized) {
        // Check if this haunt has ANY authorized emails
        const listResponse = await fetch(`/api/haunt/${hauntId}/email-auth/list`);
        if (listResponse.ok) {
          const emailList = await listResponse.json();
          
          if (emailList.emails && emailList.emails.length === 0) {
            // No emails authorized yet - add this email directly
            const addResponse = await fetch(`/api/haunt/${hauntId}/email-auth/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email.toLowerCase() })
            });
            
            if (addResponse.ok) {
              toast({
                title: "Email Authorized",
                description: `${email} has been added as an authorized admin for this haunt.`,
              });
              // Continue with email link sending
            } else {
              toast({
                title: "Authorization Failed",
                description: "Unable to authorize email. Please try again.",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }
          } else {
            // Haunt already has authorized emails
            toast({
              title: "Email Not Authorized",
              description: `The email ${email} is not authorized to access this haunt. Contact the haunt owner to add your email to the authorized list.`,
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            title: "Authorization Check Failed",
            description: "Unable to verify email authorization. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      const result = await EmailAuthService.sendEmailLink(email, hauntId);
      
      if (result.success) {
        setEmailSent(true);
        toast({
          title: "Email Sent!",
          description: "Check your email for the authentication link",
        });
      } else {
        toast({
          title: "Failed to Send Email",
          description: result.error || "Unable to send authentication email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to send email link:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show completion loading state
  if (isCompleting) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c0b2e 0%, #2e003e 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 4vw, 2rem)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 'clamp(18rem, 90vw, 22rem)',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          padding: 'clamp(2rem, 6vw, 3rem)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 'clamp(2.5rem, 8vw, 3rem)',
            height: 'clamp(2.5rem, 8vw, 3rem)',
            border: '3px solid transparent',
            borderTop: '3px solid #ef4444',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
            fontFamily: '"Creepster", cursive',
            color: '#ef4444',
            margin: '0 0 0.75rem 0',
            textShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
            letterSpacing: '0.05em'
          }}>
            AUTHENTICATING
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
            margin: 0,
            lineHeight: 1.4
          }}>
            Verifying your credentials...
          </p>
        </div>
      </div>
    );
  }

  // Show success state after email sent
  if (emailSent) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c0b2e 0%, #2e003e 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 4vw, 2rem)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 'clamp(20rem, 90vw, 26rem)',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Success header */}
          <div style={{
            textAlign: 'center',
            padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem) 1rem',
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%)'
          }}>
            <CheckCircle style={{
              width: 'clamp(3rem, 8vw, 4rem)',
              height: 'clamp(3rem, 8vw, 4rem)',
              color: '#22c55e',
              margin: '0 auto 1rem',
              filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))'
            }} />
            <h1 style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              fontFamily: '"Creepster", cursive',
              color: '#22c55e',
              margin: '0 0 0.5rem 0',
              textShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
              letterSpacing: '0.05em'
            }}>
              EMAIL SENT
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: '0 clamp(1.5rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{
                color: '#d1d5db',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                margin: '0 0 0.75rem 0',
                lineHeight: 1.4
              }}>
                Authentication link sent to:
              </p>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                margin: '0 0 1rem 0'
              }}>
                <span style={{
                  color: '#22c55e',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {email}
                </span>
              </div>
              <p style={{
                color: '#9ca3af',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.4
              }}>
                Click the link to access your admin dashboard. Link expires in 1 hour.
              </p>
              <p style={{
                color: '#6b7280',
                fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                margin: 0,
                lineHeight: 1.3
              }}>
                Check spam folder if not received
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(107, 114, 128, 0.3)',
                border: '1px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '0.5rem',
                color: '#d1d5db',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                e.currentTarget.style.color = '#d1d5db';
              }}
            >
              Send Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1c0b2e 0%, #2e003e 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 'clamp(20rem, 90vw, 24rem)',
        background: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Header with atmospheric styling */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem) 1rem',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            fontFamily: '"Creepster", cursive',
            color: '#8b5cf6',
            margin: '0 0 0.5rem 0',
            textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            letterSpacing: '0.05em'
          }}>
            HAUNT ACCESS
          </h1>
          <p style={{
            color: '#d1d5db',
            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
            margin: '0 0 1rem 0',
            opacity: 0.9
          }}>
            Authorized admin authentication
          </p>
        </div>

        {/* Form section */}
        <div style={{ padding: '0 clamp(1.5rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem)' }}>
          <form onSubmit={handleSendEmailLink}>
            {/* Haunt ID display - more compact */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                background: 'rgba(75, 85, 99, 0.3)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  color: '#9ca3af',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontWeight: '500'
                }}>
                  Haunt:
                </span>
                <span style={{
                  color: '#f3f4f6',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}>
                  {hauntId}
                </span>
              </div>
            </div>

            {/* Email input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your authorized email"
                disabled={isLoading}
                required
                style={{
                  width: '100%',
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              style={{
                width: '100%',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: isLoading || !email.trim() 
                  ? 'rgba(107, 114, 128, 0.5)' 
                  : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600',
                cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                outline: 'none',
                opacity: isLoading || !email.trim() ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && email.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail style={{ width: '1rem', height: '1rem' }} />
                  Send Auth Link
                </>
              )}
            </button>
          </form>

          {/* Info footer - much more compact */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#93c5fd',
              fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
              margin: 0,
              lineHeight: 1.4
            }}>
              First time? Your email will be automatically authorized if no admins exist yet.
            </p>
          </div>
        </div>

        {/* Add spinning animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}