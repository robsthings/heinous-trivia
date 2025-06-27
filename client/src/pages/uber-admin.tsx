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


  useEffect(() => {
    const fetchGlobalAnalytics = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching analytics...');
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        console.log('📊 Analytics data:', data);
        setAnalytics(data);
        
        // Load haunt configurations - get all haunts directly for the skins editor
        try {
          console.log('🏚️ Fetching haunts...');
          const hauntsResponse = await fetch('/api/haunts');
          if (hauntsResponse.ok) {
            const allHaunts = await hauntsResponse.json();
            console.log('🏚️ Haunts data:', allHaunts);
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
            console.log('⚙️ Haunt configs:', configs);
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
      <div >
        <div >
          <div >Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div >
        <div >
          <div >Failed to load analytics data</div>
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
    <div >
      <div >
        <div  style={{textAlign: "center"}}>
          <h1 >Global Analytics Dashboard</h1>
          <p >Platform-wide insights across all haunts</p>
          <Badge variant="outline" >
            Admin Access Only
          </Badge>
        </div>

        {/* Navigation */}
        <div  style={{marginBottom: "1.5rem"}}>
          <Link href="/admin" >
            Admin Panel
          </Link>
          <Link href="/analytics" >
            Individual Analytics
          </Link>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="analytics" >
          <div  style={{marginBottom: "1.5rem"}}>
            <TabsList >
              <TabsTrigger value="analytics" >
                <TrendingUp  />
                Analytics Dashboard
              </TabsTrigger>
              <TabsTrigger value="haunts" >
                <Settings  />
                Haunt Management
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="analytics" >
            {/* Time Range Selector */}
            <div  style={{marginBottom: "1.5rem"}}>
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")} >
                <TabsList >
                  <TabsTrigger value="7d" >Last 7 Days</TabsTrigger>
                  <TabsTrigger value="30d" >Last 30 Days</TabsTrigger>
                  <TabsTrigger value="90d" >Last 90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Platform Overview Cards */}
            <div >
              <Card >
                <CardHeader >
                  <CardTitle >Total Haunts</CardTitle>
                  <Building  />
                </CardHeader>
                <CardContent>
                  <div >{analytics.totalHaunts}</div>
                  <p >
                    {analytics.proHaunts} Pro, {analytics.premiumHaunts} Premium
                  </p>
                </CardContent>
              </Card>

              <Card >
                <CardHeader >
                  <CardTitle >Total Games</CardTitle>
                  <Gamepad2  />
                </CardHeader>
                <CardContent>
                  <div >{totalGames.toLocaleString()}</div>
                  <p >
                    Across all haunts
                  </p>
                </CardContent>
              </Card>

              <Card >
                <CardHeader >
                  <CardTitle >Total Players</CardTitle>
                  <Users  />
                </CardHeader>
                <CardContent>
                  <div >{totalPlayers.toLocaleString()}</div>
                  <p >
                    Unique players
                  </p>
                </CardContent>
              </Card>

              <Card >
                <CardHeader >
                  <CardTitle >Avg Return Rate</CardTitle>
                  <TrendingUp  />
                </CardHeader>
                <CardContent>
                  <div >{avgReturnRate.toFixed(1)}%</div>
                  <p >
                    Player retention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Tables */}
            <div >
              {/* Tier Distribution */}
              <Card >
                <CardHeader>
                  <CardTitle >Subscription Tier Distribution</CardTitle>
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
              <Card >
                <CardHeader>
                  <CardTitle >Top Performing Haunts</CardTitle>
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
            <Card >
              <CardHeader>
                <CardTitle >Detailed Haunt Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div >
                  <table >
                    <thead>
                      <tr >
                        <th >Haunt</th>
                        <th >Tier</th>
                        <th >Games</th>
                        <th >Players</th>
                        <th >Return Rate</th>
                        <th >Ad CTR</th>
                        <th >Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.hauntBreakdown.map((haunt) => (
                        <tr key={haunt.hauntId} >
                          <td >
                            <div>
                              <div >{haunt.name}</div>
                              <div >{haunt.hauntId}</div>
                            </div>
                          </td>
                          <td >
                            <Badge 
                              variant={haunt.tier === 'premium' ? 'default' : haunt.tier === 'pro' ? 'secondary' : 'outline'}
                                haunt.tier === 'premium' ? 'bg-yellow-600' : 
                                haunt.tier === 'pro' ? 'bg-purple-600' : 
                                'border-gray-600'
                              }
                            >
                              {haunt.tier}
                            </Badge>
                          </td>
                          <td >{haunt.totalGames.toLocaleString()}</td>
                          <td >{haunt.uniquePlayers.toLocaleString()}</td>
                          <td >{haunt.returnPlayerRate.toFixed(1)}%</td>
                          <td >{haunt.adClickThrough.toFixed(1)}%</td>
                          <td >{haunt.competitiveMetrics.averageScore.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="haunts" >
            <div >
              {/* Haunt List */}
              <Card >
                <CardHeader>
                  <CardTitle >
                    <Building  />
                    Select Haunt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div >
                    {Object.entries(hauntConfigs).length === 0 ? (
                      <div >Loading haunts...</div>
                    ) : (
                      Object.entries(hauntConfigs).map(([hauntId, config]) => (
                        <Button
                          key={hauntId}
                          variant={selectedHaunt === hauntId ? "default" : "outline"}
                            selectedHaunt === hauntId 
                              ? "bg-purple-600 hover:bg-purple-700" 
                              : "border-slate-600 text-gray-300 hover:bg-slate-700"
                          }`}
                          onClick={() => setSelectedHaunt(hauntId)}
                        >
                          <div >
                            <span >{config.name}</span>
                            <span >{hauntId}</span>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visual Skins Editor */}
              {selectedHaunt && (
                <div >
                  <Card >
                    <CardHeader>
                      <CardTitle >
                        <Palette  />
                        Visual Skins - {hauntConfigs[selectedHaunt]?.name || selectedHaunt}
                      </CardTitle>
                    </CardHeader>
                    <CardContent >
                      {/* Background Image URL */}
                      <div >
                        <Label >Background Image URL</Label>
                        <Input
                          type="text"
                          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                          value={hauntConfigs[selectedHaunt]?.theme?.background || ''}
                          onChange={(e) => {
                            updateHauntTheme(selectedHaunt, { background: e.target.value });
                          }}
                          
                        />
                        <div >
                          Enter a direct URL to an image file. The image will be used as the background for this haunt.
                        </div>
                      </div>

                      {/* Progress Bar Theme */}
                      <div >
                        <Label >Progress Bar Theme</Label>
                        <Select
                          value={hauntConfigs[selectedHaunt]?.theme?.progressBar || "default"}
                          onValueChange={(value) => updateHauntTheme(selectedHaunt, { progressBar: value })}
                        >
                          <SelectTrigger >
                            <SelectValue placeholder="Select progress bar theme" />
                          </SelectTrigger>
                          <SelectContent >
                            <SelectItem value="default" >
                              Default - Solid Fill
                            </SelectItem>
                            <SelectItem value="lightning" >
                              Lightning - Electric Blue Bolts
                            </SelectItem>
                            <SelectItem value="blood" >
                              Blood - Dripping Red Bar
                            </SelectItem>
                            <SelectItem value="chains" >
                              Chains - Animated Chain Links
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preview Section */}
                      <div >
                        <Label >Theme Preview</Label>
                        <div >
                          <div >Progress Bar Preview:</div>
                          <div >
                            <div 
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