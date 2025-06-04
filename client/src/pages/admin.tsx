import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Settings, GamepadIcon } from "lucide-react";
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load haunts
      const hauntsResponse = await fetch('/api/admin/haunts');
      if (hauntsResponse.ok) {
        const haunts = await hauntsResponse.json();
        setAllHaunts(haunts.sort((a: HauntConfig, b: HauntConfig) => a.name.localeCompare(b.name)));
      }

      // Load trivia packs
      const packsResponse = await fetch('/api/admin/trivia-packs');
      if (packsResponse.ok) {
        const packs = await packsResponse.json();
        setExistingPacks(packs);
      }

      // Load default ads
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
      // Simple CSV to JSON conversion
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
            <Tabs defaultValue="haunts" className="space-y-6">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="haunts" className="data-[state=active]:bg-red-600">Haunts</TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-red-600">Create</TabsTrigger>
                <TabsTrigger value="packs" className="data-[state=active]:bg-red-600">Trivia Packs</TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:bg-red-600">Assignments</TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:bg-red-600">Default Ads</TabsTrigger>
              </TabsList>

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
                    <div className="text-center py-8">
                      <p className="text-gray-400">Pack assignment functionality coming soon</p>
                      <p className="text-gray-500 text-sm mt-2">Currently packs are automatically available based on access type</p>
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

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}