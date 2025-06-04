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
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy, Upload, Download, Trash2 } from "lucide-react";
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
    authCode: ""
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
      const response = await fetch('/api/haunts');
      if (response.ok) {
        const haunts = await response.json();
        setAllHaunts(haunts.sort((a: HauntConfig, b: HauntConfig) => a.name.localeCompare(b.name)));
      } else {
        console.error('Failed to load haunts:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to load haunts:', error);
      toast({
        title: "Error",
        description: "Failed to load haunts",
        variant: "destructive"
      });
    }
  };

  const loadExistingPacks = async () => {
    try {
      const response = await fetch('/api/trivia-packs');
      if (response.ok) {
        const packs = await response.json();
        setExistingPacks(packs);
      } else {
        console.error('Failed to load trivia packs:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to load trivia packs:', error);
      toast({
        title: "Error",
        description: "Failed to load trivia packs",
        variant: "destructive"
      });
    }
  };

  const loadDefaultAds = async () => {
    try {
      const response = await fetch('/api/default-ads');
      if (response.ok) {
        const ads = await response.json();
        setDefaultAds(ads);
      } else {
        console.error('Failed to load default ads:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to load default ads:', error);
      toast({
        title: "Error",
        description: "Failed to load default ads",
        variant: "destructive"
      });
    }
  };

  const updateHauntSubscription = async (hauntId: string, updates: Partial<HauntConfig>) => {
    try {
      const response = await fetch(`/api/haunt/${hauntId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
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
      } else {
        throw new Error('Failed to update haunt subscription');
      }
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
      const response = await fetch(`/api/haunt/${hauntId}/reset-access-code`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Access Code Reset",
          description: `The access code for "${hauntName}" has been reset. They will need to set up a new code when they next visit their admin panel.`,
        });
      } else {
        throw new Error('Failed to reset access code');
      }
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
      const response = await fetch(`/api/haunt/${hauntId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
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
      } else {
        throw new Error('Failed to delete haunt');
      }
    } catch (error) {
      console.error('Failed to delete haunt:', error);
      toast({
        title: "Error",
        description: "Failed to delete haunt. Please try again.",
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

      const response = await fetch('/api/trivia-packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(triviaPack)
      });

      if (response.ok) {
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

        loadExistingPacks();
      } else {
        throw new Error('Failed to create trivia pack');
      }
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
        isPublished: true, // New haunts are published by default
        theme: {
          primaryColor: "#8B0000", // Default colors - Haunt Admin controls these
          secondaryColor: "#000000",
          accentColor: "#8B0000"
        },
        authCode: formData.authCode || Math.random().toString(36).substring(2, 15)
      };

      const response = await fetch(`/api/haunt/${formData.id}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hauntConfig)
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Haunt "${formData.name}" saved successfully`,
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
          authCode: ""
        });
      } else {
        throw new Error('Failed to save haunt configuration');
      }
    } catch (error) {
      console.error('Failed to save haunt config:', error);
      toast({
        title: "Error",
        description: `Failed to save haunt configuration: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDefaultAds = async () => {
    try {
      // Upload and save new default ads
      const adsToSave = defaultAdFiles
        .filter(ad => ad.file)
        .map(ad => ({
          title: ad.title || "Default Ad",
          description: ad.description || "Discover more!",
          link: ad.link || "#",
          imageUrl: "placeholder-url" // Would need file upload implementation
        }));

      const response = await fetch('/api/default-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adsToSave)
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: `${adsToSave.length} default ads saved successfully`,
        });
        
        // Refresh the ads list
        loadDefaultAds();
        setDefaultAdFiles([]);
      } else {
        throw new Error('Failed to save default ads');
      }
    } catch (error) {
      console.error('Failed to save default ads:', error);
      toast({
        title: "Error",
        description: "Failed to save default ads",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return <Gem className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-600';
      case 'pro': return 'bg-blue-600';
      default: return 'bg-gray-600';
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
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-gray-800">
                <TabsTrigger value="management" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  Management
                </TabsTrigger>
                <TabsTrigger value="create" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🏚️ Create
                </TabsTrigger>
                <TabsTrigger value="packs" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🧠 Packs
                </TabsTrigger>
                <TabsTrigger value="assignments" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  🎯 Assignments
                </TabsTrigger>
                <TabsTrigger value="files" className="text-white data-[state=active]:bg-red-600 text-xs md:text-sm">
                  📢 Files
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
                                      onClick={() => window.open(`${window.location.origin}/game?haunt=${haunt.id}`, '_blank')}
                                    >
                                      <GamepadIcon className="h-3 w-3 mr-1" />
                                      Game: /game?haunt={haunt.id}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600 hover:text-white"
                                      onClick={() => copyToClipboard(`${window.location.origin}/game?haunt=${haunt.id}`, "Game URL")}
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
                                        authCode: haunt.authCode || ""
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
                        Update haunt details and subscription tier. Colors and themes are controlled by Haunt Admin.
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

                              await updateHauntSubscription(editingHaunt.id, updatedHaunt);
                              setEditingHaunt(null);
                            } catch (error) {
                              console.error('Failed to update haunt profile:', error);
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
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Create New Haunt Tab */}
              <TabsContent value="create" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🏚️ Create New Haunt
                    </CardTitle>
                    <p className="text-gray-400">Set up a new haunt with basic configuration. Colors and game modes are controlled by Haunt Admin.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-white font-medium">Basic Information</h3>
                          
                          <div>
                            <Label htmlFor="create-id" className="text-white">Haunt ID *</Label>
                            <Input
                              id="create-id"
                              value={formData.id}
                              onChange={(e) => handleInputChange('id', e.target.value)}
                              placeholder="e.g., headquarters, mansion, asylum"
                              className="bg-gray-800 border-gray-600 text-white"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="create-name" className="text-white">Haunt Name *</Label>
                            <Input
                              id="create-name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="e.g., Heinous HQ, Cursed Mansion"
                              className="bg-gray-800 border-gray-600 text-white"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="create-description" className="text-white">Description</Label>
                            <Textarea
                              id="create-description"
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Brief description of the haunt"
                              className="bg-gray-800 border-gray-600 text-white"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4">
                          <h3 className="text-white font-medium">Configuration</h3>
                          
                          <div>
                            <Label htmlFor="create-tier" className="text-white">Subscription Tier</Label>
                            <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
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

                          <div>
                            <Label htmlFor="create-triviaFile" className="text-white">Trivia Pack</Label>
                            <Input
                              id="create-triviaFile"
                              value={formData.triviaFile}
                              onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                              placeholder="e.g., horror-classics.json (optional)"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="create-authCode" className="text-white">Access Code</Label>
                            <Input
                              id="create-authCode"
                              value={formData.authCode}
                              onChange={(e) => handleInputChange('authCode', e.target.value)}
                              placeholder="Leave blank for auto-generate"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-gray-700">
                        <Button 
                          type="submit"
                          disabled={isLoading || !formData.id || !formData.name}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isLoading ? "Creating..." : "🏚️ Create Haunt"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trivia Packs Tab */}
              <TabsContent value="packs" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🧠 Trivia Pack Management
                      <Badge variant="outline" className="text-gray-300">
                        {existingPacks.length} packs
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-400">Create and manage question packs for different tiers and haunts</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Create New Pack Form */}
                      <form onSubmit={handlePackSubmit} className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                        <h3 className="text-white font-medium">Create New Trivia Pack</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pack-name" className="text-white">Pack Name *</Label>
                            <Input
                              id="pack-name"
                              value={packFormData.name}
                              onChange={(e) => handlePackInputChange('name', e.target.value)}
                              placeholder="e.g., Horror Classics, Science Fiction"
                              className="bg-gray-800 border-gray-600 text-white"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="pack-access" className="text-white">Access Type</Label>
                            <Select value={packFormData.accessType} onValueChange={(value) => handlePackInputChange('accessType', value)}>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Haunts</SelectItem>
                                <SelectItem value="tier">Specific Tiers</SelectItem>
                                <SelectItem value="select">Selected Haunts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="pack-description" className="text-white">Description</Label>
                          <Textarea
                            id="pack-description"
                            value={packFormData.description}
                            onChange={(e) => handlePackInputChange('description', e.target.value)}
                            placeholder="Brief description of the question pack"
                            className="bg-gray-800 border-gray-600 text-white"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="pack-questions" className="text-white">Questions JSON *</Label>
                          <Textarea
                            id="pack-questions"
                            value={packFormData.questionsJson}
                            onChange={(e) => handlePackInputChange('questionsJson', e.target.value)}
                            placeholder="Paste questions JSON or upload CSV below"
                            className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
                            rows={8}
                            required
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Label htmlFor="csv-upload" className="text-sm text-gray-400">Or upload CSV:</Label>
                            <Input
                              id="csv-upload"
                              type="file"
                              accept=".csv"
                              onChange={handlePackCSVUpload}
                              className="bg-gray-800 border-gray-600 text-white text-sm"
                            />
                          </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                          {isLoading ? "Creating..." : "🧠 Create Pack"}
                        </Button>
                      </form>

                      {/* Existing Packs List */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Existing Trivia Packs</h3>
                        {existingPacks.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-400">No trivia packs created yet. Create your first pack above!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {existingPacks.map((pack) => (
                              <div key={pack.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-medium">{pack.name}</h4>
                                  <Badge variant="outline" className="text-gray-300">
                                    {pack.questions.length} questions
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{pack.description || 'No description'}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge className="bg-blue-600">
                                    {pack.accessType === 'all' ? 'All Haunts' : 
                                     pack.accessType === 'tier' ? 'Tier Restricted' : 'Select Haunts'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🎯 Pack Assignments
                    </CardTitle>
                    <p className="text-gray-400">Assign trivia packs to specific haunts and tiers</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-400">Pack assignment functionality coming soon</p>
                      <p className="text-gray-500 text-sm mt-2">Currently packs are automatically available based on access type</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      📢 Default Ads Management
                    </CardTitle>
                    <p className="text-gray-400">Manage default advertisements shown when haunts don't have custom ads</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Current Default Ads */}
                      <div>
                        <h3 className="text-white font-medium mb-4">Current Default Ads</h3>
                        {defaultAds.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-400">No default ads configured yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {defaultAds.map((ad) => (
                              <div key={ad.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-medium">{ad.title}</h4>
                                  <Badge variant="outline" className="text-gray-300">
                                    Default Ad
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{ad.description}</p>
                                <p className="text-blue-400 text-sm">{ad.link}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Upload New Default Ads */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                        <h3 className="text-white font-medium mb-4">Upload New Default Ads</h3>
                        <div className="space-y-4">
                          {defaultAdFiles.map((ad, index) => (
                            <div key={ad.id} className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-3 bg-gray-700/50 rounded">
                              <Input
                                value={ad.title}
                                onChange={(e) => {
                                  const updated = [...defaultAdFiles];
                                  updated[index].title = e.target.value;
                                  setDefaultAdFiles(updated);
                                }}
                                placeholder="Ad title"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <Input
                                value={ad.description}
                                onChange={(e) => {
                                  const updated = [...defaultAdFiles];
                                  updated[index].description = e.target.value;
                                  setDefaultAdFiles(updated);
                                }}
                                placeholder="Ad description"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <Input
                                value={ad.link}
                                onChange={(e) => {
                                  const updated = [...defaultAdFiles];
                                  updated[index].link = e.target.value;
                                  setDefaultAdFiles(updated);
                                }}
                                placeholder="Link URL"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const updated = [...defaultAdFiles];
                                    updated[index].file = file;
                                    setDefaultAdFiles(updated);
                                  }
                                }}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          ))}
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setDefaultAdFiles([...defaultAdFiles, {
                                  file: null,
                                  link: "",
                                  id: Date.now().toString(),
                                  title: "",
                                  description: ""
                                }]);
                              }}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Add Ad Slot
                            </Button>
                            
                            <Button
                              onClick={saveDefaultAds}
                              disabled={defaultAdFiles.length === 0}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Save Default Ads
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
              <CardContent>
                <div className="grid gap-4">
                  {allHaunts.map((haunt) => (
                    <div
                      key={haunt.id}
                      className="p-4 bg-gray-800 border border-green-600 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getTierColor(haunt.tier)} text-white flex items-center gap-1`}>
                            {getTierIcon(haunt.tier)}
                            {haunt.tier?.toUpperCase() || 'BASIC'}
                          </Badge>
                          <h3 className="text-xl font-bold text-green-400">
                            {haunt.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className="border-blue-500 text-blue-400"
                          >
                            {haunt.triviaFile || "default-questions.json"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-green-300 text-sm">Haunt ID</Label>
                          <p className="text-white font-mono bg-gray-700 p-2 rounded text-sm">
                            {haunt.id}
                          </p>
                        </div>
                        <div>
                          <Label className="text-green-300 text-sm">Description</Label>
                          <p className="text-gray-300 text-sm">
                            {haunt.description || "No description provided"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs border-green-600 text-green-400 hover:bg-green-600 hover:text-white flex-1"
                            onClick={() => window.open(`${window.location.origin}/game?haunt=${haunt.id}`, '_blank')}
                          >
                            <GamepadIcon className="h-3 w-3 mr-1" />
                            Game: /game?haunt={haunt.id}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-400 hover:bg-green-600 hover:text-white"
                            onClick={() => copyToClipboard(`${window.location.origin}/game?haunt=${haunt.id}`, "Game URL")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

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

                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-1"
                            onClick={() => window.open(`${window.location.origin}/haunt-admin/${haunt.id}`, '_blank')}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Admin: /haunt-admin/{haunt.id}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600 hover:text-white"
                            onClick={() => copyToClipboard(`${window.location.origin}/haunt-admin/${haunt.id}`, "Admin URL")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {haunt.authCode && (
                        <div className="flex items-center gap-2 mt-2">
                          <Label className="text-yellow-300 text-sm">Access Code:</Label>
                          <code className="bg-gray-700 px-2 py-1 rounded text-yellow-400 font-mono text-sm">
                            {haunt.authCode}
                          </code>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-6 w-6 p-0 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                            onClick={() => copyToClipboard(haunt.authCode || "", "Access Code")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {allHaunts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No haunts created yet. Create your first haunt!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Create New Haunt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id" className="text-green-300">Haunt ID *</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleInputChange('id', e.target.value)}
                      placeholder="e.g., headquarters, mansion, asylum"
                      className="bg-gray-800 border-green-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-green-300">Haunt Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Heinous HQ, Cursed Mansion"
                      className="bg-gray-800 border-green-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-green-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your haunt..."
                    className="bg-gray-800 border-green-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier" className="text-green-300">Subscription Tier</Label>
                    <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
                      <SelectTrigger className="bg-gray-800 border-green-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-green-600">
                        <SelectItem value="basic">Basic (Free)</SelectItem>
                        <SelectItem value="pro">Pro ($19/month)</SelectItem>
                        <SelectItem value="premium">Premium ($49/month)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triviaFile" className="text-green-300">Trivia Pack</Label>
                    <Input
                      id="triviaFile"
                      value={formData.triviaFile}
                      onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                      placeholder="e.g., horror-classics.json"
                      className="bg-gray-800 border-green-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authCode" className="text-green-300">Access Code (leave blank for auto-generate)</Label>
                  <Input
                    id="authCode"
                    value={formData.authCode}
                    onChange={(e) => handleInputChange('authCode', e.target.value)}
                    placeholder="Optional: custom access code"
                    className="bg-gray-800 border-green-600 text-white"
                  />
                </div>

                <Button 
                  onClick={saveHaunt}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Creating Haunt..." : "Create Haunt"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  📊 Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-blue-600">
                    <h3 className="text-blue-400 font-medium mb-2">Total Haunts</h3>
                    <p className="text-2xl font-bold text-white">{allHaunts.length}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-green-600">
                    <h3 className="text-green-400 font-medium mb-2">Active Haunts</h3>
                    <p className="text-2xl font-bold text-white">
                      {allHaunts.filter(h => h.isActive).length}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-purple-600">
                    <h3 className="text-purple-400 font-medium mb-2">Premium Tier</h3>
                    <p className="text-2xl font-bold text-white">
                      {allHaunts.filter(h => h.tier === 'premium').length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-green-400 font-medium mb-4">Haunt Distribution by Tier</h3>
                    <div className="space-y-2">
                      {['basic', 'pro', 'premium'].map(tier => {
                        const count = allHaunts.filter(h => h.tier === tier).length;
                        const percentage = allHaunts.length > 0 ? (count / allHaunts.length * 100).toFixed(1) : 0;
                        return (
                          <div key={tier} className="flex justify-between items-center">
                            <span className="text-gray-300 capitalize">{tier}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    tier === 'premium' ? 'bg-purple-500' :
                                    tier === 'pro' ? 'bg-blue-500' : 'bg-gray-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-white text-sm w-12">{count} ({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-green-400 font-medium mb-4">Game Mode Distribution</h3>
                    <div className="space-y-2">
                      {['individual', 'queue'].map(mode => {
                        const count = allHaunts.filter(h => h.mode === mode).length;
                        const percentage = allHaunts.length > 0 ? (count / allHaunts.length * 100).toFixed(1) : 0;
                        return (
                          <div key={mode} className="flex justify-between items-center">
                            <span className="text-gray-300 capitalize">
                              {mode === 'queue' ? 'Group Mode' : 'Individual'}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    mode === 'queue' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-white text-sm w-12">{count} ({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {allHaunts.slice(0, 5).map(haunt => (
                      <div key={haunt.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTierColor(haunt.tier)} text-white`}>
                            {haunt.tier?.toUpperCase()}
                          </Badge>
                          <span className="text-white">{haunt.name}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{haunt.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  📁 File Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-blue-400 font-medium mb-4">Trivia Question Files</h3>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".json,.csv"
                        className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                      />
                      <p className="text-gray-400 text-sm">Upload JSON or CSV files with trivia questions</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-medium mb-4">Advertisement Files</h3>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".json"
                        className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                      />
                      <p className="text-gray-400 text-sm">Upload JSON files with advertisement data</p>
                    </div>
                  </div>
                </div>

                {/* RESTORED: Uber Admin Trivia Pack Manager */}
                <div className="bg-gray-800 p-4 rounded-lg border border-blue-600">
                  <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
                    📚 Global Trivia Pack Management
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300 text-sm">Pack Name</Label>
                        <Input
                          placeholder="e.g., Horror Classics 2024"
                          className="bg-gray-700 border-gray-600 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Access Level</Label>
                        <Select>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Haunts (Public)</SelectItem>
                            <SelectItem value="premium">Premium Tier Only</SelectItem>
                            <SelectItem value="pro">Pro Tier & Above</SelectItem>
                            <SelectItem value="select">Selected Haunts Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm">Question File (JSON/CSV)</Label>
                        <Input
                          type="file"
                          accept=".json,.csv"
                          className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 mt-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300 text-sm">Description</Label>
                        <Textarea
                          placeholder="Describe the question pack content..."
                          className="bg-gray-700 border-gray-600 text-white mt-1"
                          rows={4}
                        />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Upload Global Pack
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-purple-600">
                  <h3 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                    ⚡ Bulk Haunt Operations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300 text-sm">Target Scope</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                          <SelectValue placeholder="Select target scope" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="all">All Haunts ({allHaunts.length})</SelectItem>
                          <SelectItem value="tier-premium">Premium Tier ({allHaunts.filter(h => h.tier === 'premium').length})</SelectItem>
                          <SelectItem value="tier-pro">Pro Tier ({allHaunts.filter(h => h.tier === 'pro').length})</SelectItem>
                          <SelectItem value="tier-basic">Basic Tier ({allHaunts.filter(h => h.tier === 'basic').length})</SelectItem>
                          <SelectItem value="active">Active Only ({allHaunts.filter(h => h.isActive).length})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                        Sync Question Packs
                      </Button>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
                        Export Leaderboards
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                        Generate Reports
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                        Clear Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  ⚡ Bulk Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-yellow-400 font-medium mb-4">Bulk Haunt Actions</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Enable All Haunts
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Disable All Haunts
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Export All Configurations
                      </Button>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Backup All Data
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-orange-400 font-medium mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Clear All Leaderboards
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Reset All Analytics
                      </Button>
                      <Button className="w-full bg-gray-600 hover:bg-gray-700">
                        Archive Old Sessions
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Generate Reports
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 font-medium mb-4">Batch Import/Export</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Import Haunts</Label>
                      <Input
                        type="file"
                        accept=".json"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Export Format</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Process Batch
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  🔧 System Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-blue-400 font-medium mb-4">Database Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Firebase Connection</span>
                        <Badge className="bg-green-600 text-white">Connected</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Collections</span>
                        <span className="text-white">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Storage Usage</span>
                        <span className="text-white">2.3 GB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-purple-400 font-medium mb-4">Server Resources</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Server Status</span>
                        <Badge className="bg-green-600 text-white">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Active Sessions</span>
                        <span className="text-white">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">API Responses</span>
                        <span className="text-white">~68ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESTORED: Uber Admin System Controls */}
                <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
                  <h3 className="text-yellow-400 font-medium mb-4 flex items-center gap-2">
                    🛡️ Uber Admin System Controls
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-green-400 text-sm font-medium">Global Operations</h4>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                        Sync All Firebase Data
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                        Rebuild Question Cache
                      </Button>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                        Update Global Configs
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-orange-400 text-sm font-medium">Monitoring & Reports</h4>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
                        Generate System Report
                      </Button>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm">
                        Export All Analytics
                      </Button>
                      <Button className="w-full bg-pink-600 hover:bg-pink-700 text-sm">
                        Performance Metrics
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-red-400 text-sm font-medium">Emergency Controls</h4>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-sm">
                        Maintenance Mode
                      </Button>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
                        Archive Old Sessions
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                        Emergency Shutdown
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-red-600">
                  <h3 className="text-red-400 font-medium mb-4">Database Danger Zone</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-900/20 border border-red-600 rounded">
                      <p className="text-red-300 text-sm mb-3">
                        These actions are irreversible and will affect all haunts and user data.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button className="bg-red-700 hover:bg-red-800 text-white text-sm">
                          Reset All Leaderboards
                        </Button>
                        <Button className="bg-red-700 hover:bg-red-800 text-white text-sm">
                          Purge Analytics Data
                        </Button>
                        <Button className="bg-red-800 hover:bg-red-900 text-white text-sm">
                          Factory Reset Database
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 font-medium mb-4">Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Default Question Count</Label>
                      <Input
                        type="number"
                        defaultValue="20"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        defaultValue="30"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Max Players per Game</Label>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Leaderboard Limit</Label>
                      <Input
                        type="number"
                        defaultValue="100"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}