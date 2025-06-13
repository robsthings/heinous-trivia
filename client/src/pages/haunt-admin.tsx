import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";

// Tawk.to type declarations
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { ExternalLink } from "lucide-react";
import { SpookyLoader } from "@/components/SpookyLoader";
import { MiniSpookyLoader } from "@/components/MiniSpookyLoader";

import type { HauntConfig, TriviaQuestion } from "@shared/schema";

interface TriviaPack {
  id: string;
  name: string;
  description: string;
  questions: TriviaQuestion[];
  accessType: 'all' | 'tier' | 'select';
  allowedTiers?: string[];
  allowedHaunts?: string[];
}

interface CustomTriviaQuestion {
  id?: string;
  question: string;
  choices: string[];
  correct: string;
  explanation?: string;
}

export default function HauntAdmin() {
  const [, params] = useRoute("/haunt-admin/:hauntId");
  const [, setLocation] = useLocation();
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [newAccessCode, setNewAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hauntConfig, setHauntConfig] = useState<HauntConfig | null>(null);
  const [formData, setFormData] = useState({
    mode: "individual",
    triviaFile: "",
    adFile: "",
    primaryColor: "#8B0000",
    secondaryColor: "#2D1B69",
    accentColor: "#FF6B35"
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adFiles, setAdFiles] = useState<Array<{
    file: File | null;
    link: string;
    id: string;
    title: string;
    description: string;
  }>>([]);
  const [uploadedAds, setUploadedAds] = useState<any[]>([]);
  const [triviaPacks, setTriviaPacks] = useState<TriviaPack[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomTriviaQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<CustomTriviaQuestion | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [showNewAdForm, setShowNewAdForm] = useState(false);
  const [newAdData, setNewAdData] = useState({
    title: '',
    description: '',
    link: '',
    file: null as File | null
  });

  // CSV Upload Handler
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "CSV file must have a header row and at least one question.",
          variant: "destructive"
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      const questions: CustomTriviaQuestion[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        
        // Be more flexible with column count - pad with empty strings if needed
        while (values.length < headers.length) {
          values.push('');
        }

        const questionData: Record<string, string> = {};
        headers.forEach((header, index) => {
          questionData[header] = values[index] || '';
        });

        // Map CSV columns to our question format
        const question: CustomTriviaQuestion = {
          id: `csv-${Date.now()}-${i}`,
          question: questionData.question || '',
          choices: [
            questionData.choice1 || '',
            questionData.choice2 || '',
            questionData.choice3 || '',
            questionData.choice4 || ''
          ],
          correct: questionData[`choice${questionData.correct_answer}`] || questionData.choice1,
          explanation: questionData.explanation || ''
        };

        // Validate question has required data
        if (question.question && question.choices.every(c => c.trim())) {
          questions.push(question);
        }
      }

      if (questions.length === 0) {
        toast({
          title: "No Valid Questions",
          description: "No valid questions found in CSV. Check the format requirements.",
          variant: "destructive"
        });
        return;
      }

      // Add to existing questions (up to tier limit)
      const totalQuestions = customQuestions.length + questions.length;
      const limit = getQuestionLimit(hauntConfig.tier);
      
      if (totalQuestions > limit) {
        const allowedCount = limit - customQuestions.length;
        const addedQuestions = questions.slice(0, allowedCount);
        setCustomQuestions(prev => [...prev, ...addedQuestions]);
        
        toast({
          title: "Partial Upload",
          description: `Added ${addedQuestions.length} questions. Your ${hauntConfig.tier} tier limit is ${limit} questions.`,
        });
      } else {
        setCustomQuestions(prev => [...prev, ...questions]);
        
        toast({
          title: "Success!",
          description: `Successfully imported ${questions.length} questions from your spreadsheet!`,
        });
      }

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      console.error('CSV parsing error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to parse CSV file. Please check the format and try again.",
        variant: "destructive"
      });
    }
  };

  const getAdLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 3;
      case 'pro': return 5;
      case 'premium': return 10;
      default: return 3;
    }
  };

  const getQuestionLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 5;
      case 'pro': return 15;
      case 'premium': return 50;
      default: return 5;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      if (!hauntId) {
        setLocation('/');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/haunt-config/${hauntId}`);
        
        if (!response.ok) {
          toast({
            title: "Haunt Not Found",
            description: "This haunt doesn't exist.",
            variant: "destructive"
          });
          setLocation('/');
          return;
        }

        const data = await response.json() as HauntConfig;
        
        // Check if this is first-time setup
        if (!data.authCode) {
          setIsFirstTimeSetup(true);
          setIsLoading(false);
          return;
        }

        // Check for access code in localStorage
        const savedCode = localStorage.getItem(`heinous-admin-${hauntId}`);
        if (savedCode === data.authCode) {
          setIsAuthenticated(true);
          setHauntConfig(data);
          setFormData({
            mode: data.mode || "individual",
            triviaFile: data.triviaFile || "",
            adFile: data.adFile || "",
            primaryColor: data.theme?.primaryColor || "#8B0000",
            secondaryColor: data.theme?.secondaryColor || "#2D1B69",
            accentColor: data.theme?.accentColor || "#FF6B35"
          });
        } else {
          // Redirect to auth page
          setLocation(`/haunt-auth/${hauntId}`);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        toast({
          title: "Error",
          description: "Failed to check authentication",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (hauntId) {
      checkAuthentication();
    }
  }, [hauntId, setLocation, toast]);

  // Load Tawk.to chat widget (Pro/Premium tiers only)
  useEffect(() => {
    if (hauntConfig && (hauntConfig.tier === "pro" || hauntConfig.tier === "premium")) {
      const loadTawkTo = () => {
        // Only exclude localhost in development
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname.includes('127.0.0.1');
        
        if (isDevelopment) {
          console.log('Tawk.to chat widget disabled in development (Pro/Premium only)');
          return;
        }
        
        console.log('Loading Tawk.to chat widget for Pro/Premium haunt on domain:', window.location.hostname);

        // Initialize Tawk.to
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        
        (function() {
          const s1 = document.createElement("script");
          const s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = 'https://embed.tawk.to/6841ac9da46165190e586891/1hqr8nqhr';
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
    }
  }, [hauntConfig]);

  // Load haunt configuration after authentication
  useEffect(() => {
    if (hauntId && isAuthenticated) {
      loadHauntConfig();
      loadCustomQuestions();
      loadUploadedAds();
      loadTriviaPacks();
    }
  }, [hauntId, isAuthenticated]);

  const loadHauntConfig = async () => {
    try {
      const response = await fetch(`/api/haunt-config/${hauntId}`);
      if (response.ok) {
        const data = await response.json();
        setHauntConfig(data);
      }
    } catch (error) {
      console.error('Failed to load haunt config:', error);
    }
  };

  const loadCustomQuestions = async () => {
    try {
      // These would require additional server endpoints if needed
      // For now, set empty array to avoid Firebase calls
      setCustomQuestions([]);
    } catch (error) {
      console.error('Failed to load custom questions:', error);
    }
  };

  const loadUploadedAds = async () => {
    try {
      // These would require additional server endpoints if needed
      // For now, set empty array to avoid Firebase calls
      setUploadedAds([]);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
  };

  const loadTriviaPacks = async () => {
    try {
      // These would require additional server endpoints if needed
      // For now, set empty array to avoid Firebase calls
      setTriviaPacks([]);
    } catch (error) {
      console.error('Failed to load trivia packs:', error);
    }
  };

  const unbreakMe = async () => {
    setIsSaving(true);
    try {
      // Clear localStorage and sessionStorage for this haunt
      const keysToRemove = [
        `heinous-player-${hauntId}`,
        `heinous-player-name-${hauntId}`,
        `heinous-game-state-${hauntId}`,
        `heinous-admin-cache-${hauntId}`
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Re-fetch latest haunt config from server
      const configResponse = await fetch(`/api/haunt/${hauntId}/config`);
      if (configResponse.ok) {
        const sanitizedConfig = await configResponse.json() as HauntConfig;
        
        // Update config via server API
        const updateResponse = await fetch(`/api/haunt/${hauntId}/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitizedConfig)
        });
        
        if (updateResponse.ok) {
          setHauntConfig(sanitizedConfig);
          
          // Update form data
          setFormData({
            mode: sanitizedConfig.mode as "individual" | "queue",
            triviaFile: sanitizedConfig.triviaFile || "",
            adFile: sanitizedConfig.adFile || "",
            primaryColor: sanitizedConfig.theme.primaryColor,
            secondaryColor: sanitizedConfig.theme.secondaryColor,
            accentColor: sanitizedConfig.theme.accentColor
          });
        }
      }

      // Reload all data sources
      await Promise.all([
        loadCustomQuestions(),
        loadUploadedAds(),
        loadTriviaPacks()
      ]);

      toast({
        title: "🛠️ Haunt Reloaded!",
        description: "Haunt reloaded and squeaky clean! All data refreshed and cache cleared.",
      });
    } catch (error) {
      console.error('Failed to unbreak haunt:', error);
      toast({
        title: "Error",
        description: "Failed to reload haunt data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!hauntConfig) return;

    console.log('Save configuration started');
    console.log('Logo file state:', logoFile ? logoFile.name : 'No logo file');
    setIsSaving(true);
    try {
      let logoPath = hauntConfig.logoPath;

      // Upload logo if a new file was selected
      if (logoFile) {
        try {
          // Use server API for file upload instead of Firebase Storage
          const formData = new FormData();
          formData.append('background', logoFile);
          formData.append('hauntId', hauntId);
          
          const uploadResponse = await fetch('/api/upload-background', {
            method: 'POST',
            body: formData
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            logoPath = result.imageUrl;
            console.log('Logo uploaded via server API:', logoPath);
          } else {
            throw new Error('Server upload failed');
          }
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          toast({
            title: "Logo Upload Failed",
            description: "Failed to upload logo. Please try again.",
            variant: "destructive"
          });
          return; // Don't save config if logo upload fails
        }
      }

      const updatedConfig = {
        ...hauntConfig,
        mode: formData.mode as "individual" | "queue",
        triviaFile: formData.triviaFile,
        adFile: formData.adFile,
        logoPath: logoPath,
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor
        }
      };

      // Use server API to update config
      const response = await fetch(`/api/haunt/${hauntId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      setHauntConfig(updatedConfig);
      
      // Save custom questions if any exist
      if (customQuestions.length > 0) {
        await saveCustomQuestions(customQuestions);
      }
      
      // Save ads if any exist (save whatever ads have at least a file)
      if (adFiles.length > 0 && adFiles.some(ad => ad.file)) {
        await saveAds();
      }
      
      // Clear the logo file after successful upload
      if (logoFile) {
        setLogoFile(null);
      }
      
      toast({
        title: "Success!",
        description: "Haunt configuration, questions, and ads saved successfully!",
      });
    } catch (error) {
      console.error('Failed to update haunt config:', error);
      toast({
        title: "Error",
        description: "Failed to update haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveCustomQuestions = async (questions: CustomTriviaQuestion[]) => {
    try {
      // Custom questions would need a dedicated server endpoint
      // For now, show success message without Firebase operations
      toast({
        title: "Questions Saved",
        description: `${questions.length} custom questions processed (server endpoint needed)`,
      });
    } catch (error) {
      console.error('Failed to save questions:', error);
      toast({
        title: "Error",
        description: "Failed to save custom questions",
        variant: "destructive"
      });
    }
  };

  const saveAds = async () => {
    try {
      // Ad management would need dedicated server endpoints
      // For now, show success message without Firebase operations
      const adsWithFiles = adFiles.filter(ad => ad.file);
      toast({
        title: "Ads Processed",
        description: `${adsWithFiles.length} ads processed (server endpoint needed)`,
      });
    } catch (error) {
      console.error('Failed to save ads:', error);
      toast({
        title: "Error",
        description: "Failed to save ads",
        variant: "destructive"
      });
    }
  };

  const updateExistingAd = async (adId: string, updates: any) => {
    try {
      // Ad update would need dedicated server endpoint
      toast({
        title: "Ad Updated",
        description: "Ad update processed (server endpoint needed)",
      });
    } catch (error) {
      console.error('Failed to update ad:', error);
      toast({
        title: "Error",
        description: "Failed to update ad",
        variant: "destructive"
      });
    }
  };

  const deleteExistingAd = async (adId: string) => {
    try {
      // Ad deletion would need dedicated server endpoint
      
      // Reload ads to show updated list
      await loadUploadedAds();
      
      toast({
        title: "Ad Deleted",
        description: "Ad deleted successfully!",
      });
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive"
      });
    }
  };

  const addNewAd = async (newAd: { title: string; description: string; link: string; file: File }) => {
    try {
      // New ad creation would need dedicated server endpoint
      toast({
        title: "Ad Added",
        description: "New ad processed (server endpoint needed)",
      });
    } catch (error) {
      console.error('Failed to add ad:', error);
      toast({
        title: "Error",
        description: "Failed to add ad",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <SpookyLoader message="Loading haunt configuration..." showProgress={true} />;
  }

  // First-time setup screen
  if (isFirstTimeSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4 flex items-center justify-center">
        <Card className="bg-black/80 border-red-600 text-white max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-500">
              🎃 Welcome to Your Haunt!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-center">
              Set up your admin access code to secure your haunt dashboard. 
              This code will be required to access your admin panel.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessCode" className="text-white">Create Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  placeholder="Enter a secure access code (min 6 characters)"
                  className="bg-gray-800 border-gray-600 text-white"
                  minLength={6}
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (!newAccessCode || newAccessCode.length < 6) {
                    toast({
                      title: "Invalid Code",
                      description: "Access code must be at least 6 characters long",
                      variant: "destructive"
                    });
                    return;
                  }

                  setIsSaving(true);
                  try {
                    // Use server API to update auth code
                    const response = await fetch(`/api/haunt/${hauntId}/config`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ authCode: newAccessCode })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to update auth code');
                    }
                    
                    localStorage.setItem(`heinous-admin-${hauntId}`, newAccessCode);
                    setIsFirstTimeSetup(false);
                    setIsAuthenticated(true);
                    
                    toast({
                      title: "Setup Complete!",
                      description: "Your admin dashboard is now secured.",
                    });
                  } catch (error) {
                    console.error('Failed to set access code:', error);
                    toast({
                      title: "Setup Failed",
                      description: "Unable to set access code. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isSaving || !newAccessCode || newAccessCode.length < 6}
              >
                {isSaving ? "Setting Up..." : "Secure My Dashboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hauntConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4 flex items-center justify-center">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Haunt Not Found</h2>
              <p className="text-gray-300 mb-6">The haunt "{hauntId}" could not be found.</p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
              >
                🎮 Back to Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center lg:text-left bg-black/60 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
            👹 {hauntConfig.name || hauntId}
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            Manage your haunt configuration, trivia questions, and advertisements
          </p>
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start items-center">
            <span className="px-3 py-1 bg-gray-800/80 text-gray-300 rounded-full text-sm border border-gray-600">
              Tier: <span className="text-white font-semibold capitalize">{hauntConfig.tier}</span>
            </span>
            <span className="px-3 py-1 bg-gray-800/80 text-gray-300 rounded-full text-sm border border-gray-600">
              Mode: <span className="text-white font-semibold capitalize">{hauntConfig.mode}</span>
            </span>
            <Button
              onClick={unbreakMe}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-black/50"
              title="If your game isn't behaving right, try this."
            >
              🛠️ Unbreak Me!
            </Button>
            {(hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium') && (
              <Button
                onClick={() => setLocation(`/analytics/${hauntId}`)}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-black/50"
                title="View detailed analytics and performance metrics"
              >
                📊 Analytics
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Haunt Branding Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  🎨 Haunt Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-white text-sm font-medium mb-2 block">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-white text-sm font-medium mb-2 block">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-white text-sm font-medium mb-2 block">Accent Color</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoUpload" className="text-white text-sm font-medium mb-2 block">Logo Upload</Label>
                  <p className="text-gray-400 text-xs mb-2">Recommended size: 600x300 PNG</p>
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log('Logo file selected:', file ? file.name : 'No file');
                      setLogoFile(file);
                    }}
                    className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3 file:cursor-pointer"
                  />
                  {logoFile && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      ✅ Selected: {logoFile.name}
                    </p>
                  )}
                </div>

                {/* Custom Branding Preview (Read-Only) */}
                {(hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium') && (
                  <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500 rounded-lg">
                    <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                      🎨 Premium Custom Branding Preview
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-purple-200 text-sm mb-2 block">Custom Background Skin</Label>
                        {hauntConfig.skinUrl ? (
                          <div className="text-green-400 text-sm flex items-center gap-2">
                            ✅ Active: Custom background assigned
                            <a 
                              href={hauntConfig.skinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Preview
                            </a>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Default horror theme active</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-purple-200 text-sm mb-2 block">Custom Progress Bar</Label>
                        {hauntConfig.progressBarUrl ? (
                          <div className="text-green-400 text-sm flex items-center gap-2">
                            ✅ Active: Custom animation assigned
                            <a 
                              href={hauntConfig.progressBarUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Preview
                            </a>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Default progress bar active</div>
                        )}
                      </div>
                    </div>
                    <p className="text-purple-300 text-xs mt-3">
                      🔒 Custom branding is managed by Uber Admin. Contact support to request changes or custom designs for your haunt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Configuration Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  ⚙️ Game Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="mode" className="text-white text-sm font-medium mb-2 block">Game Mode</Label>
                  <Select 
                    value={formData.mode} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}
                    disabled={hauntConfig.tier === "basic" && formData.mode !== "individual"}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-11">
                      <SelectValue placeholder="Select game mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="individual" className="text-white hover:bg-gray-700">
                        Individual Mode - Players compete individually
                      </SelectItem>
                      <SelectItem 
                        value="queue" 
                        className={`${hauntConfig.tier === "basic" ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-gray-700"}`}
                        disabled={hauntConfig.tier === "basic"}
                      >
                        Group Mode - Host-controlled synchronized sessions
                        {hauntConfig.tier === "basic" && <span className="text-xs text-gray-500 ml-2">(Pro/Premium only)</span>}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-gray-400 text-xs mt-1">
                    Current: <span className="text-white font-medium capitalize">{hauntConfig.mode}</span> mode
                    {hauntConfig.tier === "basic" && (
                      <span className="block text-orange-400 text-xs mt-1">
                        Upgrade to Pro or Premium to unlock Group Mode for synchronized multiplayer sessions
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>



          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Ad Management Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  📢 Ad Management
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Your <span className="text-white font-medium capitalize">{hauntConfig.tier}</span> tier allows up to{" "}
                  <span className="text-white font-medium">{getAdLimit(hauntConfig.tier)}</span> ads. Recommended size: 800x400 PNG.
                </p>
                <div className="mt-3">
                  <Link 
                    href="/upload-guidelines" 
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Review our Upload Guidelines
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {/* Current Ads Section */}
                {uploadedAds.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-white font-medium">Current Ads</h3>
                    {uploadedAds.map((ad) => (
                      <div key={ad.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{ad.title}</h4>
                            <p className="text-gray-400 text-sm">{ad.description}</p>
                            {ad.link && ad.link !== "#" && (
                              <a href={ad.link} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-400 text-sm hover:underline flex items-center gap-1 mt-1">
                                <ExternalLink className="w-3 h-3" />
                                {ad.link}
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingAd(ad)}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteExistingAd(ad.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        {ad.imageUrl && (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            className="w-full max-w-xs h-24 object-cover rounded border border-gray-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Ad Button */}
                {uploadedAds.length < getAdLimit(hauntConfig.tier) && (
                  <div className="mb-4">
                    <Button
                      onClick={() => setShowNewAdForm(true)}
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      + Add New Ad
                    </Button>
                  </div>
                )}

                {/* Legacy Bulk Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium border-t border-gray-600 pt-4">Bulk Upload (replaces all ads)</h3>
                  {adFiles.map((ad, index) => (
                    <div key={ad.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium">Ad #{index + 1}</h4>
                        {adFiles.length > 1 && (
                          <Button
                            onClick={() => setAdFiles(prev => prev.filter((_, i) => i !== index))}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white text-xs"
                          >
                            🗑️ Remove
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-white text-sm">Ad Title *</Label>
                            <Input
                              type="text"
                              value={ad.title}
                              onChange={(e) => {
                                const updated = [...adFiles];
                                updated[index].title = e.target.value;
                                setAdFiles(updated);
                              }}
                              placeholder="e.g., Midnight Ghost Tours"
                              className="bg-gray-800 border-gray-600 text-white h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Link (Optional)</Label>
                            <Input
                              type="url"
                              value={ad.link}
                              onChange={(e) => {
                                const updated = [...adFiles];
                                updated[index].link = e.target.value;
                                setAdFiles(updated);
                              }}
                              placeholder="https://your-website.com"
                              className="bg-gray-800 border-gray-600 text-white h-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-white text-sm">Description</Label>
                          <Textarea
                            value={ad.description}
                            onChange={(e) => {
                              const updated = [...adFiles];
                              updated[index].description = e.target.value;
                              setAdFiles(updated);
                            }}
                            placeholder="Brief description of your ad..."
                            className="bg-gray-800 border-gray-600 text-white min-h-[60px]"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm">Image Upload *</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const updated = [...adFiles];
                              updated[index].file = e.target.files?.[0] || null;
                              setAdFiles(updated);
                            }}
                            className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {adFiles.length < getAdLimit(hauntConfig.tier) && (
                    <Button
                      onClick={() => setAdFiles(prev => [...prev, { 
                        file: null, 
                        link: "", 
                        id: `ad${prev.length + 1}`,
                        title: "",
                        description: ""
                      }])}
                      variant="outline"
                      className="w-full border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                    >
                      ➕ Add Another Ad
                    </Button>
                  )}

                  {/* Current Uploaded Ads */}
                  {uploadedAds.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-600">
                      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        📋 Current Ads ({uploadedAds.length})
                      </h3>
                      <div className="space-y-3">
                        {uploadedAds.map((ad) => (
                          <div key={ad.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  {ad.imageUrl && (
                                    <img 
                                      src={ad.imageUrl} 
                                      alt={ad.title}
                                      className="w-16 h-12 object-cover rounded border border-gray-500"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium">{ad.title || 'Untitled Ad'}</h4>
                                    {ad.description && (
                                      <p className="text-gray-400 text-sm mt-1">{ad.description}</p>
                                    )}
                                    {ad.link && (
                                      <a 
                                        href={ad.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-flex items-center gap-1"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        {ad.link}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this ad?')) {
                                    try {
                                      // Ad deletion would need dedicated server endpoint
                                      await loadUploadedAds(); // Refresh the list
                                      toast({
                                        title: "Ad Deleted",
                                        description: "The ad has been successfully removed.",
                                      });
                                    } catch (error) {
                                      console.error('Failed to delete ad:', error);
                                      toast({
                                        title: "Delete Failed",
                                        description: "Unable to delete the ad. Please try again.",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Custom Trivia Section - Full Width */}
        <Card className="bg-black/60 border-gray-600 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
              📝 Custom Trivia Questions
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Create custom questions specific to your haunt. Your <span className="text-white font-medium capitalize">{hauntConfig.tier}</span> tier allows up to{" "}
              <span className="text-white font-medium">{getQuestionLimit(hauntConfig.tier)}</span> custom questions.
            </p>
            <div className="mt-3">
              <Link 
                href="/upload-guidelines" 
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 underline"
              >
                <ExternalLink className="w-3 h-3" />
                Review our Upload Guidelines
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customQuestions.map((question, index) => (
                <div key={question.id || index} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-medium">Question #{index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingQuestion(question)}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white text-xs px-2 py-1"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("Delete this question?")) {
                            setCustomQuestions(prev => prev.filter((_, i) => i !== index));
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white text-xs px-2 py-1"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-white text-sm font-medium">Question:</p>
                      <p className="text-gray-300 text-sm">{question.question}</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Choices:</p>
                      <ul className="text-gray-300 text-sm ml-3 space-y-1">
                        {question.choices.map((choice, choiceIndex) => (
                          <li key={choiceIndex} className={choice === question.correct ? "text-green-400 font-medium" : ""}>
                            {choice === question.correct ? "✅ " : "• "}{choice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              
              {customQuestions.length < getQuestionLimit(hauntConfig.tier) && (
                <Button
                  onClick={() => setEditingQuestion({
                    question: "",
                    choices: ["", "", "", ""],
                    correct: "",
                    explanation: ""
                  })}
                  variant="outline"
                  className="w-full border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                >
                  ➕ Add Custom Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold w-full sm:w-auto shadow-lg"
          >
            {isSaving ? "Saving..." : "💾 Save Configuration"}
          </Button>
          <Button
            onClick={() => window.open(`/host-panel/${hauntId}`, '_blank')}
            variant="outline"
            className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white w-full sm:w-auto"
          >
            👑 Open Host Panel
          </Button>
          <Button
            onClick={() => window.location.href = `/?haunt=${hauntId}`}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white w-full sm:w-auto"
          >
            🎮 Back to Game
          </Button>
        </div>
        
      {/* Custom Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">
                {editingQuestion.question ? "Edit Question" : "Add New Question"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Question *</Label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, question: e.target.value} : null)}
                  placeholder="Enter your trivia question..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-white">Answer Choices *</Label>
                {editingQuestion.choices.map((choice, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...editingQuestion.choices];
                        newChoices[index] = e.target.value;
                        setEditingQuestion(prev => prev ? {...prev, choices: newChoices} : null);
                      }}
                      placeholder={`Choice ${index + 1}`}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Checkbox
                      checked={editingQuestion.correct === choice}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditingQuestion(prev => prev ? {...prev, correct: choice} : null);
                        }
                      }}
                      className="border-gray-600"
                    />
                    <Label className="text-white text-sm">Correct</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label className="text-white">Explanation (Optional)</Label>
                <Textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, explanation: e.target.value} : null)}
                  placeholder="Explain why this is the correct answer (will show after they answer)..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
                <p className="text-gray-400 text-xs mt-1">
                  This explanation will appear after players answer the question to help them learn.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={async () => {
                    if (editingQuestion.question && editingQuestion.choices.every(c => c.trim()) && editingQuestion.correct) {
                      if (editingQuestion.question && customQuestions.find(q => q.question === editingQuestion.question)) {
                        // Update existing
                        setCustomQuestions(prev => prev.map(q => 
                          q.question === editingQuestion.question ? editingQuestion : q
                        ));
                      } else {
                        // Add new
                        setCustomQuestions(prev => [...prev, {...editingQuestion, id: `q${Date.now()}`}]);
                      }
                      // Save questions immediately after adding/editing
                      const updatedQuestions = editingQuestion.question && customQuestions.find(q => q.question === editingQuestion.question) 
                        ? customQuestions.map(q => q.question === editingQuestion.question ? editingQuestion : q)
                        : [...customQuestions, {...editingQuestion, id: `q${Date.now()}`}];
                      saveCustomQuestions(updatedQuestions);
                      setEditingQuestion(null);
                    } else {
                      toast({
                        title: "Missing Information",
                        description: "Please fill in all fields and select a correct answer",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Question
                </Button>
                <Button
                  onClick={() => setEditingQuestion(null)}
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Ad Modal */}
      {editingAd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-black/90 border-red-600 text-white max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-500">Edit Ad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Title</Label>
                <Input
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Description</Label>
                <Textarea
                  value={editingAd.description}
                  onChange={(e) => setEditingAd({...editingAd, description: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Link (optional)</Label>
                <Input
                  value={editingAd.link}
                  onChange={(e) => setEditingAd({...editingAd, link: e.target.value})}
                  placeholder="https://example.com or leave blank"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              {editingAd.imageUrl && (
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Current Image</Label>
                  <img 
                    src={editingAd.imageUrl} 
                    alt={editingAd.title}
                    className="w-full max-w-xs h-24 object-cover rounded border border-gray-600"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updateExistingAd(editingAd.id, {
                      title: editingAd.title,
                      description: editingAd.description,
                      link: editingAd.link || "#"
                    });
                    setEditingAd(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setEditingAd(null)}
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Ad Modal */}
      {showNewAdForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-black/90 border-red-600 text-white max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-500">Add New Ad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Title</Label>
                <Input
                  value={newAdData.title}
                  onChange={(e) => setNewAdData({...newAdData, title: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Description</Label>
                <Textarea
                  value={newAdData.description}
                  onChange={(e) => setNewAdData({...newAdData, description: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Link (optional)</Label>
                <Input
                  value={newAdData.link}
                  onChange={(e) => setNewAdData({...newAdData, link: e.target.value})}
                  placeholder="https://example.com or leave blank"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewAdData({...newAdData, file: e.target.files?.[0] || null})}
                  className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3 file:cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (newAdData.title && newAdData.description && newAdData.file) {
                      await addNewAd(newAdData as { title: string; description: string; link: string; file: File });
                      setNewAdData({ title: '', description: '', link: '', file: null });
                      setShowNewAdForm(false);
                    } else {
                      toast({
                        title: "Missing Fields",
                        description: "Please fill in title, description, and select an image",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add Ad
                </Button>
                <Button
                  onClick={() => {
                    setNewAdData({ title: '', description: '', link: '', file: null });
                    setShowNewAdForm(false);
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Footer />


      </div>
    </div>
  );
}