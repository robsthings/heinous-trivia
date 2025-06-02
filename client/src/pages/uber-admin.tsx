import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Gamepad2, Users, TrendingUp, Eye, MousePointer, Trophy, Building, Settings, Upload, Palette } from "lucide-react";
import { Link } from "wouter";

interface HauntAnalytics {
  hauntId: string;
  name: string;
  tier: string;
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  competitiveMetrics: {
    averageScore: number;
    topScore: number;
    participationRate: number;
  };
}

interface GlobalAnalytics {
  totalHaunts: number;
  proHaunts: number;
  premiumHaunts: number;
  hauntBreakdown: HauntAnalytics[];
}

interface HauntConfig {
  name: string;
  tier: string;
  theme?: {
    background?: string;
    progressBar?: string;
  };
}

export default function UberAdmin() {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedHaunt, setSelectedHaunt] = useState<string | null>(null);
  const [hauntConfigs, setHauntConfigs] = useState<Record<string, HauntConfig>>({});
  const [uploadingBackground, setUploadingBackground] = useState(false);

  useEffect(() => {
    const fetchGlobalAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        setAnalytics(data);
        
        // Load haunt configurations - get all haunts directly for the skins editor
        try {
          const hauntsResponse = await fetch('/api/haunts');
          if (hauntsResponse.ok) {
            const allHaunts = await hauntsResponse.json();
            const configs: Record<string, HauntConfig> = {};
            
            for (const haunt of allHaunts) {
              try {
                const configResponse = await fetch(`/api/haunt-config/${haunt.id}`);
                if (configResponse.ok) {
                  configs[haunt.id] = await configResponse.json();
                } else {
                  // Create basic config if none exists
                  configs[haunt.id] = {
                    name: haunt.name || haunt.id,
                    tier: haunt.tier || 'basic'
                  };
                }
              } catch (error) {
                console.error(`Failed to load config for ${haunt.id}:`, error);
                configs[haunt.id] = {
                  name: haunt.name || haunt.id,
                  tier: haunt.tier || 'basic'
                };
              }
            }
            setHauntConfigs(configs);
            
            // Set first haunt as selected if none selected
            if (!selectedHaunt && allHaunts.length > 0) {
              setSelectedHaunt(allHaunts[0].id);
            }
          }
        } catch (error) {
          console.error('Failed to load haunts for skins editor:', error);
        }
      } catch (error) {
        console.error("Failed to load global analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalAnalytics();
  }, [timeRange]);

  const handleBackgroundUpload = async (hauntId: string, file: File) => {
    if (!file) return;

    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append('background', file);
      formData.append('hauntId', hauntId);

      const response = await fetch('/api/upload-background', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload background');
      }

      const result = await response.json();
      
      // Update the haunt config with new background path
      await updateHauntTheme(hauntId, {
        background: result.path
      });

    } catch (error) {
      console.error('Failed to upload background:', error);
    } finally {
      setUploadingBackground(false);
    }
  };

  const updateHauntTheme = async (hauntId: string, themeUpdates: Partial<{ background: string; progressBar: string }>) => {
    try {
      const currentConfig = hauntConfigs[hauntId] || { name: hauntId, tier: 'basic' };
      const updatedConfig = {
        ...currentConfig,
        theme: {
          ...currentConfig.theme,
          ...themeUpdates
        }
      };

      const response = await fetch(`/api/haunt-config/${hauntId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to update haunt theme');
      }

      // Update local state
      setHauntConfigs(prev => ({
        ...prev,
        [hauntId]: updatedConfig
      }));

    } catch (error) {
      console.error('Failed to update haunt theme:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-screen">
          <div className="text-white text-xl">Failed to load analytics data</div>
        </div>
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalGames = analytics.hauntBreakdown.reduce((sum, haunt) => sum + haunt.totalGames, 0);
  const totalPlayers = analytics.hauntBreakdown.reduce((sum, haunt) => sum + haunt.uniquePlayers, 0);
  const avgReturnRate = analytics.hauntBreakdown.length > 0 
    ? analytics.hauntBreakdown.reduce((sum, haunt) => sum + haunt.returnPlayerRate, 0) / analytics.hauntBreakdown.length 
    : 0;

  const tierDistribution = [
    { name: 'Basic', value: analytics.totalHaunts - analytics.proHaunts - analytics.premiumHaunts },
    { name: 'Pro', value: analytics.proHaunts },
    { name: 'Premium', value: analytics.premiumHaunts }
  ];

  const COLORS = ['#64748B', '#8B5CF6', '#F59E0B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">Global Analytics Dashboard</h1>
          <p className="text-lg text-gray-300">Platform-wide insights across all haunts</p>
          <Badge variant="outline" className="mt-2 text-red-400 border-red-400">
            Admin Access Only
          </Badge>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <Link href="/admin" className="text-purple-400 hover:text-purple-300 underline">
            Admin Panel
          </Link>
          <Link href="/analytics" className="text-purple-400 hover:text-purple-300 underline">
            Individual Analytics
          </Link>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics Dashboard
              </TabsTrigger>
              <TabsTrigger value="haunts" className="text-white data-[state=active]:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Haunt Management
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="mt-6">
            {/* Time Range Selector */}
            <div className="flex justify-center mb-6">
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                  <TabsTrigger value="7d" className="text-white data-[state=active]:bg-purple-600">Last 7 Days</TabsTrigger>
                  <TabsTrigger value="30d" className="text-white data-[state=active]:bg-purple-600">Last 30 Days</TabsTrigger>
                  <TabsTrigger value="90d" className="text-white data-[state=active]:bg-purple-600">Last 90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Platform Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Haunts</CardTitle>
                  <Building className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics.totalHaunts}</div>
                  <p className="text-xs text-gray-400">
                    {analytics.proHaunts} Pro, {analytics.premiumHaunts} Premium
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Games</CardTitle>
                  <Gamepad2 className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalGames.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">
                    Across all haunts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalPlayers.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">
                    Unique players
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Avg Return Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{avgReturnRate.toFixed(1)}%</div>
                  <p className="text-xs text-gray-400">
                    Player retention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tier Distribution */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Subscription Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tierDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Haunts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.hauntBreakdown.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Bar dataKey="totalGames" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Detailed Haunt Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3">Haunt</th>
                        <th className="text-left p-3">Tier</th>
                        <th className="text-right p-3">Games</th>
                        <th className="text-right p-3">Players</th>
                        <th className="text-right p-3">Return Rate</th>
                        <th className="text-right p-3">Ad CTR</th>
                        <th className="text-right p-3">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.hauntBreakdown.map((haunt) => (
                        <tr key={haunt.hauntId} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-white">{haunt.name}</div>
                              <div className="text-xs text-gray-400">{haunt.hauntId}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant={haunt.tier === 'premium' ? 'default' : haunt.tier === 'pro' ? 'secondary' : 'outline'}
                              className={
                                haunt.tier === 'premium' ? 'bg-yellow-600' : 
                                haunt.tier === 'pro' ? 'bg-purple-600' : 
                                'border-gray-600'
                              }
                            >
                              {haunt.tier}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">{haunt.totalGames.toLocaleString()}</td>
                          <td className="p-3 text-right">{haunt.uniquePlayers.toLocaleString()}</td>
                          <td className="p-3 text-right">{haunt.returnPlayerRate.toFixed(1)}%</td>
                          <td className="p-3 text-right">{haunt.adClickThrough.toFixed(1)}%</td>
                          <td className="p-3 text-right">{haunt.competitiveMetrics.averageScore.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="haunts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Haunt List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Select Haunt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(hauntConfigs).map(([hauntId, config]) => (
                      <Button
                        key={hauntId}
                        variant={selectedHaunt === hauntId ? "default" : "outline"}
                        className={`w-full justify-start ${
                          selectedHaunt === hauntId 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "border-slate-600 text-gray-300 hover:bg-slate-700"
                        }`}
                        onClick={() => setSelectedHaunt(hauntId)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{config.name}</span>
                          <span className="text-xs opacity-70">{hauntId}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Visual Skins Editor */}
              {selectedHaunt && (
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Visual Skins - {hauntConfigs[selectedHaunt]?.name || selectedHaunt}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Background Image Upload */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">Background Image</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleBackgroundUpload(selectedHaunt, file);
                              }
                            }}
                            className="bg-slate-700 border-slate-600 text-white"
                            disabled={uploadingBackground}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={uploadingBackground}
                            className="border-slate-600 text-gray-300"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingBackground ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        {hauntConfigs[selectedHaunt]?.theme?.background && (
                          <div className="text-sm text-gray-400">
                            Current: {hauntConfigs[selectedHaunt]?.theme?.background}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar Theme */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">Progress Bar Theme</Label>
                        <Select
                          value={hauntConfigs[selectedHaunt]?.theme?.progressBar || "default"}
                          onValueChange={(value) => updateHauntTheme(selectedHaunt, { progressBar: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select progress bar theme" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="default" className="text-white hover:bg-slate-600">
                              Default - Solid Fill
                            </SelectItem>
                            <SelectItem value="lightning" className="text-white hover:bg-slate-600">
                              Lightning - Electric Blue Bolts
                            </SelectItem>
                            <SelectItem value="blood" className="text-white hover:bg-slate-600">
                              Blood - Dripping Red Bar
                            </SelectItem>
                            <SelectItem value="chains" className="text-white hover:bg-slate-600">
                              Chains - Animated Chain Links
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preview Section */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">Theme Preview</Label>
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <div className="text-sm text-gray-300 mb-2">Progress Bar Preview:</div>
                          <div className="w-full h-6 bg-slate-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full w-3/5 ${
                                hauntConfigs[selectedHaunt]?.theme?.progressBar === 'lightning' 
                                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
                                  : hauntConfigs[selectedHaunt]?.theme?.progressBar === 'blood'
                                  ? 'bg-gradient-to-r from-red-600 to-red-400'
                                  : hauntConfigs[selectedHaunt]?.theme?.progressBar === 'chains'
                                  ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                                  : 'bg-gradient-to-r from-purple-600 to-purple-400'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}