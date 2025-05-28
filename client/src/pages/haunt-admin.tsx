import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
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
import { firestore, storage, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
        const docRef = doc(firestore, 'haunts', hauntId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast({
            title: "Haunt Not Found",
            description: "This haunt doesn't exist.",
            variant: "destructive"
          });
          setLocation('/');
          return;
        }

        const data = docSnap.data() as HauntConfig;
        
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
      const docRef = doc(firestore, 'haunts', hauntId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as HauntConfig;
        setHauntConfig(data);
      }
    } catch (error) {
      console.error('Failed to load haunt config:', error);
    }
  };

  const loadCustomQuestions = async () => {
    try {
      const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
      const snapshot = await getDocs(questionsRef);
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomTriviaQuestion[];
      setCustomQuestions(questions);
    } catch (error) {
      console.error('Failed to load custom questions:', error);
    }
  };

  const loadUploadedAds = async () => {
    try {
      const adsRef = collection(firestore, 'haunt-ads', hauntId, 'ads');
      const snapshot = await getDocs(adsRef);
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUploadedAds(ads);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
  };

  const loadTriviaPacks = async () => {
    try {
      const packsRef = collection(firestore, 'trivia-packs');
      const snapshot = await getDocs(packsRef);
      const packs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TriviaPack[];
      setTriviaPacks(packs);
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

      // Re-fetch latest Firebase config
      const docRef = doc(firestore, 'haunts', hauntId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as HauntConfig;
        
        // Validate and sanitize config with defaults
        const sanitizedConfig = {
          ...data,
          name: data.name || `Haunt ${hauntId}`,
          description: data.description || 'A mysterious horror experience',
          mode: data.mode || 'individual',
          tier: data.tier || 'basic',
          theme: {
            primaryColor: data.theme?.primaryColor || '#8B0000',
            secondaryColor: data.theme?.secondaryColor || '#2D1B69',
            accentColor: data.theme?.accentColor || '#FF6B35'
          },
          isActive: data.isActive !== false
        };
        
        // Update Firebase with sanitized config
        await updateDoc(docRef, sanitizedConfig);
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
          // Force authentication check and wait for it
          await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
              unsubscribe();
              resolve(user);
            });
          });
          
          const currentUser = auth.currentUser;
          console.log('Current user:', currentUser ? currentUser.uid : 'Not authenticated');
          
          if (!currentUser) {
            // Sign in anonymously if not authenticated
            const { signInAnonymously } = await import('firebase/auth');
            await signInAnonymously(auth);
            console.log('Signed in anonymously for upload');
          }
          
          console.log('Uploading logo for haunt:', hauntId);
          const logoRef = ref(storage, `haunt-assets/${hauntId}/logo.${logoFile.name.split('.').pop()}`);
          console.log('Upload path:', `haunt-assets/${hauntId}/logo.${logoFile.name.split('.').pop()}`);
          
          const uploadResult = await uploadBytes(logoRef, logoFile);
          console.log('Upload successful:', uploadResult);
          
          logoPath = await getDownloadURL(logoRef);
          console.log('Download URL:', logoPath);
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

      const docRef = doc(firestore, 'haunts', hauntId);
      await updateDoc(docRef, updatedConfig);
      
      setHauntConfig(updatedConfig);
      
      // Save custom questions if any exist
      if (customQuestions.length > 0) {
        await saveCustomQuestions(customQuestions);
      }
      
      // Save ads if any exist
      if (adFiles.length > 0 && adFiles.some(ad => ad.file && ad.title && ad.link)) {
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
      // Clear existing questions first
      const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
      const existingQuestions = await getDocs(questionsRef);
      
      // Delete existing questions
      for (const questionDoc of existingQuestions.docs) {
        await deleteDoc(questionDoc.ref);
      }
      
      // Add new questions
      for (const question of questions) {
        await addDoc(questionsRef, {
          question: question.question,
          choices: question.choices,
          correct: question.correct,
          timestamp: new Date().toISOString()
        });
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
      // Clear existing ads first
      const adsRef = collection(firestore, 'haunt-ads', hauntId, 'ads');
      const existingAds = await getDocs(adsRef);
      
      // Delete existing ads
      for (const adDoc of existingAds.docs) {
        await deleteDoc(adDoc.ref);
      }
      
      // Upload and save new ads
      for (const ad of adFiles) {
        if (ad.file && ad.title && ad.link) {
          try {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `haunt-assets/${hauntId}/ads/${ad.id}.${ad.file.name.split('.').pop()}`);
            await uploadBytes(imageRef, ad.file);
            const imageUrl = await getDownloadURL(imageRef);
            
            // Save ad data to Firestore
            await addDoc(adsRef, {
              title: ad.title,
              description: ad.description,
              link: ad.link,
              imageUrl: imageUrl,
              timestamp: new Date().toISOString()
            });
          } catch (uploadError) {
            console.error(`Failed to upload ad ${ad.title}:`, uploadError);
            toast({
              title: "Ad Upload Failed",
              description: `Failed to upload ad "${ad.title}". Please try again.`,
              variant: "destructive"
            });
            return;
          }
        }
      }
      
      toast({
        title: "Ads Saved",
        description: `${adFiles.length} ads saved successfully`,
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
                    const docRef = doc(firestore, 'haunts', hauntId);
                    await updateDoc(docRef, { authCode: newAccessCode });
                    
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
                  <Select value={formData.mode} onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-11">
                      <SelectValue placeholder="Select game mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="individual" className="text-white hover:bg-gray-700">
                        Individual Mode - Players compete individually
                      </SelectItem>
                      <SelectItem value="queue" className="text-white hover:bg-gray-700">
                        Group Mode - Host-controlled synchronized sessions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-gray-400 text-xs mt-1">
                    Current: <span className="text-white font-medium capitalize">{hauntConfig.mode}</span> mode
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
                <div className="mt-3 flex gap-4">
                  <Link 
                    href="/upload-guidelines" 
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Review our Upload Guidelines
                  </Link>
                  <a 
                    href="/trivia-template.json"
                    download="trivia-template.json"
                    className="inline-flex items-center gap-1 text-sm text-green-400 hover:text-green-300 underline"
                  >
                    📥 Download Trivia Template
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    correct: ""
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
      </div>
      
      <Footer />
    </div>
  );
}