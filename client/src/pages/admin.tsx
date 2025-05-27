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
import { firestore } from "@/lib/firebase";
import { doc, setDoc, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy } from "lucide-react";
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackInputChange = (field: string, value: string | string[]) => {
    setPackFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load all haunts on component mount
  useEffect(() => {
    loadAllHaunts();
  }, []);

  const loadAllHaunts = async () => {
    try {
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

      const docRef = await addDoc(collection(firestore, 'trivia-packs'), triviaPack);
      
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
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor
        }
      };

      console.log('🔥 Saving haunt config to Firebase:', hauntConfig);
      
      // Save to Firebase
      const docRef = doc(firestore, 'haunts', formData.id);
      await setDoc(docRef, hauntConfig);
      
      console.log('✅ Haunt config saved successfully!');
      
      toast({
        title: "Success!",
        description: `Haunt "${formData.name}" saved to Firebase`,
      });

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
        description: "Failed to save haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-red-500">
              🎃 Heinous Trivia Uber Admin
            </CardTitle>
            <p className="text-center text-gray-300">Manage Haunts & Trivia Packs</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="management" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="management" className="text-white data-[state=active]:bg-red-600">
                  Haunt Management
                </TabsTrigger>
                <TabsTrigger value="haunts" className="text-white data-[state=active]:bg-red-600">
                  🏚️ Haunts
                </TabsTrigger>
                <TabsTrigger value="packs" className="text-white data-[state=active]:bg-red-600">
                  🧠 Trivia Packs
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

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

              <div>
                <Label className="text-white mb-4 block">Theme Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm text-gray-300">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm text-gray-300">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-sm text-gray-300">Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
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
                      <Label htmlFor="questionsJson" className="text-white">Questions JSON *</Label>
                      <Textarea
                        id="questionsJson"
                        value={packFormData.questionsJson}
                        onChange={(e) => handlePackInputChange('questionsJson', e.target.value)}
                        placeholder='[{"id": "q1", "text": "Question?", "category": "Horror", "difficulty": 1, "answers": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Because...", "points": 10}]'
                        className="bg-gray-800 border-gray-600 text-white min-h-32"
                        required
                      />
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
                                <div>
                                  <h5 className="font-bold text-white">{pack.name}</h5>
                                  <p className="text-gray-300 text-sm">{pack.description}</p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {pack.questions.length} questions • Access: {pack.accessType}
                                  </p>
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