import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { EmailAuthService } from "@/lib/emailAuth";

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
        
        // Import EmailAuthService dynamically to avoid circular dependencies
        const { EmailAuthService } = await import('@/lib/emailAuth');
        
        // Check if user is authenticated via email link
        if (EmailAuthService.isAuthenticated(hauntId)) {
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
          // Load initial data
          await Promise.all([
            loadCustomQuestions(),
            loadUploadedAds(),
            loadTriviaPacks()
          ]);
        } else {
          // Check legacy access code system as fallback
          const savedCode = localStorage.getItem(`heinous-admin-${hauntId}`);
          if (data.authCode && savedCode === data.authCode) {
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
            // Load initial data
            await Promise.all([
              loadCustomQuestions(),
              loadUploadedAds(),
              loadTriviaPacks()
            ]);
          } else {
            // Check if this is first-time setup (no auth method configured)
            if (!data.authCode && (!data.authorizedEmails || data.authorizedEmails.length === 0)) {
              setIsFirstTimeSetup(true);
              setIsLoading(false);
              return;
            }
            
            // Redirect to auth page
            setLocation(`/haunt-auth/${hauntId}`);
          }
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
      const response = await fetch(`/api/custom-questions/${hauntId}`);
      if (response.ok) {
        const questions = await response.json();
        setCustomQuestions(questions);
      } else {
        setCustomQuestions([]);
      }
    } catch (error) {
      console.error('Failed to load custom questions:', error);
      setCustomQuestions([]);
    }
  };

  const loadUploadedAds = async () => {
    try {
      const response = await fetch(`/api/ads/${hauntId}`);
      if (response.ok) {
        const ads = await response.json();
        setUploadedAds(ads);
      }
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
      const response = await fetch(`/api/custom-questions/${hauntId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions })
      });

      if (!response.ok) {
        throw new Error('Failed to save questions');
      }

      toast({
        title: "Questions Saved",
        description: `${questions.length} custom questions saved successfully`,
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
      const formData = new FormData();
      
      if (updates.title) formData.append('title', updates.title);
      if (updates.description) formData.append('description', updates.description);
      if (updates.link) formData.append('link', updates.link);
      if (updates.file) formData.append('image', updates.file);
      
      const response = await fetch(`/api/ads/${hauntId}/${adId}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ad');
      }
      
      await loadUploadedAds();
      
      toast({
        title: "Ad Updated",
        description: "Ad updated successfully!",
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
      if (!confirm('Are you sure you want to delete this ad?')) {
        return;
      }
      
      const response = await fetch(`/api/ads/${hauntId}/${adId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }
      
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
      const formData = new FormData();
      formData.append('title', newAd.title);
      formData.append('description', newAd.description);
      formData.append('link', newAd.link);
      formData.append('image', newAd.file);
      
      const response = await fetch(`/api/ads/${hauntId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add ad');
      }
      
      await loadUploadedAds();
      
      toast({
        title: "Ad Added",
        description: "Ad added successfully!",
      });
    } catch (error) {
      console.error('Failed to add ad:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add ad",
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
      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #581c87, #7f1d1d)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        <Card style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid #dc2626',
          color: '#ffffff',
          maxWidth: '28rem',
          width: '100%',
          backdropFilter: 'blur(8px)'
        }}>
          <CardHeader style={{textAlign: "center"}}>
            <CardTitle >
              🎃 Welcome to Your Haunt!
            </CardTitle>
          </CardHeader>
          <CardContent >
            <p  style={{textAlign: "center"}}>
              Set up your admin email to receive secure authentication links for dashboard access.
            </p>
            
            <div >
              <div>
                <Label htmlFor="adminEmail" >Admin Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  placeholder="admin@yourhaunt.com"
                  
                />
              </div>
              
              <Button
                onClick={async () => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(newAccessCode.trim())) {
                    toast({
                      title: "Invalid Email",
                      description: "Please enter a valid email address.",
                      variant: "destructive"
                    });
                    return;
                  }

                  setIsSaving(true);
                  try {
                    // Initialize haunt with first authorized email
                    const response = await fetch(`/api/haunt/${hauntId}/email-auth/initialize`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: newAccessCode.trim() })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to initialize email auth');
                    }
                    
                    toast({
                      title: "Setup Complete!",
                      description: "Email authentication configured. Use the login page to access your dashboard.",
                    });
                    
                    // Redirect to auth page
                    setLocation(`/haunt-auth/${hauntId}`);
                  } catch (error) {
                    console.error('Failed to set email auth:', error);
                    toast({
                      title: "Setup Failed",
                      description: "Unable to configure email authentication. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                
                disabled={isSaving || !newAccessCode.trim()}
              >
                {isSaving ? "Setting Up..." : "Configure Email Access"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hauntConfig) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #111827, #581c87, #7f1d1d)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid #dc2626',
          color: '#ffffff',
          backdropFilter: 'blur(8px)'
        }}>
          <CardContent >
            <div style={{textAlign: "center"}}>
              <h2 >Haunt Not Found</h2>
              <p  style={{marginBottom: "1.5rem"}}>The haunt "{hauntId}" could not be found.</p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #581c87, #7f1d1d)',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingBottom: '6rem'
      }}>
        
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #6b7280',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)'
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            lineHeight: '2.5rem',
            fontWeight: '700',
            color: hauntConfig.theme?.primaryColor || '#dc2626',
            marginBottom: '0.5rem'
          }}>
            👹 {hauntConfig.name || hauntId}
          </h1>
          <p style={{
            color: '#d1d5db',
            fontSize: '1.125rem',
            lineHeight: '1.75rem',
            marginBottom: '1rem'
          }}>
            Manage your haunt configuration, trivia questions, and advertisements
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              background: 'rgba(31, 41, 55, 0.8)',
              color: '#d1d5db',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              border: '1px solid #4b5563'
            }}>
              Tier: <span style={{ color: '#ffffff', fontWeight: '600', textTransform: 'capitalize' }}>{hauntConfig.tier}</span>
            </span>
            <Button
              onClick={unbreakMe}
              disabled={isSaving}
              variant="outline"
              size="sm"
              
              title="If your game isn't behaving right, try this."
            >
              🛠️ Unbreak Me!
            </Button>
            {(hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium') && (
              <Button
                onClick={() => setLocation(`/analytics/${hauntId}`)}
                variant="outline"
                size="sm"
                
                title="View detailed analytics and performance metrics"
              >
                📊 Analytics
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1280 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Haunt Branding Section */}
            <Card style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #6b7280',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(8px)'
            }}>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <CardTitle style={{
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                  fontWeight: '600',
                  color: hauntConfig.theme?.primaryColor || '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🎨 Haunt Branding
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <Label htmlFor="primaryColor" style={{
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      style={{
                        height: '2.75rem',
                        background: '#1f2937',
                        border: '1px solid #4b5563',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" style={{
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      style={{
                        height: '2.75rem',
                        background: '#1f2937',
                        border: '1px solid #4b5563',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accentColor" style={{
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>Accent Color</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      style={{
                        height: '2.75rem',
                        background: '#1f2937',
                        border: '1px solid #4b5563',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoUpload" style={{
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>Logo Upload</Label>
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>Recommended size: 600x300 PNG</p>
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log('Logo file selected:', file ? file.name : 'No file');
                      setLogoFile(file);
                    }}
                    
                  />
                  {logoFile && (
                    <p >
                      ✅ Selected: {logoFile.name}
                    </p>
                  )}
                </div>

                {/* Custom Branding Preview (Read-Only) */}
                {(hauntConfig.tier === 'pro' || hauntConfig.tier === 'premium') && (
                  <div >
                    <h4 >
                      🎨 Premium Custom Branding Preview
                    </h4>
                    <div >
                      <div>
                        <Label >Custom Background Skin</Label>
                        {hauntConfig.skinUrl ? (
                          <div >
                            ✅ Active: Custom background assigned
                            <a 
                              href={hauntConfig.skinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              
                            >
                              Preview
                            </a>
                          </div>
                        ) : (
                          <div >Default horror theme active</div>
                        )}
                      </div>
                      <div>
                        <Label >Custom Progress Bar</Label>
                        {hauntConfig.progressBarUrl ? (
                          <div >
                            ✅ Active: Custom animation assigned
                            <a 
                              href={hauntConfig.progressBarUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              
                            >
                              Preview
                            </a>
                          </div>
                        ) : (
                          <div >Default progress bar active</div>
                        )}
                      </div>
                    </div>
                    <p >
                      🔒 Custom branding is managed by Uber Admin. Contact support to request changes or custom designs for your haunt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>





          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Ad Management Section */}
            <Card style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #6b7280',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(8px)'
            }}>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <CardTitle style={{
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                  fontWeight: '600',
                  color: hauntConfig.theme?.primaryColor || '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📢 Ad Management
                </CardTitle>
                <p >
                  Your <span >{hauntConfig.tier}</span> tier allows up to{" "}
                  <span >{getAdLimit(hauntConfig.tier)}</span> ads. Recommended size: 800x400 PNG.
                </p>
                <div >
                  <Link 
                    href="/upload-guidelines" 
                    
                  >
                    <ExternalLink  />
                    Review our Upload Guidelines
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {/* Ad Grid Management */}
                <div >
                  {/* Ad Grid Display */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    maxWidth: '100%'
                  }}>
                    {Array.from({ length: getAdLimit(hauntConfig.tier) }, (_, index) => {
                      const ad = uploadedAds[index];
                      return (
                        <div key={index} style={{ position: 'relative' }}>
                          {ad ? (
                            // Existing Ad Thumbnail - Compact Size
                            <div 
                              
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: '96px',
                                backgroundColor: '#1f2937',
                                border: '2px solid #4b5563',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6b7280';
                                const controls = e.currentTarget.querySelector('.ad-hover-controls') as HTMLElement;
                                if (controls) controls.style.opacity = '1';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#4b5563';
                                const controls = e.currentTarget.querySelector('.ad-hover-controls') as HTMLElement;
                                if (controls) controls.style.opacity = '0';
                              }}
                            >
                              {ad.imageUrl && (
                                <img 
                                  src={ad.imageUrl} 
                                  alt={ad.title}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}
                              {!ad.imageUrl && (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#1f2937'
                                }}>
                                  <span style={{ color: '#6b7280', fontSize: '12px' }}>No Image</span>
                                </div>
                              )}
                              
                              {/* Always Visible Controls */}
                              <div 
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  display: 'flex',
                                  gap: '4px',
                                  zIndex: 10
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Edit button clicked for ad:', ad.id);
                                    setEditingAd(ad);
                                  }}
                                  style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                  title="Edit this ad"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteExistingAd(ad.id);
                                  }}
                                  style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                  title="Delete this ad"
                                >
                                  Del
                                </button>
                              </div>
                              
                              {/* Ad Info Overlay */}
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
                                padding: '8px'
                              }}>
                                <h4 style={{
                                  color: 'white',
                                  fontWeight: '500',
                                  fontSize: '12px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  margin: 0
                                }}>{ad.title}</h4>
                              </div>
                            </div>
                          ) : (
                            // Empty Ad Slot - Compact Size
                            <div 
                              onClick={() => setShowNewAdForm(true)}
                              style={{
                                width: '100%',
                                height: '96px',
                                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                                border: '2px dashed #4b5563',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6b7280';
                                e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#4b5563';
                                e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                              }}
                            >
                              <div style={{ fontSize: '24px', color: '#6b7280', marginBottom: '4px' }}>+</div>
                              <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>Add</span>
                              <span style={{ color: '#4b5563', fontSize: '12px' }}>{index + 1}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Info */}
                  <div >
                    <span >
                      {uploadedAds.length} of {getAdLimit(hauntConfig.tier)} ad slots used
                    </span>
                    <span >
                      {getAdLimit(hauntConfig.tier) - uploadedAds.length} slots remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Custom Trivia Section - Full Width */}
        <Card style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid #6b7280',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)'
        }}>
          <CardHeader style={{ paddingBottom: '1rem' }}>
            <CardTitle style={{
              fontSize: '1.25rem',
              lineHeight: '1.75rem',
              fontWeight: '600',
              color: hauntConfig.theme?.primaryColor || '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Custom Trivia Questions
            </CardTitle>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
              Create custom questions specific to your haunt. Your <span style={{ color: '#ffffff', fontWeight: '500', textTransform: 'capitalize' }}>{hauntConfig.tier}</span> tier allows up to{" "}
              <span style={{ color: '#ffffff', fontWeight: '500' }}>{getQuestionLimit(hauntConfig.tier)}</span> custom questions.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link 
                href="/upload-guidelines" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#60a5fa',
                  textDecoration: 'underline'
                }}
              >
                <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                Review our Upload Guidelines
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div >
              {customQuestions.map((question, index) => (
                <div key={question.id || index} >
                  <div >
                    <h4 >Question #{index + 1}</h4>
                    <div >
                      <Button
                        onClick={() => setEditingQuestion(question)}
                        variant="outline"
                        size="sm"
                        
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
                        
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <div >
                    <div>
                      <p >Question:</p>
                      <p >{question.question}</p>
                    </div>
                    <div>
                      <p >Choices:</p>
                      <ul >
                        {question.choices.map((choice, choiceIndex) => (
                          <li key={choiceIndex} >
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
                  
                >
                  ➕ Add Custom Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div >
          <Button
            onClick={handleSave}
            disabled={isSaving}
            
          >
            {isSaving ? "Saving..." : "💾 Save Configuration"}
          </Button>
          {/* Host Panel Button - Hidden/Disabled
          <Button
            onClick={() => window.open(`/host-panel/${hauntId}`, '_blank')}
            variant="outline"
            
          >
            👑 Open Host Panel
          </Button>
          */}
          <Button
            onClick={() => window.location.href = `/?haunt=${hauntId}`}
            variant="outline"
            
          >
            🎮 Back to Game
          </Button>
        </div>
        
      {/* Custom Question Edit Modal */}
      {editingQuestion && (
        <div >
          <Card >
            <CardHeader>
              <CardTitle >
                {editingQuestion.question ? "Edit Question" : "Add New Question"}
              </CardTitle>
            </CardHeader>
            <CardContent >
              <div>
                <Label >Question *</Label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, question: e.target.value} : null)}
                  placeholder="Enter your trivia question..."
                  
                />
              </div>
              
              <div >
                <Label >Answer Choices *</Label>
                {editingQuestion.choices.map((choice, index) => (
                  <div key={index} >
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...editingQuestion.choices];
                        newChoices[index] = e.target.value;
                        setEditingQuestion(prev => prev ? {...prev, choices: newChoices} : null);
                      }}
                      placeholder={`Choice ${index + 1}`}
                      
                    />
                    <Checkbox
                      checked={editingQuestion.correct === choice}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditingQuestion(prev => prev ? {...prev, correct: choice} : null);
                        }
                      }}
                      
                    />
                    <Label >Correct</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label >Explanation (Optional)</Label>
                <Textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, explanation: e.target.value} : null)}
                  placeholder="Explain why this is the correct answer (will show after they answer)..."
                  
                  rows={3}
                />
                <p >
                  This explanation will appear after players answer the question to help them learn.
                </p>
              </div>
              
              <div >
                <Button
                  onClick={async () => {
                    if (editingQuestion.question && editingQuestion.choices.every(c => c.trim()) && editingQuestion.correct) {
                      // Calculate updated questions first
                      const isExisting = customQuestions.find(q => q.question === editingQuestion.question);
                      const updatedQuestions = isExisting
                        ? customQuestions.map(q => q.question === editingQuestion.question ? editingQuestion : q)
                        : [...customQuestions, {...editingQuestion, id: `q${Date.now()}`}];
                      
                      // Update state
                      setCustomQuestions(updatedQuestions);
                      
                      // Save to Firebase immediately
                      await saveCustomQuestions(updatedQuestions);
                      
                      setEditingQuestion(null);
                    } else {
                      toast({
                        title: "Missing Information",
                        description: "Please fill in all fields and select a correct answer",
                        variant: "destructive"
                      });
                    }
                  }}
                  
                >
                  Save Question
                </Button>
                <Button
                  onClick={() => setEditingQuestion(null)}
                  variant="outline"
                  
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
        <div >
          <Card >
            <CardHeader>
              <CardTitle >Add New Ad</CardTitle>
            </CardHeader>
            <CardContent >
              <div>
                <Label >Title</Label>
                <Input
                  value={newAdData.title}
                  onChange={(e) => setNewAdData({...newAdData, title: e.target.value})}
                  
                />
              </div>
              <div>
                <Label >Description</Label>
                <Textarea
                  value={newAdData.description}
                  onChange={(e) => setNewAdData({...newAdData, description: e.target.value})}
                  
                />
              </div>
              <div>
                <Label >Link (optional)</Label>
                <Input
                  value={newAdData.link}
                  onChange={(e) => setNewAdData({...newAdData, link: e.target.value})}
                  placeholder="https://example.com or leave blank"
                  
                />
              </div>
              <div>
                <Label >Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewAdData({...newAdData, file: e.target.files?.[0] || null})}
                  
                />
              </div>
              <div >
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
                  
                >
                  Add Ad
                </Button>
                <Button
                  onClick={() => {
                    setNewAdData({ title: '', description: '', link: '', file: null });
                    setShowNewAdForm(false);
                  }}
                  variant="outline"
                  
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            border: '2px solid #4b5563'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>Edit Ad</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Title
              </label>
              <input
                type="text"
                value={editingAd.title || ''}
                onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                value={editingAd.description || ''}
                onChange={(e) => setEditingAd({...editingAd, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Link URL
              </label>
              <input
                type="text"
                value={editingAd.link || ''}
                onChange={(e) => setEditingAd({...editingAd, link: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Replace Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditingAd({...editingAd, newFile: file});
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingAd(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateExistingAd(editingAd.id, {
                    title: editingAd.title,
                    description: editingAd.description,
                    link: editingAd.link,
                    file: editingAd.newFile
                  });
                  setEditingAd(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(to right, #dc2626, #7c2d12)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      </div>
    </div>
  );
}