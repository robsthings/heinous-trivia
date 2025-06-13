import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { firestore, auth, storage } from "@/lib/firebase";
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy, Upload, Palette } from "lucide-react";
import type { HauntConfig, TriviaQuestion } from "@shared/schema";

interface TriviaPack {
  id?: string;
  name: string;
  description: string;
  questions: TriviaQuestion[];
  accessType: 'all' | 'tier' | 'select';
  allowedTiers?: string[];
  allowedHaunts?: string[];
}

export default function Admin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allHaunts, setAllHaunts] = useState<HauntConfig[]>([]);
  const [editingHaunt, setEditingHaunt] = useState<HauntConfig | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    logoPath: "",
    triviaFile: "",
    adFile: "",
    tier: "basic",
    primaryColor: "#8B0000",
    secondaryColor: "#2D1B69",
    accentColor: "#FF6B35"
  });

  // Custom Branding state
  const [customSkins, setCustomSkins] = useState<Array<{id: string, name: string, url: string}>>([]);
  const [customProgressBars, setCustomProgressBars] = useState<Array<{id: string, name: string, url: string}>>([]);
  const [selectedHauntForBranding, setSelectedHauntForBranding] = useState("");
  const [brandingFiles, setBrandingFiles] = useState({
    skin: null as File | null,
    progressBar: null as File | null
  });

  // Trivia Pack state
  const [packFormData, setPackFormData] = useState({
    name: "",
    description: "",
    questionsJson: "",
    accessType: "all" as 'all' | 'tier' | 'select',
    allowedTiers: [] as string[],
    allowedHaunts: [] as string[]
  });
  const [existingPacks, setExistingPacks] = useState<TriviaPack[]>([]);

  // Default Ads state
  const [defaultAds, setDefaultAds] = useState<any[]>([]);
  const [defaultAdFiles, setDefaultAdFiles] = useState<Array<{
    file: File | null;
    link: string;
    id: string;
    title: string;
    description: string;
  }>>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackInputChange = (field: string, value: string | string[]) => {
    setPackFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load all haunts and trivia packs on component mount
  useEffect(() => {
    loadAllHaunts();
    loadExistingPacks();
    loadDefaultAds();
  }, []);

  const loadAllHaunts = async () => {
    try {
      // Authenticate before loading data
      if (!auth.currentUser) {
        console.log('Attempting anonymous authentication...');
        await signInAnonymously(auth);
        console.log('Authentication successful:', auth.currentUser);
      }
      
      console.log('Loading haunts with user:', auth.currentUser?.uid);
      const hauntsRef = collection(firestore, 'haunts');
      const snapshot = await getDocs(hauntsRef);
      const haunts: HauntConfig[] = [];
      
      snapshot.forEach((doc) => {
        haunts.push({ ...doc.data(), id: doc.id } as HauntConfig);
      });
      
      setAllHaunts(haunts.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load haunts:', error);
      toast({
        title: "Error",
        description: "Failed to load haunts list",
        variant: "destructive"
      });
    }
  };

  const loadExistingPacks = async () => {
    try {
      // Authenticate before loading data
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      const packsRef = collection(firestore, 'trivia-packs');
      const snapshot = await getDocs(packsRef);
      const packs: TriviaPack[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        packs.push({
          id: doc.id,
          name: data.name || 'Unnamed Pack',
          description: data.description || '',
          questions: data.questions || [],
          accessType: data.accessType || 'all',
          allowedTiers: data.allowedTiers || [],
          allowedHaunts: data.allowedHaunts || []
        });
      });
      
      setExistingPacks(packs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load trivia packs:', error);
      toast({
        title: "Error",
        description: "Failed to load trivia packs",
        variant: "destructive"
      });
    }
  };

  const updateHauntSubscription = async (hauntId: string, updates: Partial<HauntConfig>) => {
    try {
      const hauntRef = doc(firestore, 'haunts', hauntId);
      await updateDoc(hauntRef, updates);
      
      // Update local state
      setAllHaunts(prev => 
        prev.map(haunt => 
          haunt.id === hauntId ? { ...haunt, ...updates } : haunt
        )
      );

      toast({
        title: "Updated",
        description: "Haunt subscription updated successfully",
      });
    } catch (error) {
      console.error('Failed to update haunt:', error);
      toast({
        title: "Error",
        description: "Failed to update haunt subscription",
        variant: "destructive"
      });
    }
  };

  const resetHauntPassword = async (hauntId: string, hauntName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to reset the access code for "${hauntName}"?\n\nThis will:\n- Remove their current access code\n- Force them to set up a new one\n- Log them out of their admin panel\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const hauntRef = doc(firestore, 'haunts', hauntId);
      await updateDoc(hauntRef, { 
        authCode: null,
        authCodeResetAt: new Date().toISOString(),
        authCodeResetBy: 'uber-admin'
      });

      toast({
        title: "Access Code Reset",
        description: `The access code for "${hauntName}" has been reset. They will need to set up a new code when they next visit their admin panel.`,
      });
    } catch (error) {
      console.error('Failed to reset access code:', error);
      toast({
        title: "Error",
        description: "Failed to reset access code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteHaunt = async (hauntId: string, hauntName: string) => {
    const confirmed = window.confirm(
      `🚨 DANGER: Delete "${hauntName}" permanently?\n\nThis will:\n- Delete the haunt configuration\n- Delete all custom questions\n- Delete all uploaded ads\n- Delete all leaderboard data\n- Make the game URL unusable\n\nThis action CANNOT BE UNDONE!\n\nType "DELETE" to confirm this permanent deletion.`
    );
    
    if (!confirmed) return;

    const doubleConfirm = prompt(`To permanently delete "${hauntName}", type DELETE in all caps:`);
    if (doubleConfirm !== "DELETE") {
      toast({
        title: "Deletion Cancelled",
        description: "Haunt was not deleted.",
      });
      return;
    }

    try {
      // Delete haunt document
      const hauntRef = doc(firestore, 'haunts', hauntId);
      await deleteDoc(hauntRef);

      // Delete custom questions
      try {
        const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        const deletePromises = questionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('No custom questions to delete');
      }

      // Delete ads
      try {
        const adsRef = collection(firestore, 'haunt-ads', hauntId, 'ads');
        const adsSnapshot = await getDocs(adsRef);
        const deletePromises = adsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('No ads to delete');
      }

      // Update local state
      setAllHaunts(prev => prev.filter(haunt => haunt.id !== hauntId));
      
      // Clear editing state if this haunt was being edited
      if (editingHaunt?.id === hauntId) {
        setEditingHaunt(null);
      }

      toast({
        title: "Haunt Deleted",
        description: `"${hauntName}" has been permanently deleted.`,
      });
    } catch (error) {
      console.error('Failed to delete haunt:', error);
      toast({
        title: "Error",
        description: "Failed to delete haunt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${description} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Crown className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'premium': return <Gem className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-bronze-100 text-bronze-800 border-bronze-300';
      case 'pro': return 'bg-silver-100 text-silver-800 border-silver-300';
      case 'premium': return 'bg-gold-100 text-gold-800 border-gold-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const loadTriviaPacks = async () => {
    try {
      const packsRef = collection(firestore, 'trivia-packs');
      const querySnapshot = await getDocs(packsRef);
      
      const packs: TriviaPack[] = [];
      querySnapshot.forEach((doc) => {
        packs.push({ id: doc.id, ...doc.data() } as TriviaPack);
      });
      
      setExistingPacks(packs);
    } catch (error) {
      console.error('Failed to load trivia packs:', error);
    }
  };

  const loadDefaultAds = async () => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      const adsRef = collection(firestore, 'default-ads');
      const querySnapshot = await getDocs(adsRef);
      
      const ads: any[] = [];
      querySnapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() });
      });
      
      setDefaultAds(ads);
    } catch (error) {
      console.error('Failed to load default ads:', error);
    }
  };

  const saveDefaultAds = async () => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      // Clear existing default ads
      const adsRef = collection(firestore, 'default-ads');
      const existingAds = await getDocs(adsRef);
      
      for (const adDoc of existingAds.docs) {
        await deleteDoc(adDoc.ref);
      }
      
      // Upload and save new default ads
      let savedAdsCount = 0;
      for (const ad of defaultAdFiles) {
        if (ad.file) {
          try {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `default-ads/${ad.id}.${ad.file.name.split('.').pop()}`);
            await uploadBytes(imageRef, ad.file);
            const imageUrl = await getDownloadURL(imageRef);
            
            // Save ad data to Firestore
            await addDoc(adsRef, {
              title: ad.title || "Default Ad",
              description: ad.description || "Discover more!",
              link: ad.link || "#",
              imageUrl: imageUrl,
              timestamp: new Date().toISOString()
            });
            savedAdsCount++;
          } catch (error) {
            console.error('Failed to upload default ad:', error);
          }
        }
      }
      
      toast({
        title: "Success!",
        description: `${savedAdsCount} default ads saved successfully`,
      });
      
      // Refresh the ads list
      loadDefaultAds();
      setDefaultAdFiles([]);
    } catch (error) {
      console.error('Failed to save default ads:', error);
      toast({
        title: "Error",
        description: "Failed to save default ads",
        variant: "destructive"
      });
    }
  };

  // CSV Upload Handler for Trivia Packs
  const handlePackCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const questions: any[] = [];

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

        // Map CSV columns to trivia question format
        const question = {
          id: `csv-${Date.now()}-${i}`,
          text: questionData.question || '',
          category: questionData.category || 'General',
          difficulty: parseInt(questionData.difficulty) || 1,
          answers: [
            questionData.choice1 || '',
            questionData.choice2 || '',
            questionData.choice3 || '',
            questionData.choice4 || ''
          ],
          correctAnswer: (parseInt(questionData.correct_answer) - 1) || 0, // Convert 1-4 to 0-3
          explanation: questionData.explanation || '',
          points: 100
        };

        // Validate question has required data
        if (question.text && question.answers.every(a => a.trim())) {
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

      // Update the JSON field with the parsed questions
      setPackFormData(prev => ({
        ...prev,
        questionsJson: JSON.stringify(questions, null, 2)
      }));

      const skippedCount = (lines.length - 1) - questions.length;
      toast({
        title: "Upload Complete!",
        description: skippedCount > 0 
          ? `Imported ${questions.length} questions. Skipped ${skippedCount} rows (empty or invalid data).`
          : `Successfully imported ${questions.length} questions from your spreadsheet!`,
      });

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

  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packFormData.name || !packFormData.questionsJson) {
      toast({
        title: "Error",
        description: "Pack name and questions are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse questions JSON
      const questions = JSON.parse(packFormData.questionsJson);
      
      const triviaPack: TriviaPack = {
        name: packFormData.name,
        description: packFormData.description,
        questions: questions,
        accessType: packFormData.accessType,
        allowedTiers: packFormData.allowedTiers,
        allowedHaunts: packFormData.allowedHaunts
      };

      // Use pack name as document ID for special packs like "starter-pack"
      let docRef;
      if (triviaPack.name === "starter-pack") {
        docRef = doc(firestore, 'trivia-packs', 'starter-pack');
        await setDoc(docRef, triviaPack);
      } else {
        docRef = await addDoc(collection(firestore, 'trivia-packs'), triviaPack);
      }
      
      toast({
        title: "Success!",
        description: `Trivia pack "${packFormData.name}" created successfully`,
      });

      // Reset form
      setPackFormData({
        name: "",
        description: "",
        questionsJson: "",
        accessType: "all",
        allowedTiers: [],
        allowedHaunts: []
      });

      loadTriviaPacks();
    } catch (error) {
      console.error('Failed to create trivia pack:', error);
      toast({
        title: "Error",
        description: "Failed to create trivia pack. Please check your JSON format.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name) {
      toast({
        title: "Error",
        description: "Haunt ID and Name are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Authenticate before saving
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      const hauntConfig: HauntConfig = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        logoPath: formData.logoPath || `/haunt-assets/${formData.id}/logo.png`,
        triviaFile: formData.triviaFile || `${formData.id}-trivia.json`,
        adFile: formData.adFile || `${formData.id}-ads.json`,
        mode: "individual", // Default mode, will be managed in haunt dashboard
        tier: formData.tier as "basic" | "pro" | "premium",
        isActive: true,
        isPublished: true, // New haunts are published by default
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor
        }
      };

      // Save to Firebase
      console.log('Attempting to save haunt:', hauntConfig);
      const docRef = doc(firestore, 'haunts', formData.id);
      await setDoc(docRef, hauntConfig);
      
      console.log('Haunt saved successfully!');
      toast({
        title: "Success!",
        description: `Haunt "${formData.name}" saved to Firebase`,
      });
      
      // Reload haunts list to show the new haunt
      await loadAllHaunts();

      // Clear form
      setFormData({
        id: "",
        name: "",
        description: "",
        logoPath: "",
        triviaFile: "",
        adFile: "",
        tier: "basic",
        primaryColor: "#8B0000",
        secondaryColor: "#2D1B69",
        accentColor: "#FF6B35"
      });

    } catch (error) {
      console.error('❌ Failed to save haunt config:', error);
      toast({
        title: "Error",
        description: `Failed to save haunt configuration: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Branding Functions
  const uploadBrandingAsset = async (file: File, type: 'skin' | 'progressBar') => {
    if (!file) return null;

    try {
      setIsLoading(true);
      
      // Upload directly to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      const timestamp = Date.now();
      const filename = `${type}-${timestamp}.${file.name.split('.').pop()}`;
      const storagePath = `branding/${type}s/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload file to Firebase Storage
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Add to local state for immediate UI update
      const assetData = {
        id: `${type}-${timestamp}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: downloadURL
      };

      if (type === 'skin') {
        setCustomSkins(prev => [...prev, assetData]);
      } else {
        setCustomProgressBars(prev => [...prev, assetData]);
      }

      toast({
        title: "Upload Successful",
        description: `${type === 'skin' ? 'Background skin' : 'Progress bar'} uploaded successfully`,
      });

      return downloadURL;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload asset. Please check Firebase Storage configuration.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const assignBrandingToHaunt = async (hauntId: string, skinUrl?: string, progressBarUrl?: string) => {
    if (!hauntId) return;

    try {
      setIsLoading(true);

      const updates: any = {};
      if (skinUrl !== undefined) updates.skinUrl = skinUrl;
      if (progressBarUrl !== undefined) updates.progressBarUrl = progressBarUrl;

      const response = await fetch(`/api/haunt/${hauntId}/branding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update branding');
      }

      // Update local haunt data
      setAllHaunts(prev => prev.map(haunt => 
        haunt.id === hauntId 
          ? { ...haunt, ...updates }
          : haunt
      ));

      const hauntName = allHaunts.find(h => h.id === hauntId)?.name || hauntId;
      
      toast({
        title: `Custom branding uploaded for ${hauntName}`,
        description: `${skinUrl ? 'Background skin' : ''}${skinUrl && progressBarUrl ? ' and ' : ''}${progressBarUrl ? 'progress bar animation' : ''} applied successfully`,
      });

    } catch (error) {
      console.error('Failed to assign branding:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign branding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeBrandingFromHaunt = async (hauntId: string) => {
    if (!hauntId) return;

    const confirmed = window.confirm(
      "Remove all custom branding from this haunt? This will revert to default themes."
    );
    
    if (!confirmed) return;

    await assignBrandingToHaunt(hauntId, "", "");
  };

  const getProPremiumHaunts = () => {
    return allHaunts.filter(haunt => haunt.tier === 'pro' || haunt.tier === 'premium');
  };

  const loadBrandingAssets = async () => {
    try {
      const response = await fetch('/api/branding/assets', {
        headers: {
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load branding assets');
      }

      const assets = await response.json();
      setCustomSkins(assets.skins);
      setCustomProgressBars(assets.progressBars);
      
    } catch (error) {
      console.error('Failed to load branding assets:', error);
      // Don't show error toast as this is not critical for page load
    }
  };

  useEffect(() => {
    loadBrandingAssets();
  }, []);

  const handleResetPassword = async (hauntId: string, hauntName: string) => {
    const newPassword = prompt(`Enter new password for "${hauntName}":`);
    
    if (!newPassword) {
      return; // User cancelled
    }

    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Make API call to reset password
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: JSON.stringify({
          hauntId,
          newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }

      const result = await response.json();
      
      toast({
        title: "Password Reset Successful",
        description: `Password for "${hauntName}" has been updated successfully`,
      });

    } catch (error) {
      console.error('Password reset failed:', error);
      toast({
        title: "Password Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show authentication status prominently
  const [authStatus, setAuthStatus] = useState('checking');
  
  useEffect(() => {
    const checkAuth = () => {
      if (auth.currentUser) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('not-authenticated');
      }
    };
    
    checkAuth();
    const unsubscribe = auth.onAuthStateChanged(checkAuth);
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Authentication Status Card */}
        <Card className="bg-yellow-900/80 border-yellow-600 text-white mb-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🔐 Authentication Status</h3>
              <p className="mb-4">Status: {authStatus === 'authenticated' ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
              <p className="text-sm mb-4">User: {auth.currentUser?.uid || 'None'}</p>
              
              <Button 
                onClick={async () => {
                  try {
                    console.log('Manual authentication attempt...');
                    await signInAnonymously(auth);
                    console.log('Authentication successful!', auth.currentUser);
                    toast({
                      title: "Success!",
                      description: "Authentication successful",
                    });
                    setAuthStatus('authenticated');
                    // Reload data after successful auth
                    loadAllHaunts();
                    loadExistingPacks();
                  } catch (error) {
                    console.error('Authentication failed:', error);
                    toast({
                      title: "Authentication Failed",
                      description: error instanceof Error ? error.message : String(error),
                      variant: "destructive"
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                disabled={authStatus === 'authenticated'}
              >
                {authStatus === 'authenticated' ? '✅ Already Signed In' : '🔐 Sign In to Firebase'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-red-500">
              🎃 Heinous Trivia Uber Admin
            </CardTitle>
            <p className="text-center text-gray-300">Manage Haunts & Trivia Packs</p>
            <div className="text-center mt-4">
              <Button 
                onClick={async () => {
                  try {
                    console.log('Manual authentication attempt...');
                    await signInAnonymously(auth);
                    console.log('Authentication successful!', auth.currentUser);
                    toast({
                      title: "Success!",
                      description: "Authentication successful",
                    });
                    // Reload data after successful auth
                    loadAllHaunts();
                    loadExistingPacks();
                  } catch (error) {
                    console.error('Authentication failed:', error);
                    toast({
                      title: "Authentication Failed",
                      description: error instanceof Error ? error.message : String(error),
                      variant: "destructive"
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                🔐 Sign In to Firebase
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Current user: {auth.currentUser ? auth.currentUser.uid : 'Not authenticated'}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="management" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-gray-800">
                <TabsTrigger value="management" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  Management
                </TabsTrigger>
                <TabsTrigger value="haunts" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🏚️ Haunts
                </TabsTrigger>
                <TabsTrigger value="packs" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🧠 Packs
                </TabsTrigger>
                <TabsTrigger value="assignments" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🎯 Assignments
                </TabsTrigger>
                <TabsTrigger value="default-ads" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  📢 Default Ads
                </TabsTrigger>
                <TabsTrigger value="branding" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🎨 Branding
                </TabsTrigger>
              </TabsList>

              {/* Haunt Management Tab */}
              <TabsContent value="management" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🏚️ All Participating Haunts
                      <Badge variant="outline" className="text-gray-300">
                        {allHaunts.length} haunts
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-400">Manage subscription levels and access for all haunts</p>
                  </CardHeader>
                  <CardContent>
                    {allHaunts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No haunts found. Create your first haunt below!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allHaunts.map((haunt) => (
                          <div key={haunt.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              
                              {/* Haunt Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-white font-bold text-lg">{haunt.name}</h3>
                                  <Badge className={`flex items-center gap-1 ${getTierColor(haunt.tier)}`}>
                                    {getTierIcon(haunt.tier)}
                                    {haunt.tier?.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">{haunt.description || 'No description'}</p>
                                
                                {/* Quick Links */}
                                <div className="space-y-2">
                                  {/* Game Link */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-1"
                                      onClick={() => window.open(`${window.location.origin}/?haunt=${haunt.id}`, '_blank')}
                                    >
                                      <GamepadIcon className="h-3 w-3 mr-1" />
                                      Game: /?haunt={haunt.id}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600 hover:text-white"
                                      onClick={() => copyToClipboard(`${window.location.origin}/?haunt=${haunt.id}`, "Game URL")}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Admin Link */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white flex-1"
                                      onClick={() => window.open(`${window.location.origin}/haunt-admin/${haunt.id}`, '_blank')}
                                    >
                                      <Settings className="h-3 w-3 mr-1" />
                                      Admin: /haunt-admin/{haunt.id}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-purple-400 hover:bg-purple-600 hover:text-white"
                                      onClick={() => copyToClipboard(`${window.location.origin}/haunt-admin/${haunt.id}`, "Admin URL")}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Host Panel Link */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs border-green-600 text-green-400 hover:bg-green-600 hover:text-white flex-1"
                                      onClick={() => window.open(`${window.location.origin}/host-panel/${haunt.id}`, '_blank')}
                                    >
                                      <Crown className="h-3 w-3 mr-1" />
                                      Host Panel: /host-panel/{haunt.id}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-green-400 hover:bg-green-600 hover:text-white"
                                      onClick={() => copyToClipboard(`${window.location.origin}/host-panel/${haunt.id}`, "Host Panel URL")}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Reset Password */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white flex-1"
                                      onClick={() => handleResetPassword(haunt.id, haunt.name)}
                                    >
                                      🔑 Reset Password
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription Controls */}
                              <div className="flex flex-col gap-3 lg:w-64">
                                
                                {/* Active Toggle */}
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                  <Label className="text-white text-sm">Active</Label>
                                  <Switch
                                    checked={haunt.isActive !== false}
                                    onCheckedChange={(checked) => 
                                      updateHauntSubscription(haunt.id, { isActive: checked })
                                    }
                                  />
                                </div>

                                {/* Published Toggle */}
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                  <Label className="text-white text-sm">Published</Label>
                                  <Switch
                                    checked={haunt.isPublished !== false}
                                    onCheckedChange={(checked) => 
                                      updateHauntSubscription(haunt.id, { isPublished: checked })
                                    }
                                  />
                                </div>

                                {/* Tier Selection */}
                                <div className="space-y-1">
                                  <Label className="text-white text-sm">Subscription Tier</Label>
                                  <Select 
                                    value={haunt.tier} 
                                    onValueChange={(value) => 
                                      updateHauntSubscription(haunt.id, { tier: value as 'basic' | 'pro' | 'premium' })
                                    }
                                  >
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="basic">
                                        <div className="flex items-center gap-2">
                                          <Crown className="h-4 w-4" />
                                          Basic (5 questions, 3 ads)
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="pro">
                                        <div className="flex items-center gap-2">
                                          <Zap className="h-4 w-4" />
                                          Pro (15 questions, 5 ads)
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="premium">
                                        <div className="flex items-center gap-2">
                                          <Gem className="h-4 w-4" />
                                          Premium (50 questions, 10 ads)
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Game Mode - Display Only */}
                                <div className="bg-gray-700/30 p-2 rounded">
                                  <Label className="text-white text-sm">Game Mode</Label>
                                  <p className="text-gray-300 text-sm mt-1">
                                    {haunt.mode === 'queue' ? 'Group Mode' : 'Individual Play'}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    Controlled by haunt owner
                                  </p>
                                </div>

                                {/* Admin Actions */}
                                <div className="space-y-2">
                                  <Button
                                    onClick={() => {
                                      setEditingHaunt(haunt);
                                      setFormData({
                                        id: haunt.id,
                                        name: haunt.name,
                                        description: haunt.description || "",
                                        logoPath: haunt.logoPath || "",
                                        triviaFile: haunt.triviaFile || "",
                                        adFile: haunt.adFile || "",
                                        tier: haunt.tier,
                                        primaryColor: haunt.theme?.primaryColor || "#8B0000",
                                        secondaryColor: haunt.theme?.secondaryColor || "#2D1B69",
                                        accentColor: haunt.theme?.accentColor || "#FF6B35"
                                      });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                                  >
                                    ✏️ Edit Profile
                                  </Button>
                                  
                                  <Button
                                    onClick={() => deleteHaunt(haunt.id, haunt.name)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                  >
                                    🗑️ Delete Haunt
                                  </Button>
                                  
                                  <Button
                                    onClick={() => resetHauntPassword(haunt.id, haunt.name)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                  >
                                    🔑 Reset Access Code
                                  </Button>
                                </div>

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Edit Haunt Profile Section */}
                {editingHaunt && (
                  <Card className="bg-gray-900/50 border-orange-600 shadow-lg mt-6">
                    <CardHeader>
                      <CardTitle className="text-orange-400 flex items-center gap-2">
                        ✏️ Edit Haunt Profile: {editingHaunt.name}
                      </CardTitle>
                      <p className="text-gray-300 text-sm">
                        Update haunt details, theme colors, and configuration settings.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-white font-medium">Basic Information</h3>
                          
                          <div>
                            <Label htmlFor="edit-name" className="text-white">Haunt Name</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-gray-800 border-gray-600 text-white"
                              placeholder="Enter haunt name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-description" className="text-white">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-gray-800 border-gray-600 text-white"
                              placeholder="Brief description of the haunt"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-tier" className="text-white">Subscription Tier</Label>
                            <Select value={formData.tier} onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic (5 questions, 3 ads)</SelectItem>
                                <SelectItem value="pro">Pro (15 questions, 5 ads)</SelectItem>
                                <SelectItem value="premium">Premium (50 questions, 10 ads)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>


                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
                        <Button
                          onClick={async () => {
                            if (!editingHaunt) return;

                            setIsLoading(true);
                            try {
                              const updatedHaunt: Partial<HauntConfig> = {
                                name: formData.name,
                                description: formData.description,
                                tier: formData.tier as "basic" | "pro" | "premium"
                              };

                              const hauntRef = doc(firestore, 'haunts', editingHaunt.id);
                              await updateDoc(hauntRef, updatedHaunt);

                              // Update local state
                              setAllHaunts(prev => 
                                prev.map(haunt => 
                                  haunt.id === editingHaunt.id ? { ...haunt, ...updatedHaunt } : haunt
                                )
                              );

                              setEditingHaunt(null);
                              toast({
                                title: "Success!",
                                description: "Haunt profile updated successfully",
                              });
                            } catch (error) {
                              console.error('Failed to update haunt profile:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update haunt profile",
                                variant: "destructive"
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading || !formData.name}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {isLoading ? "Saving..." : "💾 Save Changes"}
                        </Button>

                        <Button
                          onClick={() => setEditingHaunt(null)}
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="haunts" className="mt-6">
                <h3 className="text-xl font-bold text-red-400 mb-4">Add New Haunt</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id" className="text-white">Haunt ID *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    placeholder="e.g., mansionofmadness"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-white">Haunt Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Mansion of Madness"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A chilling description of this haunted location..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="logoPath" className="text-white">Logo Path</Label>
                  <Input
                    id="logoPath"
                    value={formData.logoPath}
                    onChange={(e) => handleInputChange('logoPath', e.target.value)}
                    placeholder={`/haunt-assets/${formData.id || 'hauntid'}/logo.png`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triviaFile" className="text-white">Trivia File</Label>
                  <Input
                    id="triviaFile"
                    value={formData.triviaFile}
                    onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-trivia.json`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="adFile" className="text-white">Ad File</Label>
                  <Input
                    id="adFile"
                    value={formData.adFile}
                    onChange={(e) => handleInputChange('adFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-ads.json`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="tier" className="text-white">Subscription Tier</Label>
                  <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select subscription tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="basic" className="text-white hover:bg-gray-700">Basic</SelectItem>
                      <SelectItem value="pro" className="text-white hover:bg-gray-700">Pro</SelectItem>
                      <SelectItem value="premium" className="text-white hover:bg-gray-700">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>



              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
              >
                {isLoading ? "Saving to Firebase..." : "💾 Save Haunt Configuration"}
              </Button>
            </form>
              </TabsContent>

              <TabsContent value="packs" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Create Trivia Pack</h3>
                  
                  <form onSubmit={handlePackSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packName" className="text-white">Pack Name *</Label>
                        <Input
                          id="packName"
                          value={packFormData.name}
                          onChange={(e) => handlePackInputChange('name', e.target.value)}
                          placeholder="e.g., Horror Movie Classics"
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="packDescription" className="text-white">Description</Label>
                        <Input
                          id="packDescription"
                          value={packFormData.description}
                          onChange={(e) => handlePackInputChange('description', e.target.value)}
                          placeholder="Pack description"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Questions *</Label>
                      
                      {/* CSV Upload Option */}
                      <div className="space-y-4">
                        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            📊 Upload CSV Spreadsheet
                          </h4>
                          <p className="text-gray-400 text-sm mb-3">
                            Upload a CSV file with your trivia questions. Much easier than JSON!
                          </p>
                          
                          <div className="space-y-3">
                            <Input
                              type="file"
                              accept=".csv"
                              onChange={handlePackCSVUpload}
                              className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-none file:rounded file:px-3 file:py-1"
                            />
                            
                            <div className="text-xs text-gray-400 bg-gray-900/50 p-3 rounded">
                              <p className="font-medium text-white mb-1">CSV Format Required:</p>
                              <p>Columns: question, choice1, choice2, choice3, choice4, correct_answer, explanation, category, difficulty</p>
                              <p className="mt-1">• correct_answer should be 1, 2, 3, or 4 (matching choice1-4)</p>
                              <p>• difficulty should be 1-5 (1=easy, 5=expert)</p>
                              <a 
                                href="data:text/csv;charset=utf-8,question,choice1,choice2,choice3,choice4,correct_answer,explanation,category,difficulty%0A'What year was the movie Psycho released?','1958','1960','1962','1964',2,'Psycho was released in 1960 by Alfred Hitchcock','Horror Movies',2"
                                download="trivia-pack-template.csv"
                                className="inline-block mt-2 text-blue-400 hover:text-blue-300 underline"
                              >
                                📥 Download CSV Template
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Manual JSON Option */}
                        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                          <h4 className="text-white font-medium mb-3">Or Enter JSON Manually</h4>
                          <Textarea
                            id="questionsJson"
                            value={packFormData.questionsJson}
                            onChange={(e) => handlePackInputChange('questionsJson', e.target.value)}
                            placeholder='[{"id": "q1", "text": "Question?", "category": "Horror", "difficulty": 1, "answers": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Because...", "points": 100}]'
                            className="bg-gray-800 border-gray-600 text-white min-h-32"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Access Control</Label>
                      <Select value={packFormData.accessType} onValueChange={(value: 'all' | 'tier' | 'select') => handlePackInputChange('accessType', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="all">All Haunts</SelectItem>
                          <SelectItem value="tier">By Tier</SelectItem>
                          <SelectItem value="select">Select Haunts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {packFormData.accessType === 'tier' && (
                      <div>
                        <Label className="text-white">Allowed Tiers</Label>
                        <div className="flex gap-4 mt-2">
                          {['basic', 'pro', 'premium'].map(tier => (
                            <label key={tier} className="flex items-center gap-2 text-white">
                              <Checkbox
                                checked={packFormData.allowedTiers.includes(tier)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handlePackInputChange('allowedTiers', [...packFormData.allowedTiers, tier]);
                                  } else {
                                    handlePackInputChange('allowedTiers', packFormData.allowedTiers.filter(t => t !== tier));
                                  }
                                }}
                              />
                              {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {packFormData.accessType === 'select' && (
                      <div>
                        <Label htmlFor="allowedHaunts" className="text-white">Allowed Haunt IDs (comma-separated)</Label>
                        <Input
                          id="allowedHaunts"
                          value={packFormData.allowedHaunts.join(', ')}
                          onChange={(e) => handlePackInputChange('allowedHaunts', e.target.value.split(',').map(h => h.trim()))}
                          placeholder="widowshollow, mansionofmadness"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? "Creating Pack..." : "Create Trivia Pack"}
                    </Button>
                  </form>

                  {existingPacks.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-red-400 mb-4">Existing Trivia Packs</h4>
                      <div className="space-y-3">
                        {existingPacks.map((pack) => (
                          <Card key={pack.id} className="bg-gray-800 border-gray-600">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-bold text-white">{pack.name}</h5>
                                  <p className="text-gray-300 text-sm">{pack.description}</p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {pack.questions.length} questions • Access: {pack.accessType}
                                    {pack.accessType === 'tier' && pack.allowedTiers?.length && (
                                      <span> • Tiers: {pack.allowedTiers.join(', ')}</span>
                                    )}
                                    {pack.accessType === 'select' && pack.allowedHaunts?.length && (
                                      <span> • Haunts: {pack.allowedHaunts.length}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setPackFormData({
                                        name: pack.name,
                                        description: pack.description || "",
                                        questionsJson: JSON.stringify(pack.questions, null, 2),
                                        accessType: pack.accessType,
                                        allowedTiers: pack.allowedTiers || [],
                                        allowedHaunts: pack.allowedHaunts || []
                                      });
                                      // Scroll to form
                                      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      if (confirm(`Delete "${pack.name}" trivia pack?\n\nThis action cannot be undone and will remove the pack from all haunts.`)) {
                                        try {
                                          const packRef = doc(firestore, 'trivia-packs', pack.id!);
                                          await deleteDoc(packRef);
                                          
                                          // Refresh the list
                                          await loadExistingPacks();
                                          
                                          toast({
                                            title: "Pack Deleted",
                                            description: `"${pack.name}" has been permanently removed`,
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to delete trivia pack",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                  >
                                    🗑️ Delete
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const questionsCount = pack.questions.length;
                                      const accessInfo = pack.accessType === 'all' ? 'All haunts' : 
                                                        pack.accessType === 'tier' ? `Tiers: ${pack.allowedTiers?.join(', ')}` :
                                                        `${pack.allowedHaunts?.length || 0} selected haunts`;
                                      
                                      alert(`Pack: ${pack.name}\nDescription: ${pack.description || 'No description'}\nQuestions: ${questionsCount}\nAccess: ${accessInfo}\n\nClick "Edit" to modify this pack.`);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                  >
                                    👁️ View
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pack Assignments Tab */}
              <TabsContent value="assignments" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      🎯 Trivia Pack Assignments
                    </CardTitle>
                    <p className="text-gray-300 text-sm">
                      View and manage which trivia packs each haunt has access to
                    </p>
                  </CardHeader>
                  <CardContent>
                    {allHaunts.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No haunts found</p>
                    ) : (
                      <div className="space-y-4">
                        {allHaunts.map((haunt) => {
                          // Find packs available to this haunt
                          const availablePacks = existingPacks.filter(pack => {
                            if (pack.accessType === 'all') return true;
                            if (pack.accessType === 'tier' && pack.allowedTiers?.includes(haunt.tier)) return true;
                            if (pack.accessType === 'select' && pack.allowedHaunts?.includes(haunt.id)) return true;
                            return false;
                          });

                          return (
                            <Card key={haunt.id} className="bg-gray-800 border-gray-600">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                      {haunt.name}
                                      <Badge variant="outline" className={
                                        haunt.tier === 'premium' ? 'border-purple-500 text-purple-400' :
                                        haunt.tier === 'pro' ? 'border-blue-500 text-blue-400' :
                                        'border-green-500 text-green-400'
                                      }>
                                        {haunt.tier}
                                      </Badge>
                                      {!haunt.isActive && (
                                        <Badge variant="destructive" className="text-xs">
                                          Inactive
                                        </Badge>
                                      )}
                                    </h4>
                                    <p className="text-gray-400 text-sm">{haunt.description || 'No description'}</p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-300 mb-2">
                                      Available Trivia Packs ({availablePacks.length})
                                    </h5>
                                    {availablePacks.length === 0 ? (
                                      <p className="text-gray-500 text-sm italic">
                                        No trivia packs assigned • Will use starter pack fallback
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {availablePacks.map((pack) => (
                                          <div key={pack.id} className="bg-gray-700/50 p-2 rounded">
                                            <div className="flex justify-between items-center">
                                              <div>
                                                <p className="text-white text-sm font-medium">{pack.name}</p>
                                                <p className="text-gray-400 text-xs">
                                                  {pack.questions.length} questions • 
                                                  {pack.accessType === 'all' ? ' All haunts' :
                                                   pack.accessType === 'tier' ? ` ${pack.allowedTiers?.join(', ')} tier` :
                                                   ' Direct assignment'}
                                                </p>
                                              </div>
                                              <div className="flex gap-1">
                                                <Button
                                                  onClick={() => {
                                                    toast({
                                                      title: `Pack: ${pack.name}`,
                                                      description: `Access: ${pack.accessType} • Questions: ${pack.questions.length} • Assigned via: ${pack.accessType === 'all' ? 'Global access' : pack.accessType === 'tier' ? 'Tier-based access' : 'Direct assignment'}`,
                                                    });
                                                  }}
                                                  variant="ghost"
                                                  size="sm"
                                                  className="text-gray-400 hover:text-white"
                                                >
                                                  👁️
                                                </Button>
                                                <Button
                                                  onClick={async () => {
                                                    const revokeAction = pack.accessType === 'select' ? 
                                                      'Remove from direct assignment' :
                                                      pack.accessType === 'tier' ?
                                                      `Remove "${haunt.tier}" tier from pack access` :
                                                      'Change pack from "All haunts" to selective access';
                                                    
                                                    if (confirm(`Revoke "${pack.name}" from "${haunt.name}"?\n\nAction: ${revokeAction}`)) {
                                                      try {
                                                        const packRef = doc(firestore, 'trivia-packs', pack.id!);
                                                        
                                                        if (pack.accessType === 'select') {
                                                          // Remove from direct assignment
                                                          const updatedHaunts = (pack.allowedHaunts || []).filter(id => id !== haunt.id);
                                                          await updateDoc(packRef, { allowedHaunts: updatedHaunts });
                                                        } else if (pack.accessType === 'tier') {
                                                          // Remove this tier from pack's allowed tiers
                                                          const updatedTiers = (pack.allowedTiers || []).filter(tier => tier !== haunt.tier);
                                                          await updateDoc(packRef, { allowedTiers: updatedTiers });
                                                        } else if (pack.accessType === 'all') {
                                                          // Convert to selective access excluding this haunt
                                                          const allOtherHaunts = allHaunts.filter(h => h.id !== haunt.id).map(h => h.id);
                                                          await updateDoc(packRef, { 
                                                            accessType: 'select',
                                                            allowedHaunts: allOtherHaunts 
                                                          });
                                                        }
                                                        
                                                        // Refresh data
                                                        await loadExistingPacks();
                                                        
                                                        toast({
                                                          title: "Access Revoked",
                                                          description: `Removed "${pack.name}" from ${haunt.name}`,
                                                        });
                                                      } catch (error) {
                                                        toast({
                                                          title: "Error",
                                                          description: "Failed to revoke pack access",
                                                          variant: "destructive"
                                                        });
                                                      }
                                                    }
                                                  }}
                                                  variant="ghost"
                                                  size="sm"
                                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                                >
                                                  🗑️
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-gray-600">
                                    <p className="text-xs text-gray-500">
                                      Tier Limits: {haunt.tier === 'premium' ? '50' : haunt.tier === 'pro' ? '15' : '5'} questions per game •
                                      Custom questions: Managed by haunt owner •
                                      Pack access: Controlled via pack settings
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">💡 Managing Pack Access</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• <strong>All haunts:</strong> Pack appears for every haunt regardless of tier</li>
                        <li>• <strong>Tier access:</strong> Pack available to specific subscription tiers</li>
                        <li>• <strong>Select haunts:</strong> Pack assigned to specific haunts only</li>
                        <li>• <strong>To revoke access:</strong> Edit the pack's access settings in Trivia Packs tab</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Default Ads Tab */}
              <TabsContent value="default-ads" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      📢 Default Ads Management
                      <Badge variant="outline" className="text-gray-300">
                        {defaultAds.length} active
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-400">
                      These ads will show for haunts that haven't uploaded their own ads. Perfect for promoting the game itself or other content.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Current Default Ads */}
                    {defaultAds.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Current Default Ads</h3>
                        <div className="grid gap-4">
                          {defaultAds.map((ad) => (
                            <div key={ad.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                              <div className="flex items-center gap-4">
                                {ad.imageUrl && (
                                  <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 object-cover rounded" />
                                )}
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">{ad.title}</h4>
                                  <p className="text-gray-400 text-sm">{ad.description}</p>
                                  {ad.link && (
                                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs">
                                      {ad.link}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload New Default Ads */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Upload New Default Ads</h3>
                      <p className="text-gray-400 text-sm">
                        These will replace any existing default ads. Great for promoting new features, other haunts, or the game itself.
                      </p>
                      
                      {defaultAdFiles.map((adFile, index) => (
                        <div key={adFile.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white text-sm">Ad Image *</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, file } : ad
                                  ));
                                }}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">Ad Title</Label>
                              <Input
                                value={adFile.title}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, title: e.target.value } : ad
                                  ));
                                }}
                                placeholder="e.g., Play More Horror Trivia!"
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">Description</Label>
                              <Input
                                value={adFile.description}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, description: e.target.value } : ad
                                  ));
                                }}
                                placeholder="e.g., Discover more haunts and challenges!"
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">Link (Optional)</Label>
                              <Input
                                value={adFile.link}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, link: e.target.value } : ad
                                  ));
                                }}
                                placeholder="https://..."
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setDefaultAdFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-400 hover:text-red-300"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setDefaultAdFiles(prev => [...prev, {
                              file: null,
                              link: "",
                              id: `default-ad-${Date.now()}`,
                              title: "",
                              description: ""
                            }]);
                          }}
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          ➕ Add Default Ad
                        </Button>
                        
                        {defaultAdFiles.length > 0 && (
                          <Button
                            onClick={saveDefaultAds}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            💾 Save Default Ads
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">💡 How Default Ads Work</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Default ads only show when a haunt hasn't uploaded their own ads</li>
                        <li>• Perfect for promoting the game, new features, or other haunts</li>
                        <li>• These ads will appear in all games where the haunt owner hasn't added custom ads</li>
                        <li>• You can upload multiple default ads that will rotate randomly</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom Branding Tab - Uber Admin Only */}
              <TabsContent value="branding" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🎨 Custom Branding Management
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      Centrally manage custom background skins and progress bar animations for Pro and Premium haunts. 
                      Upload and assign custom branding assets that will be applied automatically during gameplay.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Background Skins Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Background Skins</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg">
                            <Label className="text-white text-sm font-medium mb-2 block">Upload New Background Skin</Label>
                            <p className="text-gray-400 text-xs mb-3">Recommended: 1920x1080 JPG/PNG, or animated GIF</p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setBrandingFiles(prev => ({ ...prev, skin: file }));
                              }}
                              className="bg-gray-700 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3 file:cursor-pointer"
                            />
                            <Button 
                              className="mt-3 bg-red-600 hover:bg-red-700"
                              onClick={async () => {
                                if (brandingFiles.skin) {
                                  await uploadBrandingAsset(brandingFiles.skin, 'skin');
                                  setBrandingFiles(prev => ({ ...prev, skin: null }));
                                  // Reset file input
                                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                  if (fileInput) fileInput.value = '';
                                }
                              }}
                              disabled={!brandingFiles.skin || isLoading}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isLoading ? "Uploading..." : "Upload Skin"}
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h4 className="text-white font-medium mb-3">Available Skins</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <span className="text-white">Default Horror Theme</span>
                                <Badge variant="secondary">Built-in</Badge>
                              </div>
                              {customSkins.map((skin) => (
                                <div key={skin.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                  <div className="flex items-center gap-3">
                                    <span className="text-white">{skin.name}</span>
                                    <a 
                                      href={skin.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs"
                                    >
                                      Preview
                                    </a>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (selectedHauntForBranding) {
                                        assignBrandingToHaunt(selectedHauntForBranding, skin.url);
                                      } else {
                                        toast({
                                          title: "Select Haunt",
                                          description: "Please select a haunt first in the assignment section below",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    disabled={isLoading}
                                  >
                                    Assign to Haunt
                                  </Button>
                                </div>
                              ))}
                              {customSkins.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">
                                  No custom skins uploaded yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar Animations Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Progress Bar Animations</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg">
                            <Label className="text-white text-sm font-medium mb-2 block">Upload New Progress Bar</Label>
                            <p className="text-gray-400 text-xs mb-3">Recommended: Animated GIF or SVG, 400x20 pixels</p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setBrandingFiles(prev => ({ ...prev, progressBar: file }));
                              }}
                              className="bg-gray-700 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3 file:cursor-pointer"
                            />
                            <Button 
                              className="mt-3 bg-red-600 hover:bg-red-700"
                              onClick={async () => {
                                if (brandingFiles.progressBar) {
                                  await uploadBrandingAsset(brandingFiles.progressBar, 'progressBar');
                                  setBrandingFiles(prev => ({ ...prev, progressBar: null }));
                                  // Reset file input - target the progress bar file input specifically
                                  const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
                                  if (fileInputs[1]) fileInputs[1].value = '';
                                }
                              }}
                              disabled={!brandingFiles.progressBar || isLoading}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isLoading ? "Uploading..." : "Upload Animation"}
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h4 className="text-white font-medium mb-3">Available Animations</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                <div className="flex items-center gap-3">
                                  <span className="text-white">Default Progress Bar</span>
                                  <div className="w-16 h-2 bg-gradient-to-r from-red-600 to-red-400 rounded"></div>
                                </div>
                                <Badge variant="secondary">Built-in</Badge>
                              </div>
                              {customProgressBars.map((progressBar) => (
                                <div key={progressBar.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                                  <div className="flex items-center gap-3">
                                    <span className="text-white">{progressBar.name}</span>
                                    <a 
                                      href={progressBar.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs"
                                    >
                                      Preview
                                    </a>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (selectedHauntForBranding) {
                                        assignBrandingToHaunt(selectedHauntForBranding, undefined, progressBar.url);
                                      } else {
                                        toast({
                                          title: "Select Haunt",
                                          description: "Please select a haunt first in the assignment section below",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    disabled={isLoading}
                                  >
                                    Assign
                                  </Button>
                                </div>
                              ))}
                              {customProgressBars.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">
                                  No custom progress bar animations uploaded yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Haunt Assignment Section */}
                    <div className="p-6 bg-gray-800 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Haunt Assignment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Select Haunt</Label>
                          <Select value={selectedHauntForBranding} onValueChange={setSelectedHauntForBranding}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Choose a Pro/Premium haunt" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {getProPremiumHaunts().map((haunt) => (
                                <SelectItem key={haunt.id} value={haunt.id} className="text-white">
                                  {haunt.name} ({haunt.tier.charAt(0).toUpperCase() + haunt.tier.slice(1)})
                                </SelectItem>
                              ))}
                              {getProPremiumHaunts().length === 0 && (
                                <SelectItem value="none" disabled className="text-gray-400">
                                  No Pro/Premium haunts available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Action</Label>
                          <div className="flex gap-2">
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                if (!selectedHauntForBranding) {
                                  toast({
                                    title: "Select Haunt",
                                    description: "Please select a haunt first",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // This will assign both current custom skin and progress bar if available
                                const selectedSkin = customSkins.length > 0 ? customSkins[0].url : "";
                                const selectedProgressBar = customProgressBars.length > 0 ? customProgressBars[0].url : "";
                                
                                if (!selectedSkin && !selectedProgressBar) {
                                  toast({
                                    title: "No Assets",
                                    description: "Upload custom skins or progress bars first",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                assignBrandingToHaunt(selectedHauntForBranding, selectedSkin, selectedProgressBar);
                              }}
                              disabled={!selectedHauntForBranding || isLoading}
                            >
                              Apply Custom Branding
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                              onClick={() => {
                                if (selectedHauntForBranding) {
                                  removeBrandingFromHaunt(selectedHauntForBranding);
                                }
                              }}
                              disabled={!selectedHauntForBranding || isLoading}
                            >
                              Remove Branding
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Current Branding Status */}
                      {selectedHauntForBranding && (
                        <div className="mt-4 p-4 bg-gray-700 rounded border">
                          <h4 className="text-white font-medium mb-2">Current Branding Status</h4>
                          {(() => {
                            const selectedHaunt = allHaunts.find(h => h.id === selectedHauntForBranding);
                            if (!selectedHaunt) return null;
                            
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-300">Background Skin: </span>
                                  <span className={selectedHaunt.skinUrl ? "text-green-400" : "text-gray-400"}>
                                    {selectedHaunt.skinUrl ? "Custom assigned" : "Default theme"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-300">Progress Bar: </span>
                                  <span className={selectedHaunt.progressBarUrl ? "text-green-400" : "text-gray-400"}>
                                    {selectedHaunt.progressBarUrl ? "Custom assigned" : "Default animation"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-600 rounded">
                        <p className="text-red-300 text-sm">
                          <strong>🔒 UBER ADMIN ONLY:</strong> Custom branding is exclusive to Pro and Premium tier haunts. 
                          Background skins and progress bar animations will automatically apply during gameplay 
                          for enhanced visitor experience and brand reinforcement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => {
              loadTriviaPacks();
              window.location.href = '/';
            }}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          >
            🎮 Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
}