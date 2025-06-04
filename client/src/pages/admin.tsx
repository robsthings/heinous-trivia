import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Settings, GamepadIcon, Gamepad2, Users, TrendingUp, Eye, MousePointer, Trophy, Building, Upload, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HauntConfig {
  id: string;
  name: string;
  description?: string;
  tier: string;
  triviaFile?: string;
  authCode?: string;
  isActive?: boolean;
  mode?: string;
}

interface TriviaPack {
  id?: string;
  name: string;
  description: string;
  questions: any[];
  accessType: 'all' | 'tier' | 'select';
  allowedTiers?: string[];
  allowedHaunts?: string[];
}

interface AdFile {
  id: string;
  title: string;
  description: string;
  link: string;
  file: File | null;
}

export default function Admin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allHaunts, setAllHaunts] = useState<HauntConfig[]>([]);
  const [existingPacks, setExistingPacks] = useState<TriviaPack[]>([]);
  const [defaultAds, setDefaultAds] = useState<any[]>([]);
  const [defaultAdFiles, setDefaultAdFiles] = useState<AdFile[]>([]);
  const [selectedHaunt, setSelectedHaunt] = useState<string>('');
  const [selectedSkinTemplate, setSelectedSkinTemplate] = useState<string>('');
  const [selectedProgressStyle, setSelectedProgressStyle] = useState<string>('');

  // Form data for creating haunts
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    tier: 'basic',
    triviaFile: '',
    authCode: ''
  });

  // Form data for creating trivia packs
  const [packFormData, setPackFormData] = useState({
    name: '',
    description: '',
    accessType: 'all' as 'all' | 'tier' | 'select',
    questionsJson: ''
  });

  // Color configuration state
  const [colorConfig, setColorConfig] = useState({
    primary: '#dc2626',
    secondary: '#7c3aed',
    background: '#1f2937',
    accent: '#fbbf24',
    text: '#ffffff'
  });

  // Progress bar configuration state
  const [progressConfig, setProgressConfig] = useState({
    questionFill: '#dc2626',
    questionBackground: '#374151',
    questionHeight: 12,
    timerColor: '#eab308',
    warningColor: '#ef4444',
    borderRadius: 6,
    animationSpeed: 'normal'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const hauntsResponse = await fetch('/api/admin/haunts');
      if (hauntsResponse.ok) {
        const haunts = await hauntsResponse.json();
        setAllHaunts(haunts.sort((a: HauntConfig, b: HauntConfig) => a.name.localeCompare(b.name)));
      }

      const packsResponse = await fetch('/api/admin/trivia-packs');
      if (packsResponse.ok) {
        const packs = await packsResponse.json();
        setExistingPacks(packs);
      }

      const adsResponse = await fetch('/api/admin/default-ads');
      if (adsResponse.ok) {
        const ads = await adsResponse.json();
        setDefaultAds(ads);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackInputChange = (field: string, value: string) => {
    setPackFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field: string, value: string) => {
    setColorConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleProgressChange = (field: string, value: string | number) => {
    setProgressConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) return;

    setIsLoading(true);
    try {
      const hauntConfig: HauntConfig = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        tier: formData.tier,
        triviaFile: formData.triviaFile,
        authCode: formData.authCode || generateAuthCode(),
        isActive: true,
        mode: 'individual'
      };

      const response = await fetch('/api/admin/haunts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hauntConfig)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Haunt created successfully!" });
        setFormData({
          id: '',
          name: '',
          description: '',
          tier: 'basic',
          triviaFile: '',
          authCode: ''
        });
        loadData();
      } else {
        throw new Error('Failed to create haunt');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create haunt" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packFormData.name || !packFormData.questionsJson) return;

    setIsLoading(true);
    try {
      let questions = [];
      try {
        questions = JSON.parse(packFormData.questionsJson);
      } catch {
        toast({ title: "Error", description: "Invalid JSON format for questions" });
        return;
      }

      const triviaPack: TriviaPack = {
        name: packFormData.name,
        description: packFormData.description,
        questions,
        accessType: packFormData.accessType
      };

      const response = await fetch('/api/admin/trivia-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triviaPack)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Trivia pack created successfully!" });
        setPackFormData({
          name: '',
          description: '',
          accessType: 'all',
          questionsJson: ''
        });
        loadData();
      } else {
        throw new Error('Failed to create trivia pack');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create trivia pack" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const questions = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const question: any = {};
        headers.forEach((header, index) => {
          question[header.trim()] = values[index]?.trim() || '';
        });
        return question;
      });
      
      setPackFormData(prev => ({
        ...prev,
        questionsJson: JSON.stringify(questions, null, 2)
      }));
    };
    reader.readAsText(file);
  };

  const saveDefaultAds = async () => {
    if (defaultAdFiles.length === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      defaultAdFiles.forEach((ad, index) => {
        if (ad.file) {
          formData.append(`file_${index}`, ad.file);
        }
        formData.append(`ad_${index}`, JSON.stringify({
          title: ad.title,
          description: ad.description,
          link: ad.link
        }));
      });

      const response = await fetch('/api/admin/default-ads', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast({ title: "Success", description: "Default ads saved successfully!" });
        setDefaultAdFiles([]);
        loadData();
      } else {
        throw new Error('Failed to save default ads');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save default ads" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSkinConfiguration = async () => {
    if (!selectedHaunt) {
      toast({ title: "Error", description: "Please select a haunt first" });
      return;
    }

    setIsLoading(true);
    try {
      const skinConfig = {
        hauntId: selectedHaunt,
        template: selectedSkinTemplate,
        colors: colorConfig,
        backgroundType: 'gradient',
        fontFamily: 'inter'
      };

      const response = await fetch(`/api/haunt-config/${selectedHaunt}/skin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skinConfig)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Skin configuration saved!" });
      } else {
        throw new Error('Failed to save skin configuration');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save skin configuration" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgressBarSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/progress-bar-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedProgressStyle,
          config: progressConfig
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Progress bar settings saved!" });
      } else {
        throw new Error('Failed to save progress bar settings');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save progress bar settings" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeOperation = async (operation: string, scope: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bulk-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, scope })
      });

      if (response.ok) {
        const result = await response.json();
        toast({ title: "Success", description: `Operation completed: ${result.message}` });
        loadData();
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      toast({ title: "Error", description: "Operation failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAuthCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-600';
      case 'pro': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return '👑';
      case 'pro': return '⭐';
      default: return '🎯';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-400 text-2xl flex items-center gap-2">
              👑 Uber Admin Dashboard
            </CardTitle>
            <p className="text-gray-400">Global platform management and configuration controls</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">Analytics</TabsTrigger>
                <TabsTrigger value="haunts" className="data-[state=active]:bg-red-600">Haunts</TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-red-600">Create</TabsTrigger>
                <TabsTrigger value="packs" className="data-[state=active]:bg-red-600">Trivia Packs</TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:bg-red-600">Assignments</TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:bg-red-600">Default Ads</TabsTrigger>
                <TabsTrigger value="skins" className="data-[state=active]:bg-red-600">Skins</TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-red-600">Progress Bars</TabsTrigger>
                <TabsTrigger value="bulk" className="data-[state=active]:bg-red-600">Bulk Operations</TabsTrigger>
              </TabsList>

              {/* Analytics Dashboard Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 border-blue-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-400 text-sm font-medium flex items-center gap-2">
                        <GamepadIcon className="h-4 w-4" />
                        Total Haunts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{allHaunts.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Active haunts across platform</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-green-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-400 text-sm font-medium flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Premium Haunts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {allHaunts.filter(h => h.tier === 'premium').length}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Premium tier subscriptions</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-purple-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-purple-400 text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Pro Haunts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {allHaunts.filter(h => h.tier === 'pro').length}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Pro tier subscriptions</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-red-400">Tier Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['basic', 'pro', 'premium'].map(tier => {
                          const count = allHaunts.filter(h => h.tier === tier).length;
                          const percentage = allHaunts.length > 0 ? (count / allHaunts.length * 100) : 0;
                          return (
                            <div key={tier} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  tier === 'premium' ? 'bg-purple-500' :
                                  tier === 'pro' ? 'bg-blue-500' : 'bg-gray-500'
                                }`} />
                                <span className="text-gray-300 capitalize">{tier}</span>
                              </div>
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
                                <span className="text-white text-sm w-12">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-red-400">Recent Haunts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {allHaunts.slice(0, 5).map(haunt => (
                          <div key={haunt.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getTierColor(haunt.tier)}>
                                {haunt.tier?.toUpperCase()}
                              </Badge>
                              <span className="text-white text-sm">{haunt.name}</span>
                            </div>
                            <span className="text-gray-400 text-xs">{haunt.id}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Haunts Overview Tab */}
              <TabsContent value="haunts" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <GamepadIcon className="h-5 w-5" />
                      Existing Haunts ({allHaunts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allHaunts.map((haunt) => (
                        <div key={haunt.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getTierColor(haunt.tier)} text-white`}>
                                {getTierIcon(haunt.tier)} {haunt.tier?.toUpperCase()}
                              </Badge>
                              <h3 className="text-white font-medium">{haunt.name}</h3>
                              <Badge variant={haunt.isActive ? "default" : "secondary"}>
                                {haunt.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <span className="text-gray-400 text-sm">{haunt.id}</span>
                          </div>
                          {haunt.description && (
                            <p className="text-gray-400 text-sm mb-2">{haunt.description}</p>
                          )}
                          {haunt.authCode && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-gray-400 text-sm">Access Code:</span>
                              <code className="bg-gray-700 px-2 py-1 rounded text-yellow-400 text-sm">
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
                          
                          {/* Haunt Access Links */}
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7"
                                  onClick={() => window.open(`/?haunt=${haunt.id}`, '_blank')}
                                >
                                  Game
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-blue-400 hover:bg-blue-600 hover:text-white"
                                  onClick={() => copyToClipboard(`${window.location.origin}/?haunt=${haunt.id}`, "Game Link")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7"
                                  onClick={() => window.open(`/haunt-admin?haunt=${haunt.id}`, '_blank')}
                                >
                                  Haunt Admin
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-green-400 hover:bg-green-600 hover:text-white"
                                  onClick={() => copyToClipboard(`${window.location.origin}/haunt-admin?haunt=${haunt.id}`, "Haunt Admin Link")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 h-7"
                                  onClick={() => window.open(`/host?haunt=${haunt.id}`, '_blank')}
                                >
                                  Host Panel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-purple-400 hover:bg-purple-600 hover:text-white"
                                  onClick={() => copyToClipboard(`${window.location.origin}/host?haunt=${haunt.id}`, "Host Panel Link")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Assignment Interface */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Create Assignment</h3>
                        
                        <div>
                          <Label className="text-white">Select Trivia Pack</Label>
                          <Select>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose pack" />
                            </SelectTrigger>
                            <SelectContent>
                              {existingPacks.map(pack => (
                                <SelectItem key={pack.id} value={pack.id || ''}>
                                  {pack.name} ({pack.questions.length} questions)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">Assignment Type</Label>
                          <Select>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Haunts</SelectItem>
                              <SelectItem value="tier">By Tier</SelectItem>
                              <SelectItem value="individual">Individual Haunts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">Target Haunts/Tiers</Label>
                          <Select>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select targets" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="premium">Premium Tier</SelectItem>
                              <SelectItem value="pro">Pro Tier</SelectItem>
                              <SelectItem value="basic">Basic Tier</SelectItem>
                              {allHaunts.map(haunt => (
                                <SelectItem key={haunt.id} value={haunt.id}>
                                  {haunt.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button className="bg-red-600 hover:bg-red-700 text-white w-full">
                          Create Assignment
                        </Button>
                      </div>

                      {/* Current Assignments */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Current Assignments</h3>
                        <div className="space-y-2">
                          {existingPacks.map(pack => (
                            <div key={pack.id} className="bg-gray-800/50 p-3 rounded border border-gray-600">
                              <div className="flex justify-between items-center">
                                <span className="text-white text-sm">{pack.name}</span>
                                <Badge className="bg-green-600">
                                  {pack.accessType === 'all' ? 'All Haunts' : 'Restricted'}
                                </Badge>
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {pack.questions.length} questions available
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Default Ads Tab */}
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

              {/* Skins Management Tab */}
              <TabsContent value="skins" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      🎨 Global Skins Management
                    </CardTitle>
                    <p className="text-gray-400">Manage visual themes and skins across all haunts</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Haunt Selection */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-white">Select Haunt to Configure</Label>
                          <Select value={selectedHaunt} onValueChange={setSelectedHaunt}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose haunt to edit" />
                            </SelectTrigger>
                            <SelectContent>
                              {allHaunts.map(haunt => (
                                <SelectItem key={haunt.id} value={haunt.id}>
                                  {haunt.name} ({haunt.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-white">Skin Template</Label>
                          <Select value={selectedSkinTemplate} onValueChange={setSelectedSkinTemplate}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose skin template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="horror-classic">Horror Classic</SelectItem>
                              <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                              <SelectItem value="gothic">Gothic</SelectItem>
                              <SelectItem value="neon">Neon</SelectItem>
                              <SelectItem value="vintage">Vintage</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Color Palette Editor */}
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                        <h3 className="text-white font-medium mb-4">Color Palette Editor</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(colorConfig).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-gray-300 text-sm capitalize">{key} Color</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input 
                                  type="color" 
                                  value={value}
                                  onChange={(e) => handleColorChange(key, e.target.value)}
                                  className="w-10 h-8 rounded border border-gray-600 bg-gray-700"
                                />
                                <Input 
                                  value={value}
                                  onChange={(e) => handleColorChange(key, e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          onClick={saveSkinConfiguration}
                          disabled={!selectedHaunt || isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isLoading ? "Saving..." : "Save Skin Configuration"}
                        </Button>
                        <Button 
                          onClick={() => executeOperation('apply-skin-template', 'all')}
                          disabled={!selectedSkinTemplate || isLoading}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Apply to All Haunts
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Bars Tab */}
              <TabsContent value="progress" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      📊 Progress Bar Management
                    </CardTitle>
                    <p className="text-gray-400">Customize progress bar styles and animations for all haunts</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Progress Bar Style Selection */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-white">Progress Bar Style</Label>
                          <Select value={selectedProgressStyle} onValueChange={setSelectedProgressStyle}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="classic">Classic Bar</SelectItem>
                              <SelectItem value="neon">Neon Glow</SelectItem>
                              <SelectItem value="gradient">Gradient Flow</SelectItem>
                              <SelectItem value="pulse">Pulse Animation</SelectItem>
                              <SelectItem value="segments">Segmented Bar</SelectItem>
                              <SelectItem value="liquid">Liquid Fill</SelectItem>
                              <SelectItem value="retro">Retro Pixel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-white">Animation Speed</Label>
                          <Select 
                            value={progressConfig.animationSpeed} 
                            onValueChange={(value) => handleProgressChange('animationSpeed', value)}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Choose speed" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slow">Slow (2s)</SelectItem>
                              <SelectItem value="normal">Normal (1s)</SelectItem>
                              <SelectItem value="fast">Fast (0.5s)</SelectItem>
                              <SelectItem value="instant">Instant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Progress Bar Preview */}
                      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                        <h3 className="text-white font-medium mb-4">Live Preview</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                              <span>Question Progress</span>
                              <span>7/10</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full" style={{height: `${progressConfig.questionHeight}px`}}>
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{
                                  width: "70%",
                                  backgroundColor: progressConfig.questionFill,
                                  borderRadius: `${progressConfig.borderRadius}px`
                                }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                              <span>Time Remaining</span>
                              <span>15s</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-1000" 
                                style={{
                                  width: "75%",
                                  backgroundColor: progressConfig.timerColor,
                                  borderRadius: `${progressConfig.borderRadius}px`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar Customization */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                          <h3 className="text-white font-medium mb-4">Question Progress Bar</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-sm">Fill Color</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input 
                                  type="color" 
                                  value={progressConfig.questionFill}
                                  onChange={(e) => handleProgressChange('questionFill', e.target.value)}
                                  className="w-10 h-8 rounded border border-gray-600 bg-gray-700"
                                />
                                <Input 
                                  value={progressConfig.questionFill}
                                  onChange={(e) => handleProgressChange('questionFill', e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 text-sm">Height (px)</Label>
                              <Input 
                                type="number" 
                                value={progressConfig.questionHeight}
                                onChange={(e) => handleProgressChange('questionHeight', parseInt(e.target.value))}
                                min="4" 
                                max="32"
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                          <h3 className="text-white font-medium mb-4">Timer Progress Bar</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-300 text-sm">Timer Color</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input 
                                  type="color" 
                                  value={progressConfig.timerColor}
                                  onChange={(e) => handleProgressChange('timerColor', e.target.value)}
                                  className="w-10 h-8 rounded border border-gray-600 bg-gray-700"
                                />
                                <Input 
                                  value={progressConfig.timerColor}
                                  onChange={(e) => handleProgressChange('timerColor', e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 text-sm">Warning Color (under 10s)</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input 
                                  type="color" 
                                  value={progressConfig.warningColor}
                                  onChange={(e) => handleProgressChange('warningColor', e.target.value)}
                                  className="w-10 h-8 rounded border border-gray-600 bg-gray-700"
                                />
                                <Input 
                                  value={progressConfig.warningColor}
                                  onChange={(e) => handleProgressChange('warningColor', e.target.value)}
                                  className="bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          onClick={saveProgressBarSettings}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isLoading ? "Saving..." : "Save Progress Bar Settings"}
                        </Button>
                        <Button 
                          onClick={() => executeOperation('apply-progress-config', 'all')}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply to All Haunts
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Operations Tab */}
              <TabsContent value="bulk" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      ⚡ Bulk Operations
                    </CardTitle>
                    <p className="text-gray-400">Perform mass operations across multiple haunts</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Bulk Configuration Updates */}
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-orange-600">
                        <h3 className="text-orange-400 font-medium mb-4">Configuration Updates</h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Target Scope</Label>
                            <Select>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                                <SelectValue placeholder="Select target" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Haunts ({allHaunts.length})</SelectItem>
                                <SelectItem value="premium">Premium Tier ({allHaunts.filter(h => h.tier === 'premium').length})</SelectItem>
                                <SelectItem value="pro">Pro Tier ({allHaunts.filter(h => h.tier === 'pro').length})</SelectItem>
                                <SelectItem value="basic">Basic Tier ({allHaunts.filter(h => h.tier === 'basic').length})</SelectItem>
                                <SelectItem value="inactive">Inactive Haunts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => executeOperation('enable-all', 'selected')}
                              className="w-full bg-green-600 hover:bg-green-700 text-sm"
                            >
                              Enable All Selected
                            </Button>
                            <Button 
                              onClick={() => executeOperation('disable-all', 'selected')}
                              className="w-full bg-red-600 hover:bg-red-700 text-sm"
                            >
                              Disable All Selected
                            </Button>
                            <Button 
                              onClick={() => executeOperation('update-trivia-packs', 'selected')}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                            >
                              Update Trivia Packs
                            </Button>
                            <Button 
                              onClick={() => executeOperation('sync-default-ads', 'selected')}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                            >
                              Sync Default Ads
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Data Management */}
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-600">
                        <h3 className="text-cyan-400 font-medium mb-4">Data Management</h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Data Operation</Label>
                            <Select>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                                <SelectValue placeholder="Select operation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="export-configs">Export All Configurations</SelectItem>
                                <SelectItem value="export-leaderboards">Export Leaderboards</SelectItem>
                                <SelectItem value="export-analytics">Export Analytics</SelectItem>
                                <SelectItem value="backup-all">Backup All Data</SelectItem>
                                <SelectItem value="clear-analytics">Clear Analytics Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Button 
                              onClick={() => executeOperation('export-data', 'all')}
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm"
                            >
                              Execute Operation
                            </Button>
                            <Button 
                              onClick={() => executeOperation('generate-report', 'all')}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm"
                            >
                              Generate Report
                            </Button>
                            <Button 
                              onClick={() => executeOperation('backup-database', 'all')}
                              className="w-full bg-yellow-600 hover:bg-yellow-700 text-sm"
                            >
                              Backup Database
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