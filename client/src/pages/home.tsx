import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { SpookyLoader } from "@/components/SpookyLoader";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { HauntConfig } from "@shared/schema";

export default function Home() {
  const [haunts, setHaunts] = useState<HauntConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveHaunts();
  }, []);

  const loadActiveHaunts = async () => {
    try {
      const hauntsRef = collection(firestore, 'haunts');
      const activeQuery = query(hauntsRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(activeQuery);
      
      const activeHaunts: HauntConfig[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activeHaunts.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          logoPath: data.logoPath,
          triviaFile: data.triviaFile,
          adFile: data.adFile,
          mode: data.mode,
          tier: data.tier,
          isActive: data.isActive,
          authCode: data.authCode,
          theme: data.theme,
        });
      });
      
      setHaunts(activeHaunts);
    } catch (error) {
      console.error('Failed to load haunts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-600';
      case 'pro': return 'bg-blue-600';
      case 'basic': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return '👑';
      case 'pro': return '⚡';
      case 'basic': return '🎯';
      default: return '🎮';
    }
  };

  if (isLoading) {
    return <SpookyLoader message="Awakening the spirits..." showProgress={true} />;
  }

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

        {/* Available Haunts */}
        {haunts.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Available Haunts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {haunts.map((haunt) => (
                <Card 
                  key={haunt.id} 
                  className="bg-black/60 border-gray-600 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="text-xl font-semibold text-white"
                        style={{ color: haunt.theme?.primaryColor || '#dc2626' }}
                      >
                        {haunt.name}
                      </CardTitle>
                      <Badge className={`${getTierColor(haunt.tier)} text-white text-xs`}>
                        {getTierIcon(haunt.tier)} {haunt.tier.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {haunt.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-gray-400 border-gray-500">
                        Mode: {haunt.mode === 'individual' ? '👤 Solo' : '👥 Group'}
                      </Badge>
                      <Link href={`/?haunt=${haunt.id}`}>
                        <Button 
                          className="text-white font-medium px-4 py-2"
                          style={{ 
                            backgroundColor: haunt.theme?.primaryColor || '#dc2626',
                            borderColor: haunt.theme?.primaryColor || '#dc2626'
                          }}
                        >
                          Enter Haunt 🚪
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="glass-card rounded-xl p-8 max-w-md mx-auto">
              <h3 className="font-creepster text-2xl text-red-500 mb-4">
                The Realm Sleeps
              </h3>
              <p className="text-gray-300 mb-6">
                No haunts are currently active. The spirits are gathering their strength...
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="horror-button px-6 py-3 rounded-lg font-medium text-white"
              >
                Awaken the Spirits
              </Button>
            </div>
          </div>
        )}

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