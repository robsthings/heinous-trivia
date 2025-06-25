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
        toast({
          title: "Email Not Authorized",
          description: `The email ${email} is not authorized to access this haunt. Contact the haunt owner to add your email.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
            <h3 className="text-white text-lg font-medium mb-2">Completing Authentication</h3>
            <p className="text-gray-400 text-sm">Please wait while we verify your credentials...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state after email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-red-400 text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              We've sent an authentication link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-gray-400 text-sm">
              Click the link in your email to access your haunt admin dashboard. 
              The link will expire in 1 hour.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
              >
                Send Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400 text-2xl font-bold">
              🎃 Haunt Admin Access
            </CardTitle>
            <p className="text-gray-300 text-sm mt-2">
              Enter your email to receive a secure authentication link
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
                  readOnly
                  className="bg-gray-800 border-gray-600 text-white mt-2 opacity-75"
                />
                <p className="text-gray-400 text-xs mt-1">
                  The unique identifier for your haunt
                </p>
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourhaunt.com"
                  className="bg-gray-800 border-gray-600 text-white mt-2"
                  disabled={isLoading}
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Enter the email address authorized for this haunt
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Authentication Link
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}