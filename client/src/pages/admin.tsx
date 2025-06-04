import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy } from "lucide-react";
import type { HauntConfig, TriviaQuestion } from "@shared/schema";

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
    mode: "individual",
    primaryColor: "#8B0000",
    secondaryColor: "#000000",
    authCode: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load all haunts via server API
  useEffect(() => {
    loadAllHaunts();
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

  const saveHaunt = async () => {
    if (!formData.id || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the haunt ID and name",
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
        logoPath: formData.logoPath,
        triviaFile: formData.triviaFile || "default-questions.json",
        adFile: formData.adFile || "default-ads.json",
        tier: formData.tier as "basic" | "pro" | "premium",
        mode: formData.mode as "individual" | "queue",
        isActive: true,
        isPublished: true,
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.primaryColor
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
          title: "Success",
          description: `Haunt "${formData.name}" has been saved successfully!`
        });
        
        // Reload haunts list
        await loadAllHaunts();
        
        // Reset form
        setFormData({
          id: "",
          name: "",
          description: "",
          logoPath: "",
          triviaFile: "",
          adFile: "",
          tier: "basic",
          mode: "individual",
          primaryColor: "#8B0000",
          secondaryColor: "#000000",
          authCode: ""
        });
      } else {
        throw new Error('Failed to save haunt configuration');
      }
    } catch (error) {
      console.error('Error saving haunt:', error);
      toast({
        title: "Error",
        description: "Failed to save haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-red-500">
            🎃 HEINOUS TRIVIA ADMIN 🎃
          </h1>
          <p className="text-green-300">
            Master Control Panel for Horror Trivia Management
          </p>
        </div>

        <Tabs defaultValue="haunts" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-green-500">
            <TabsTrigger 
              value="haunts" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              <GamepadIcon className="h-3 w-3 mr-1" />
              Haunts
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Create
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              📁 Files
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              ⚡ Bulk Ops
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black text-xs"
            >
              🔧 System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="haunts" className="space-y-6">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <GamepadIcon className="h-5 w-5" />
                  Existing Haunts ({allHaunts.length})
                </CardTitle>
              </CardHeader>
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
                            {haunt.mode === "queue" ? "GROUP MODE" : "INDIVIDUAL"}
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
                    <Label htmlFor="mode" className="text-green-300">Game Mode</Label>
                    <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                      <SelectTrigger className="bg-gray-800 border-green-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-green-600">
                        <SelectItem value="individual">Individual Play</SelectItem>
                        <SelectItem value="queue">Group/Queue Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-green-300">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="bg-gray-800 border-green-600 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-green-300">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="bg-gray-800 border-green-600 h-10"
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

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-green-400 font-medium mb-4">Bulk Question Generator</h3>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter topic or theme for AI-generated questions..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                    <div className="flex gap-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Generate 20 Questions
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Generate 50 Questions
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Generate 100 Questions
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

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-red-400 font-medium mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-900/20 border border-red-600 rounded">
                      <p className="text-red-300 text-sm mb-3">
                        These actions are irreversible and will affect all haunts and user data.
                      </p>
                      <div className="flex gap-3">
                        <Button className="bg-red-700 hover:bg-red-800 text-white">
                          Reset Entire Database
                        </Button>
                        <Button className="bg-orange-700 hover:bg-orange-800 text-white">
                          Purge Old Data
                        </Button>
                        <Button className="bg-yellow-700 hover:bg-yellow-800 text-white">
                          Maintenance Mode
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