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
      // Check if this is a redirect from email link
      if (window.location.search.includes('apiKey') || window.location.search.includes('oobCode')) {
        setIsCompleting(true);
        
        const result = await EmailAuthService.completeEmailSignIn(hauntId);
        
        if (result.success) {
          toast({
            title: "Authentication Successful",
            description: "Welcome to your haunt admin dashboard!",
          });
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await EmailAuthService.sendEmailLink(email, hauntId);
      
      if (result.success) {
        setEmailSent(true);
        toast({
          title: "Email Sent",
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
      console.error('Email link error:', error);
      toast({
        title: "Authentication Error",
        description: "Unable to send authentication email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show completion loading state
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="pt-8 pb-6">
              <div style={{textAlign: "center"}}>
                <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-red-400 text-lg font-bold mb-2">Completing Authentication</h3>
                <p className="text-gray-300 text-sm">Verifying your access...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader style={{textAlign: "center"}}>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-green-400 text-xl font-bold">
                Email Sent!
              </CardTitle>
              <p className="text-gray-300 text-sm mt-2">
                Check your email for the authentication link
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Next steps:</strong>
                  </p>
                  <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
                    <li>Open the email sent to <strong className="text-white">{email}</strong></li>
                    <li>Click the authentication link</li>
                    <li>You'll be redirected to your admin dashboard</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Send Different Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show email input form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader style={{textAlign: "center"}}>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-red-400 text-2xl font-bold">
              Admin Access
            </CardTitle>
            <p className="text-gray-300 text-sm mt-2">
              Enter your email to receive an authentication link
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmailLink} className="space-y-6">
              <div>
                <Label htmlFor="hauntId" className="text-white">
                  Haunt ID
                </Label>
                <Input
                  id="hauntId"
                  type="text"
                  value={hauntId}
                  disabled
                  className="bg-gray-800 border-gray-600 text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@yourhaunt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending Email...
                  </>
                ) : (
                  <>
                    Send Authentication Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
                  The secret code you set up for this haunt
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Access Admin Dashboard"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <p className="text-gray-400 text-xs " style={{textAlign: "center"}}>
                Need access? Contact your haunt administrator for credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}