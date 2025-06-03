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
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-green-500">
            <TabsTrigger 
              value="haunts" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black"
            >
              <GamepadIcon className="h-4 w-4 mr-2" />
              Haunt Management
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-black"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create New Haunt
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
        </Tabs>
      </div>
    </div>
  );
}