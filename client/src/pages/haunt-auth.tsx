import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function HauntAuth() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/haunt-auth/:hauntId");
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hauntId || !accessCode) {
      toast({
        title: "Missing Information",
        description: "Please enter your access code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if haunt exists and verify access code
      const hauntRef = doc(firestore, 'haunts', hauntId);
      const hauntSnap = await getDoc(hauntRef);

      if (!hauntSnap.exists()) {
        toast({
          title: "Haunt Not Found",
          description: "The specified haunt does not exist",
          variant: "destructive"
        });
        return;
      }

      const hauntData = hauntSnap.data();
      
      // Check if access code matches
      if (hauntData.authCode !== accessCode) {
        toast({
          title: "Access Denied",
          description: "Invalid access code for this haunt",
          variant: "destructive"
        });
        return;
      }

      // Store authentication in localStorage
      localStorage.setItem(`heinous-admin-${hauntId}`, accessCode);

      toast({
        title: "Access Granted",
        description: `Welcome to ${hauntData.name} admin dashboard!`,
      });

      // Redirect to haunt admin dashboard
      setLocation(`/haunt-admin/${hauntId}`);

    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: "Unable to verify access. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400 text-2xl font-creepster">
              🎃 Haunt Admin Access
            </CardTitle>
            <p className="text-gray-300 text-sm mt-2">
              Enter your haunt credentials to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="accessCode" className="text-white">
                  Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter your access code"
                  className="bg-gray-800 border-gray-600 text-white mt-2"
                  disabled={isLoading}
                />
                <p className="text-gray-400 text-xs mt-1">
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
              <p className="text-gray-400 text-xs text-center">
                Need access? Contact your haunt administrator for credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}