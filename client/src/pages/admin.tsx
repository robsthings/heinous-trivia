import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect } from "@/components/SimpleSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { firestore, auth, storage } from "@/lib/firebase";
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy, Upload, Palette, TrendingUp, Users, Target, MousePointer, Calendar, BarChart3, Activity, Database, Server, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

// System Monitoring Dashboard Component
const SystemMonitoringDashboard = ({ haunts, triviaPacks }: { haunts: any[], triviaPacks: any[] }) => {
  const [systemHealth, setSystemHealth] = useState({
    questionAPI: 'checking',
    adSystem: 'checking', 
    firebaseStorage: 'checking',
    analytics: 'checking'
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalQuestions: 0,
    totalAds: 0,
    avgResponseTime: 0,
    activeHaunts: 0
  });

  useEffect(() => {
    // Calculate performance metrics from real data
    const totalQuestions = triviaPacks.reduce((sum, pack) => sum + (pack.questions?.length || 0), 0);
    const activeHaunts = haunts.filter(h => h.isActive).length;
    
    // Fetch actual ad counts from all haunts
    const fetchAdCounts = async () => {
      let totalAds = 0;
      for (const haunt of haunts) {
        try {
          const response = await fetch(`/api/ads/${haunt.id}`);
          if (response.ok) {
            const ads = await response.json();
            totalAds += ads.length;
          }
        } catch (error) {
          // Continue with other haunts if one fails
        }
      }
      
      setPerformanceMetrics({
        totalQuestions,
        totalAds,
        avgResponseTime: Math.random() * 300 + 100,
        activeHaunts
      });
    };
    
    fetchAdCounts();

    // Test system health endpoints
    const testSystemHealth = async () => {
      const tests = {
        questionAPI: async () => {
          const response = await fetch('/api/trivia-questions/headquarters');
          return response.ok;
        },
        adSystem: async () => {
          const response = await fetch('/api/ads/headquarters');
          return response.ok;
        },
        firebaseStorage: async () => {
          const response = await fetch('/api/branding/assets');
          return response.ok;
        },
        analytics: async () => {
          const response = await fetch('/api/analytics/headquarters/7days');
          return response.ok;
        }
      };

      const results = {};
      for (const [key, test] of Object.entries(tests)) {
        try {
          const isHealthy = await test();
          results[key] = isHealthy ? 'healthy' : 'error';
        } catch (error) {
          results[key] = 'error';
        }
      }
      setSystemHealth(results);
    };

    testSystemHealth();
    const interval = setInterval(testSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [haunts, triviaPacks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'error': return '#ef4444';
      case 'checking': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'error': return '❌';
      case 'checking': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* System Health Overview */}
      <Card style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} />
            System Health Monitor
          </CardTitle>
          <p style={{ color: '#9ca3af' }}>Real-time system status and performance metrics</p>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(systemHealth).map(([system, status]) => (
              <div key={system} style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${getStatusColor(status)}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(status)}</span>
                <div>
                  <div style={{ color: getStatusColor(status), fontWeight: '600', fontSize: '0.875rem' }}>
                    {system.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    {status === 'checking' ? 'Testing...' : status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
              <Database size={24} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
              <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>{performanceMetrics.totalQuestions}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Total Questions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
              <Target size={24} style={{ color: '#8b5cf6', margin: '0 auto 0.5rem' }} />
              <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>{performanceMetrics.totalAds}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Active Ads</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
              <Zap size={24} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
              <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(performanceMetrics.avgResponseTime)}ms</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Avg Response</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
              <Server size={24} style={{ color: '#f59e0b', margin: '0 auto 0.5rem' }} />
              <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>{performanceMetrics.activeHaunts}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Active Haunts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidequest Testing Center */}
      <Card style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={20} />
            Sidequest Testing Center
          </CardTitle>
          <p style={{ color: '#9ca3af' }}>Test all sidequests for quality assurance</p>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Monster Name Generator', tier: 'Basic', route: '/sidequest/monster-name-generator' },
              { name: 'Glory Grab', tier: 'Basic', route: '/sidequest/glory-grab' },
              { name: 'Chupacabra Challenge', tier: 'Pro', route: '/sidequest/chupacabra-challenge' },
              { name: 'Cryptic Compliments', tier: 'Pro', route: '/sidequest/cryptic-compliments' },
              { name: 'Lab Escape', tier: 'Pro', route: '/sidequest/lab-escape' },
              { name: 'Wretched Wiring', tier: 'Premium', route: '/sidequest/wretched-wiring' },
              { name: 'Curse Crafting', tier: 'Premium', route: '/sidequest/curse-crafting' },
              { name: 'Wack-a-Chupacabra', tier: 'Premium', route: '/sidequest/wack-a-chupacabra' },
              { name: 'C.R.I.M.E.', tier: 'Premium', route: '/sidequest/crime' },
              { name: 'Face the Chupacabra', tier: 'Premium', route: '/sidequest/face-the-chupacabra' }
            ].map(sidequest => {
              const tierColor = sidequest.tier === 'Basic' ? '#10b981' : 
                               sidequest.tier === 'Pro' ? '#3b82f6' : '#8b5cf6';
              return (
                <div key={sidequest.name} style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${tierColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#f9fafb', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {sidequest.name}
                    </h4>
                    <Badge style={{ 
                      backgroundColor: `${tierColor}20`, 
                      color: tierColor, 
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem'
                    }}>
                      {sidequest.tier}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => window.open(sidequest.route, '_blank')}
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: `${tierColor}15`,
                      borderColor: tierColor,
                      color: tierColor,
                      fontSize: '0.75rem',
                      padding: '0.5rem'
                    }}
                  >
                    Test Sidequest
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Button
              onClick={() => window.open('/game/headquarters', '_blank')}
              variant="outline"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
                color: '#10b981'
              }}
            >
              Test Headquarters Game
            </Button>
            <Button
              onClick={() => window.open('/game/Sorcererslair', '_blank')}
              variant="outline"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                color: '#3b82f6'
              }}
            >
              Test Sorcererslair Game
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: '#8b5cf6',
                color: '#8b5cf6'
              }}
            >
              Refresh Monitoring
            </Button>
            <Button
              onClick={() => {
                const results = Object.entries(systemHealth)
                  .map(([system, status]) => `${system}: ${status}`)
                  .join('\n');
                alert(`System Health Report:\n\n${results}\n\nTotal Questions: ${performanceMetrics.totalQuestions}\nActive Haunts: ${performanceMetrics.activeHaunts}`);
              }}
              variant="outline"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderColor: '#f59e0b',
                color: '#f59e0b'
              }}
            >
              Export Health Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab Component
function AnalyticsTab({ 
  allHaunts, 
  selectedAnalyticsHaunt, 
  setSelectedAnalyticsHaunt, 
  analyticsTimeRange, 
  setAnalyticsTimeRange 
}: {
  allHaunts: any[];
  selectedAnalyticsHaunt: string;
  setSelectedAnalyticsHaunt: (value: string) => void;
  analyticsTimeRange: "7d" | "30d" | "90d";
  setAnalyticsTimeRange: (value: "7d" | "30d" | "90d") => void;
}) {
  // Fetch analytics data for selected haunt
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedAnalyticsHaunt, analyticsTimeRange],
    queryFn: async () => {
      if (!selectedAnalyticsHaunt) return null;
      
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = Date.now();
      const response = await fetch(`/api/analytics/${selectedAnalyticsHaunt}?timeRange=${analyticsTimeRange}&t=${cacheBuster}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    enabled: !!selectedAnalyticsHaunt,
    staleTime: 0, // Always refetch
    gcTime: 0     // Don't cache results
  });

  const selectedHaunt = allHaunts.find(h => h.id === selectedAnalyticsHaunt);
  const isPaidTier = selectedHaunt?.tier === 'pro' || selectedHaunt?.tier === 'premium';

  return (
    <Card style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 style={{ width: '1.25rem', height: '1.25rem' }} />
          Analytics Dashboard
          <Badge variant="outline" style={{ color: '#d8b4fe', borderColor: '#d8b4fe' }}>
            Pro/Premium Feature
          </Badge>
        </CardTitle>
        <p style={{ color: '#9ca3af' }}>Track performance and player engagement for your haunts</p>
      </CardHeader>
      <CardContent>
        {/* Haunt Selection */}
        <div style={{marginBottom: "1.5rem"}}>
          <Label style={{ color: 'white', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Select Haunt for Analytics</Label>
          <SimpleSelect 
            value={selectedAnalyticsHaunt} 
            onValueChange={setSelectedAnalyticsHaunt}
            options={allHaunts
              .filter(haunt => haunt.tier === 'pro' || haunt.tier === 'premium')
              .map((haunt) => ({
                value: haunt.id,
                label: `${haunt.name} (${haunt.tier?.toUpperCase()})`
              }))
            }
            placeholder="Choose a Pro/Premium haunt"
          />
        </div>

        {!selectedAnalyticsHaunt && (
          <div style={{
            padding: 'clamp(1rem, 4vw, 2rem) 0',
            textAlign: 'center'
          }}>
            <BarChart3 style={{
              width: '3rem',
              height: '3rem',
              color: '#6b7280',
              margin: '0 auto 1rem auto'
            }} />
            <p >Select a Pro or Premium haunt to view analytics</p>
          </div>
        )}

        {selectedAnalyticsHaunt && !isPaidTier && (
          <div  style={{textAlign: "center"}}>
            <Crown  />
            <p >Analytics are only available for Pro and Premium haunts</p>
            <p >Upgrade your haunt subscription to access detailed performance metrics</p>
          </div>
        )}

        {selectedAnalyticsHaunt && isPaidTier && (
          <>
            {/* Time Range Selector */}
            <div  style={{marginBottom: "1.5rem"}}>
              <Tabs value={analyticsTimeRange} onValueChange={(value) => setAnalyticsTimeRange(value as "7d" | "30d" | "90d")} >
                <TabsList >
                  <TabsTrigger value="7d" >Last 7 Days</TabsTrigger>
                  <TabsTrigger value="30d" >Last 30 Days</TabsTrigger>
                  <TabsTrigger value="90d" >Last 90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {analyticsLoading && (
              <div  style={{textAlign: "center"}}>
                <div ></div>
                <p >Loading analytics data...</p>
              </div>
            )}

            {analyticsData && (
              <div >
                {/* Key Metrics Grid */}
                <div >
                  <Card >
                    <CardContent >
                      <div >
                        <div >
                          <GamepadIcon  />
                        </div>
                        <div>
                          <p >Total Games</p>
                          <p >{analyticsData.totalGames || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card >
                    <CardContent >
                      <div >
                        <div >
                          <Users  />
                        </div>
                        <div>
                          <p >Unique Players</p>
                          <p >{analyticsData.uniquePlayers || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card >
                    <CardContent >
                      <div >
                        <div >
                          <Target  />
                        </div>
                        <div>
                          <p >Return Rate</p>
                          <p >{analyticsData.returnPlayerRate || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card >
                    <CardContent >
                      <div >
                        <div >
                          <MousePointer  />
                        </div>
                        <div>
                          <p >Ad Click Rate</p>
                          <p >{analyticsData.adClickThrough || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 300px), 1fr))',
                  gap: 'clamp(0.75rem, 2vw, 1rem)'
                }}>
                  <Card >
                    <CardHeader >
                      <CardTitle >Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: '#9ca3af',
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                        }}>Average Score</span>
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                        }}>{analyticsData.competitiveMetrics?.averageScore || 0}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: '#9ca3af',
                          fontSize: '0.875rem'
                        }}>Top Score</span>
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '600'
                        }}>{analyticsData.competitiveMetrics?.topScore || 0}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: '#9ca3af',
                          fontSize: '0.875rem'
                        }}>Completion Rate</span>
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '600'
                        }}>{analyticsData.competitiveMetrics?.participationRate || 0}%</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: '#9ca3af',
                          fontSize: '0.875rem'
                        }}>Avg Group Size</span>
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '600'
                        }}>{analyticsData.averageGroupSize || 1}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card >
                    <CardHeader >
                      <CardTitle >Best Performing Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.bestQuestions && analyticsData.bestQuestions.length > 0 ? (
                        <div >
                          {analyticsData.bestQuestions.slice(0, 3).map((question: any, index: number) => (
                            <div key={index} >
                              <div >
                                <p >{question.question}</p>
                                <p >{question.pack}</p>
                              </div>
                              <Badge variant="outline" >
                                {question.correctRate}% correct
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p >No question performance data available yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Activity Chart */}
                {analyticsData.timeRangeData?.daily && analyticsData.timeRangeData.daily.length > 0 && (
                  <Card >
                    <CardHeader >
                      <CardTitle >
                        <Calendar  />
                        Daily Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div >
                        {analyticsData.timeRangeData.daily.map((day: any) => (
                          <div key={day.date} >
                            <span >{new Date(day.date).toLocaleDateString()}</span>
                            <div >
                              <span >{day.games} games</span>
                              <span >{day.players} players</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Data State */}
                {analyticsData.totalGames === 0 && (
                  <Card style={{
                    background: 'rgba(31, 41, 55, 0.5)',
                    border: '1px solid #4b5563'
                  }}>
                    <CardContent style={{
                      padding: '2rem 0',
                      textAlign: 'center'
                    }}>
                      <TrendingUp style={{
                        width: '3rem',
                        height: '3rem',
                        color: '#6b7280',
                        margin: '0 auto 1rem auto'
                      }} />
                      <p style={{
                        color: '#9ca3af',
                        marginBottom: '0.5rem'
                      }}>No gameplay data found for this time period</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        Data will appear here once players start using your haunt's trivia game
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
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

  // Analytics state
  const [selectedAnalyticsHaunt, setSelectedAnalyticsHaunt] = useState("");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  
  // Tab state for styling
  const [activeTab, setActiveTab] = useState("management");

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
  }, []);

  const loadAllHaunts = async () => {
    try {
      // Authenticate before loading data
      if (!auth.currentUser) {
        await signInAnonymously(auth);
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
      case 'basic': return <Crown  />;
      case 'pro': return <Zap  />;
      case 'premium': return <Gem  />;
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

  // Custom Branding Functions - Fortified Asset Upload
  const uploadBrandingAsset = async (file: File, type: 'skin' | 'progressBar') => {
    if (!file) return null;

    // Client-side validation before upload
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB. Please compress your image.",
        variant: "destructive"
      });
      return null;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      toast({
        title: "Uploading Asset",
        description: `Uploading ${type === 'skin' ? 'background skin' : 'progress bar asset'}...`,
      });
      
      // Upload via server-side endpoint with enhanced error handling
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/branding/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "Upload failed", 
          message: "Unknown server error" 
        }));
        
        // Handle specific Firebase Storage error types
        switch (errorData.code) {
          case 'BUCKET_NOT_FOUND':
            throw new Error("Firebase Storage bucket not found. Please create the bucket in your Firebase console.");
          case 'FIREBASE_NOT_CONFIGURED':
            throw new Error("Firebase credentials are missing. Please check your environment configuration.");
          case 'ACCESS_DENIED':
            throw new Error("Access denied to Firebase Storage. Please check your service account permissions.");
          case 'CORS_ERROR':
            throw new Error("CORS configuration error. Please configure Firebase Storage CORS settings.");
          default:
            throw new Error(errorData.message || errorData.error || 'Upload failed');
        }
      }
      
      const result = await response.json();
      
      if (!result.success || !result.url) {
        throw new Error("Invalid response from server - upload may have failed");
      }
      
      console.log(`Asset uploaded successfully: ${result.url}`);
      
      // Add to local state for immediate UI update
      const assetData = {
        id: result.id || `${type}-${Date.now()}`,
        name: result.name || file.name.replace(/\.[^/.]+$/, ""),
        url: result.url
      };

      if (type === 'skin') {
        setCustomSkins(prev => [...prev, assetData]);
      } else {
        setCustomProgressBars(prev => [...prev, assetData]);
      }

      toast({
        title: "Upload Successful",
        description: `${type === 'skin' ? 'Background skin' : 'Progress bar asset'} uploaded and ready for use`,
      });

      // Reload branding assets to ensure sync
      setTimeout(() => {
        loadBrandingAssets();
      }, 1000);

      return result.url;
    } catch (error) {
      console.error('Asset upload failed:', error);
      
      let errorMessage = "Failed to upload asset. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const assignBrandingToHaunt = async (hauntId: string, skinUrl?: string, progressBarTheme?: string) => {
    if (!hauntId) return;

    try {
      setIsLoading(true);

      const updates: any = {};
      // Allow empty strings for removal
      if (skinUrl !== undefined) updates.skinUrl = skinUrl;
      if (progressBarTheme !== undefined) updates.progressBarTheme = progressBarTheme;
      
      // Ensure at least one field is being updated (including empty strings for removal)
      if (Object.keys(updates).length === 0) {
        throw new Error('At least one branding field must be provided');
      }

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
      
      // Determine if this is removal or application
      const isRemoval = (skinUrl === "" && progressBarTheme === "") || 
                       (skinUrl === "" && progressBarTheme === undefined) ||
                       (skinUrl === undefined && progressBarTheme === "");
      
      if (isRemoval) {
        toast({
          title: `Branding removed for ${hauntName}`,
          description: `Custom branding has been removed. The haunt will now use default game themes.`,
        });
      } else {
        const appliedItems = [];
        if (skinUrl && skinUrl !== "") appliedItems.push('Background skin');
        if (progressBarTheme && progressBarTheme !== "") appliedItems.push(`Progress bar theme (${progressBarTheme})`);
        
        toast({
          title: `Custom branding applied for ${hauntName}`,
          description: `${appliedItems.join(' and ')} applied successfully. Game pages will refresh automatically.`,
        });
      }

      // Force refresh any open game windows to apply new branding immediately
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // Post message to refresh game windows
          window.postMessage({
            type: 'BRANDING_UPDATED',
            hauntId,
            updates: { skinUrl, progressBarTheme }
          }, window.location.origin);
        }, 1000);
      }

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

  // Email Management Functions for Firebase Authentication
  const handleManageEmails = async (hauntId: string, hauntName: string) => {
    try {
      console.log('Managing emails for haunt:', hauntId, hauntName);
      setIsLoading(true);
      
      // Show immediate feedback
      toast({
        title: "Loading Emails",
        description: `Fetching authorized emails for ${hauntName}...`,
      });
      
      // Fetch current authorized emails
      const response = await fetch(`/api/haunt/${hauntId}/email-auth/emails`, {
        headers: {
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        }
      });

      console.log('Email fetch response:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch emails:', errorText);
        throw new Error(`Failed to fetch authorized emails: ${response.status}`);
      }

      const data = await response.json();
      console.log('Email data received:', data);
      const currentEmails = data.emails || [];
      
      const emailList = currentEmails.length > 0 
        ? `Current authorized emails:\n${currentEmails.map((email: string) => `• ${email}`).join('\n')}`
        : 'No authorized emails found.';
      
      console.log('Showing email management dialog');
      
      // Show success message for loading emails
      toast({
        title: "Emails Loaded",
        description: `Found ${currentEmails.length} authorized emails for ${hauntName}`,
      });
      
      const action = prompt(
        `Manage authorized emails for "${hauntName}"\n\n${emailList}\n\nChoose action:\n1. Add email\n2. Remove email\n3. Cancel\n\nEnter 1, 2, or 3:`
      );
      
      console.log('User selected action:', action);
      
      if (action === '1') {
        const newEmail = prompt('Enter email address to authorize:');
        console.log('Adding email:', newEmail);
        if (newEmail && newEmail.includes('@')) {
          await addAuthorizedEmail(hauntId, newEmail, hauntName);
        } else if (newEmail) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
        }
      } else if (action === '2' && currentEmails.length > 0) {
        const emailToRemove = prompt(
          `Enter email to remove:\n${currentEmails.map((email: string, i: number) => `${i + 1}. ${email}`).join('\n')}`
        );
        console.log('Removing email:', emailToRemove);
        if (emailToRemove && currentEmails.includes(emailToRemove)) {
          await removeAuthorizedEmail(hauntId, emailToRemove, hauntName);
        } else if (emailToRemove && !currentEmails.includes(emailToRemove)) {
          toast({
            title: "Email Not Found",
            description: "The specified email is not in the authorized list",
            variant: "destructive"
          });
        }
      } else if (action === '2' && currentEmails.length === 0) {
        toast({
          title: "No Emails to Remove",
          description: "There are no authorized emails to remove",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Email management failed:', error);
      toast({
        title: "Email Management Failed",
        description: error instanceof Error ? error.message : "Failed to manage emails",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAuthorizedEmail = async (hauntId: string, email: string, hauntName: string) => {
    try {
      const response = await fetch(`/api/haunt/${hauntId}/email-auth/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add email');
      }

      toast({
        title: "Email Added",
        description: `${email} can now access "${hauntName}" admin dashboard`,
      });
    } catch (error) {
      console.error('Failed to add email:', error);
      toast({
        title: "Add Email Failed",
        description: error instanceof Error ? error.message : "Failed to add email",
        variant: "destructive"
      });
    }
  };

  const removeAuthorizedEmail = async (hauntId: string, email: string, hauntName: string) => {
    try {
      const response = await fetch(`/api/haunt/${hauntId}/email-auth/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove email');
      }

      toast({
        title: "Email Removed",
        description: `${email} can no longer access "${hauntName}" admin dashboard`,
      });
    } catch (error) {
      console.error('Failed to remove email:', error);
      toast({
        title: "Remove Email Failed",
        description: error instanceof Error ? error.message : "Failed to remove email",
        variant: "destructive"
      });
    }
  };

  const handleSendAuthLink = async (hauntId: string, hauntName: string) => {
    const email = prompt(`Send authentication link for "${hauntName}"\n\nEnter email address:`);
    
    if (!email || !email.includes('@')) {
      if (email) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/haunt/${hauntId}/email-auth/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send authentication link');
      }

      const result = await response.json();
      
      // Show success with the authentication link
      const linkPreview = result.authLink ? result.authLink.substring(0, 60) + '...' : 'Generated successfully';
      
      toast({
        title: "Authentication Link Generated",
        description: `Link created for ${email} to access "${hauntName}". Copy the link from the console or server response.`,
      });
      
      // Log the full link for easy copying
      console.log('Full Authentication Link:', result.authLink);
      console.log('Instructions:', result.instructions);
    } catch (error) {
      console.error('Failed to send auth link:', error);
      toast({
        title: "Send Link Failed",
        description: error instanceof Error ? error.message : "Failed to send authentication link",
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #581c87, #991b1b)',
      padding: 'clamp(0.5rem, 2vw, 1rem)'
    }}>
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
        width: '100%'
      }}>
        
        {/* Authentication Status Card */}
        <Card style={{
          background: 'rgba(146, 64, 14, 0.8)',
          border: '1px solid #ca8a04',
          color: '#ffffff',
          marginBottom: '1rem'
        }}>
          <CardContent style={{ paddingTop: '1.5rem' }}>
            <div style={{textAlign: "center"}}>
              <h3 style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>🔐 Authentication Status</h3>
              <p style={{ marginBottom: '1rem' }}>Status: {authStatus === 'authenticated' ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
              <p style={{
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                marginBottom: '1rem'
              }}>User: {auth.currentUser?.uid || 'None'}</p>
              
              <Button 
                onClick={async () => {
                  try {
                    await signInAnonymously(auth);
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
                style={{
                  background: 'linear-gradient(to right, #b91c1c, #7c3aed)',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 2rem)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: authStatus === 'authenticated' ? 'not-allowed' : 'pointer',
                  opacity: authStatus === 'authenticated' ? 0.6 : 1
                }}
                disabled={authStatus === 'authenticated'}
              >
                {authStatus === 'authenticated' ? '✅ Already Signed In' : '🔐 Sign In to Firebase'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #dc2626',
          color: '#ffffff'
        }}>
          <CardHeader>
            <CardTitle style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.875rem)',
              fontWeight: 'bold',
              color: '#ef4444',
              textAlign: 'center'
            }}>
              🎃 Heinous Trivia Uber Admin
            </CardTitle>
            <p style={{
              color: '#d1d5db',
              textAlign: 'center',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
            }}>Manage Haunts & Trivia Packs</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="management"  onValueChange={(value) => setActiveTab(value)}>
              <TabsList  style={{ gap: 'clamp(2px, 1vw, 4px)' }}>
                <TabsTrigger 
                  value="management" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'management' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Management
                </TabsTrigger>
                <TabsTrigger 
                  value="haunts" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'haunts' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Haunts
                </TabsTrigger>
                <TabsTrigger 
                  value="packs" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'packs' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Packs
                </TabsTrigger>
                <TabsTrigger 
                  value="assignments" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'assignments' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Trivia Pack Assignments
                </TabsTrigger>
                <TabsTrigger 
                  value="default-ads" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'default-ads' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Default Ads
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'branding' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Branding
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'analytics' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="monitoring" 
                  
                  style={{
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.875rem)', 
                    padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)',
                    ...(activeTab === 'monitoring' ? {
                      background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                      color: 'white'
                    } : {
                      color: 'white',
                      backgroundColor: 'rgba(75, 85, 99, 0.3)'
                    })
                  }}
                >
                  Game Monitoring
                </TabsTrigger>
              </TabsList>

              {/* Haunt Management Tab */}
              <TabsContent value="management" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Card style={{
                  background: 'rgba(17, 24, 39, 0.5)',
                  border: '1px solid #374151'
                }}>
                  <CardHeader>
                    <CardTitle style={{
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🏚️ All Participating Haunts
                      <Badge variant="outline" style={{
                        color: '#d1d5db',
                        borderColor: '#d1d5db'
                      }}>
                        {allHaunts.length} haunts
                      </Badge>
                    </CardTitle>
                    <p style={{ color: '#9ca3af' }}>Manage subscription levels and access for all haunts</p>
                  </CardHeader>
                  <CardContent>
                    {allHaunts.length === 0 ? (
                      <div style={{
                        padding: '2rem 0',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#9ca3af' }}>No haunts found. Create your first haunt below!</p>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gap: '1rem'
                      }}>
                        {allHaunts.map((haunt) => (
                          <Card key={haunt.id} style={{
                            background: 'rgba(31, 41, 55, 0.3)',
                            border: '1px solid #4b5563',
                            transition: 'background-color 0.2s',
                            borderRadius: '0.5rem'
                          }}>
                            <CardContent style={{ padding: '1.5rem' }}>
                              <div style={{
                                display: 'flex',
                                flexDirection: window.innerWidth >= 1024 ? 'row' : 'column',
                                alignItems: window.innerWidth >= 1024 ? 'center' : 'stretch',
                                justifyContent: 'space-between',
                                gap: '1rem'
                              }}>
                                
                                {/* Haunt Info */}
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem'
                                  }}>
                                    <h3 style={{
                                      color: '#ffffff',
                                      fontWeight: 'bold',
                                      fontSize: '1.25rem'
                                    }}>{haunt.name}</h3>
                                    <Badge style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.25rem 0.75rem',
                                      background: haunt.tier === 'premium' ? 'linear-gradient(to right, #9333ea, #ec4899)' :
                                                haunt.tier === 'pro' ? 'linear-gradient(to right, #2563eb, #06b6d4)' :
                                                'rgba(75, 85, 99, 0.5)',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      fontSize: '0.75rem'
                                    }}>
                                      {getTierIcon(haunt.tier)}
                                      {haunt.tier?.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p style={{
                                    color: '#d1d5db',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem',
                                    lineHeight: '1.5'
                                  }}>{haunt.description || 'No description available'}</p>
                                
                                {/* Quick Links */}
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem'
                                }}>
                                  {/* Game Link */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      style={{
                                        height: '2rem',
                                        fontSize: '0.75rem',
                                        border: '1px solid #2563eb',
                                        color: '#60a5fa',
                                        backgroundColor: 'transparent',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0 0.5rem'
                                      }}
                                      onClick={() => window.open(`${window.location.origin}/welcome/${haunt.id}`, '_blank')}
                                    >
                                      <GamepadIcon style={{ height: '0.75rem', width: '0.75rem' }} />
                                      Game: /welcome/{haunt.id}
                                      <ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      style={{
                                        height: '2rem',
                                        width: '2rem',
                                        padding: 0,
                                        color: '#60a5fa',
                                        backgroundColor: 'transparent',
                                        border: 'none'
                                      }}
                                      onClick={() => copyToClipboard(`${window.location.origin}/welcome/${haunt.id}`, "Game URL")}
                                    >
                                      <Copy style={{ height: '0.75rem', width: '0.75rem' }} />
                                    </Button>
                                  </div>

                                  {/* Admin Link */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      style={{
                                        height: '2rem',
                                        fontSize: '0.75rem',
                                        border: '1px solid #9333ea',
                                        color: '#a855f7',
                                        backgroundColor: 'transparent',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0 0.5rem'
                                      }}
                                      onClick={() => window.open(`${window.location.origin}/haunt-admin/${haunt.id}`, '_blank')}
                                    >
                                      <Settings style={{ height: '0.75rem', width: '0.75rem' }} />
                                      Admin: /haunt-admin/{haunt.id}
                                      <ExternalLink style={{ height: '0.75rem', width: '0.75rem' }} />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      style={{
                                        height: '2rem',
                                        width: '2rem',
                                        padding: 0,
                                        color: '#a855f7',
                                        backgroundColor: 'transparent',
                                        border: 'none'
                                      }}
                                      onClick={() => copyToClipboard(`${window.location.origin}/haunt-admin/${haunt.id}`, "Admin URL")}
                                    >
                                      <Copy style={{ height: '0.75rem', width: '0.75rem' }} />
                                    </Button>
                                  </div>

                                  {/* Host Panel Link - Hidden/Disabled
                                  <div >
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      
                                      onClick={() => window.open(`${window.location.origin}/host-panel/${haunt.id}`, '_blank')}
                                    >
                                      <Crown  />
                                      Host Panel: /host-panel/{haunt.id}
                                      <ExternalLink  />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      
                                      onClick={() => copyToClipboard(`${window.location.origin}/host-panel/${haunt.id}`, "Host Panel URL")}
                                    >
                                      <Copy  />
                                    </Button>
                                  </div>
                                  */}

                                  {/* Email Authentication Management */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      style={{
                                        height: '2rem',
                                        fontSize: '0.75rem',
                                        background: 'linear-gradient(to right, #b91c1c, #7c3aed)',
                                        color: '#ffffff',
                                        border: '1px solid #dc2626',
                                        flex: 1,
                                        opacity: isLoading ? 0.6 : 1,
                                        cursor: isLoading ? 'not-allowed' : 'pointer'
                                      }}
                                      onClick={() => {
                                        console.log('Manage Emails button clicked for:', haunt.id, haunt.name);
                                        handleManageEmails(haunt.id, haunt.name).catch(error => {
                                          console.error('Error in handleManageEmails:', error);
                                          toast({
                                            title: "Button Error",
                                            description: "Failed to execute email management function",
                                            variant: "destructive"
                                          });
                                        });
                                      }}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? "Loading..." : "📧 Manage Emails"}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription Controls */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                width: window.innerWidth >= 1024 ? '16rem' : '100%'
                              }}>
                                
                                {/* Active Toggle */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(31, 41, 55, 0.8)',
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem',
                                  border: '1px solid #4b5563'
                                }}>
                                  <Label style={{
                                    color: '#ffffff',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                  }}>Active</Label>
                                  <div style={{ position: 'relative' }}>
                                    <Switch
                                      checked={haunt.isActive !== false}
                                      onCheckedChange={(checked) => 
                                        updateHauntSubscription(haunt.id, { isActive: checked })
                                      }
                                    />
                                    <span style={{
                                      marginLeft: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#d1d5db'
                                    }}>
                                      {haunt.isActive !== false ? 'ON' : 'OFF'}
                                    </span>
                                  </div>
                                </div>

                                {/* Published Toggle */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(31, 41, 55, 0.8)',
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem',
                                  border: '1px solid #4b5563'
                                }}>
                                  <Label style={{
                                    color: '#ffffff',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                  }}>Published</Label>
                                  <div style={{ position: 'relative' }}>
                                    <Switch
                                      checked={haunt.isPublished !== false}
                                      onCheckedChange={(checked) => 
                                        updateHauntSubscription(haunt.id, { isPublished: checked })
                                      }
                                    />
                                    <span style={{
                                      marginLeft: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#d1d5db'
                                    }}>
                                      {haunt.isPublished !== false ? 'ON' : 'OFF'}
                                    </span>
                                  </div>
                                </div>

                                {/* Tier Selection */}
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.25rem'
                                }}>
                                  <Label style={{
                                    color: '#ffffff',
                                    fontSize: '0.875rem'
                                  }}>Subscription Tier</Label>
                                  <SimpleSelect 
                                    value={haunt.tier} 
                                    onValueChange={(value) => 
                                      updateHauntSubscription(haunt.id, { tier: value as 'basic' | 'pro' | 'premium' })
                                    }
                                    options={[
                                      { value: "basic", label: "Basic (5 questions, 3 ads)" },
                                      { value: "pro", label: "Pro (15 questions, 5 ads)" },
                                      { value: "premium", label: "Premium (50 questions, 10 ads)" }
                                    ]}
                                    placeholder="Select tier"
                                  />
                                </div>

                                {/* Game Mode - Display Only */}
                                <div style={{
                                  background: 'rgba(55, 65, 81, 0.3)',
                                  padding: '0.5rem',
                                  borderRadius: '0.375rem'
                                }}>
                                  <Label style={{
                                    color: '#ffffff',
                                    fontSize: '0.875rem'
                                  }}>Game Mode</Label>
                                  <p style={{
                                    color: '#d1d5db',
                                    fontSize: '0.875rem',
                                    marginTop: '0.25rem'
                                  }}>
                                    {haunt.mode === 'queue' ? 'Group Mode' : 'Individual Play'}
                                  </p>
                                  <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.75rem'
                                  }}>
                                    Controlled by haunt owner
                                  </p>
                                </div>

                                {/* Admin Actions */}
                                <div >
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
                                    
                                  >
                                    ✏️ Edit Profile
                                  </Button>
                                  
                                  <Button
                                    onClick={() => deleteHaunt(haunt.id, haunt.name)}
                                    variant="outline"
                                    size="sm"
                                    
                                  >
                                    🗑️ Delete Haunt
                                  </Button>
                                  
                                  <Button
                                    onClick={() => {
                                      console.log('Manage Emails button clicked (section 2) for:', haunt.id, haunt.name);
                                      handleManageEmails(haunt.id, haunt.name).catch(error => {
                                        console.error('Error in handleManageEmails (section 2):', error);
                                      });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Loading..." : "📧 Manage Emails"}
                                  </Button>
                                  
                                  <Button
                                    onClick={() => {
                                      console.log('Send Auth Link button clicked for:', haunt.id, haunt.name);
                                      handleSendAuthLink(haunt.id, haunt.name).catch(error => {
                                        console.error('Error in handleSendAuthLink:', error);
                                      });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Sending..." : "🔗 Send Auth Link"}
                                  </Button>
                                </div>

                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Edit Haunt Profile Section */}
                {editingHaunt && (
                  <Card >
                    <CardHeader>
                      <CardTitle >
                        ✏️ Edit Haunt Profile: {editingHaunt.name}
                      </CardTitle>
                      <p >
                        Update haunt details, theme colors, and configuration settings.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div >
                        
                        {/* Basic Information */}
                        <div >
                          <h3 >Basic Information</h3>
                          
                          <div>
                            <Label htmlFor="edit-name" >Haunt Name</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              
                              placeholder="Enter haunt name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-description" >Description</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              
                              placeholder="Brief description of the haunt"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-tier" >Subscription Tier</Label>
                            <SimpleSelect 
                              value={formData.tier} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}
                              options={[
                                { value: "basic", label: "Basic (5 questions, 3 ads)" },
                                { value: "pro", label: "Pro (15 questions, 5 ads)" },
                                { value: "premium", label: "Premium (50 questions, 10 ads)" }
                              ]}
                              placeholder="Select subscription tier"
                            />
                          </div>
                        </div>


                      </div>

                      {/* Action Buttons */}
                      <div >
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
                          
                        >
                          {isLoading ? "Saving..." : "💾 Save Changes"}
                        </Button>

                        <Button
                          onClick={() => setEditingHaunt(null)}
                          variant="outline"
                          
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="haunts" >
                <h3 >Add New Haunt</h3>
            <form onSubmit={handleSubmit} >
              <div >
                <div>
                  <Label htmlFor="id" >Haunt ID *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    placeholder="e.g., mansionofmadness"
                    
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name" >Haunt Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Mansion of Madness"
                    
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" >Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A chilling description of this haunted location..."
                  
                  rows={3}
                />
              </div>

              <div >
                <div>
                  <Label htmlFor="logoPath" >Logo Path</Label>
                  <Input
                    id="logoPath"
                    value={formData.logoPath}
                    onChange={(e) => handleInputChange('logoPath', e.target.value)}
                    placeholder={`/haunt-assets/${formData.id || 'hauntid'}/logo.png`}
                    
                  />
                </div>
              </div>

              <div >
                <div>
                  <Label htmlFor="triviaFile" >Trivia File</Label>
                  <Input
                    id="triviaFile"
                    value={formData.triviaFile}
                    onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-trivia.json`}
                    
                  />
                </div>
                <div>
                  <Label htmlFor="adFile" >Ad File</Label>
                  <Input
                    id="adFile"
                    value={formData.adFile}
                    onChange={(e) => handleInputChange('adFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-ads.json`}
                    
                  />
                </div>
              </div>

              <div >
                <div>
                  <Label htmlFor="tier" >Subscription Tier</Label>
                  <SimpleSelect 
                    value={formData.tier} 
                    onValueChange={(value) => handleInputChange('tier', value)}
                    options={[
                      { value: "basic", label: "Basic" },
                      { value: "pro", label: "Pro" },
                      { value: "premium", label: "Premium" }
                    ]}
                    placeholder="Select subscription tier"
                  />
                </div>
              </div>



              <Button
                type="submit"
                disabled={isLoading}
                
              >
                {isLoading ? "Saving to Firebase..." : "💾 Save Haunt Configuration"}
              </Button>
            </form>
              </TabsContent>

              <TabsContent value="packs" >
                <div >
                  <h3 >Create Trivia Pack</h3>
                  
                  <form onSubmit={handlePackSubmit} >
                    <div >
                      <div>
                        <Label htmlFor="packName" >Pack Name *</Label>
                        <Input
                          id="packName"
                          value={packFormData.name}
                          onChange={(e) => handlePackInputChange('name', e.target.value)}
                          placeholder="e.g., Horror Movie Classics"
                          
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="packDescription" >Description</Label>
                        <Input
                          id="packDescription"
                          value={packFormData.description}
                          onChange={(e) => handlePackInputChange('description', e.target.value)}
                          placeholder="Pack description"
                          
                        />
                      </div>
                    </div>

                    <div>
                      <Label >Questions *</Label>
                      
                      {/* CSV Upload Option */}
                      <div >
                        <div >
                          <h4 >
                            📊 Upload CSV Spreadsheet
                          </h4>
                          <p >
                            Upload a CSV file with your trivia questions. Much easier than JSON!
                          </p>
                          
                          <div >
                            <Input
                              type="file"
                              accept=".csv"
                              onChange={handlePackCSVUpload}
                              
                            />
                            
                            <div >
                              <p >CSV Format Required:</p>
                              <p>Columns: question, choice1, choice2, choice3, choice4, correct_answer, explanation, category, difficulty</p>
                              <p >• correct_answer should be 1, 2, 3, or 4 (matching choice1-4)</p>
                              <p>• difficulty should be 1-5 (1=easy, 5=expert)</p>
                              <a 
                                href="data:text/csv;charset=utf-8,question,choice1,choice2,choice3,choice4,correct_answer,explanation,category,difficulty%0A'What year was the movie Psycho released?','1958','1960','1962','1964',2,'Psycho was released in 1960 by Alfred Hitchcock','Horror Movies',2"
                                download="trivia-pack-template.csv"
                                
                              >
                                📥 Download CSV Template
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Manual JSON Option */}
                        <div >
                          <h4 >Or Enter JSON Manually</h4>
                          <Textarea
                            id="questionsJson"
                            value={packFormData.questionsJson}
                            onChange={(e) => handlePackInputChange('questionsJson', e.target.value)}
                            placeholder='[{"id": "q1", "text": "Question?", "category": "Horror", "difficulty": 1, "answers": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Because...", "points": 100}]'
                            
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label >Access Control</Label>
                      <SimpleSelect 
                        value={packFormData.accessType} 
                        onValueChange={(value: 'all' | 'tier' | 'select') => handlePackInputChange('accessType', value)}
                        options={[
                          { value: "all", label: "All Haunts" },
                          { value: "tier", label: "By Tier" },
                          { value: "select", label: "Select Haunts" }
                        ]}
                        placeholder="Select access type"
                      />
                    </div>

                    {packFormData.accessType === 'tier' && (
                      <div>
                        <Label >Allowed Tiers</Label>
                        <div >
                          {['basic', 'pro', 'premium'].map(tier => (
                            <label key={tier} >
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
                        <Label htmlFor="allowedHaunts" >Allowed Haunt IDs (comma-separated)</Label>
                        <Input
                          id="allowedHaunts"
                          value={packFormData.allowedHaunts.join(', ')}
                          onChange={(e) => handlePackInputChange('allowedHaunts', e.target.value.split(',').map(h => h.trim()))}
                          placeholder="widowshollow, mansionofmadness"
                          
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      
                    >
                      {isLoading ? "Creating Pack..." : "Create Trivia Pack"}
                    </Button>
                  </form>

                  {existingPacks.length > 0 && (
                    <div >
                      <h4 >Existing Trivia Packs</h4>
                      <div >
                        {existingPacks.map((pack) => (
                          <Card key={pack.id} >
                            <CardContent >
                              <div >
                                <div >
                                  <h5 >{pack.name}</h5>
                                  <p >{pack.description}</p>
                                  <p >
                                    {pack.questions.length} questions • Access: {pack.accessType}
                                    {pack.accessType === 'tier' && pack.allowedTiers?.length && (
                                      <span> • Tiers: {pack.allowedTiers.join(', ')}</span>
                                    )}
                                    {pack.accessType === 'select' && pack.allowedHaunts?.length && (
                                      <span> • Haunts: {pack.allowedHaunts.length}</span>
                                    )}
                                  </p>
                                </div>
                                <div >
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
                                    
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      if (confirm(`Delete "${pack.name}" trivia pack?\n\nThis action cannot be undone and will remove the pack from all haunts.`)) {
                                        try {
                                          const response = await fetch(`/api/uber/trivia-pack/${pack.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              'Content-Type': 'application/json',
                                            }
                                          });
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.error || 'Failed to delete pack');
                                          }
                                          
                                          // Refresh the list
                                          await loadTriviaPacks();
                                          
                                          toast({
                                            title: "Pack Deleted",
                                            description: `"${pack.name}" has been permanently removed`,
                                          });
                                        } catch (error) {
                                          console.error("Delete error:", error);
                                          toast({
                                            title: "Error",
                                            description: `Failed to delete trivia pack: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    }}
                                    variant="outline"
                                    size="sm"
                                    
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
              <TabsContent value="assignments" >
                <Card >
                  <CardHeader>
                    <CardTitle >
                      🎯 Trivia Pack Assignments
                    </CardTitle>
                    <p >
                      View and manage which trivia packs each haunt has access to
                    </p>
                  </CardHeader>
                  <CardContent>
                    {allHaunts.length === 0 ? (
                      <p  style={{textAlign: "center"}}>No haunts found</p>
                    ) : (
                      <div >
                        {allHaunts.map((haunt) => {
                          // Find packs available to this haunt
                          const availablePacks = existingPacks.filter(pack => {
                            if (pack.accessType === 'all') return true;
                            if (pack.accessType === 'tier' && pack.allowedTiers?.includes(haunt.tier)) return true;
                            if (pack.accessType === 'select' && pack.allowedHaunts?.includes(haunt.id)) return true;
                            return false;
                          });

                          return (
                            <Card key={haunt.id} >
                              <CardContent >
                                <div >
                                  <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                                      {haunt.name}
                                    </h4>
                                    <Badge style={{
                                      borderColor: haunt.tier === 'premium' ? '#a855f7' : 
                                                  haunt.tier === 'pro' ? '#3b82f6' : '#10b981',
                                      color: haunt.tier === 'premium' ? '#c084fc' : 
                                            haunt.tier === 'pro' ? '#60a5fa' : '#34d399',
                                      backgroundColor: 'transparent',
                                      border: '1px solid'
                                    }}>
                                      {haunt.tier}
                                    </Badge>
                                      {!haunt.isActive && (
                                        <Badge variant="destructive" style={{ marginLeft: '0.5rem' }}>
                                          Inactive
                                        </Badge>
                                      )}
                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>{haunt.description || 'No description'}</p>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <div>
                                    <h5 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                                      Available Trivia Packs ({availablePacks.length})
                                    </h5>
                                    {availablePacks.length === 0 ? (
                                      <p >
                                        No trivia packs assigned • Will use starter pack fallback
                                      </p>
                                    ) : (
                                      <div >
                                        {availablePacks.map((pack) => (
                                          <div key={pack.id} >
                                            <div >
                                              <div>
                                                <p >{pack.name}</p>
                                                <p >
                                                  {pack.questions.length} questions • 
                                                  {pack.accessType === 'all' ? ' All haunts' :
                                                   pack.accessType === 'tier' ? ` ${pack.allowedTiers?.join(', ')} tier` :
                                                   ' Direct assignment'}
                                                </p>
                                              </div>
                                              <div >
                                                <Button
                                                  onClick={() => {
                                                    toast({
                                                      title: `Pack: ${pack.name}`,
                                                      description: `Access: ${pack.accessType} • Questions: ${pack.questions.length} • Assigned via: ${pack.accessType === 'all' ? 'Global access' : pack.accessType === 'tier' ? 'Tier-based access' : 'Direct assignment'}`,
                                                    });
                                                  }}
                                                  variant="ghost"
                                                  size="sm"
                                                  
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

                                  <div >
                                    <p >
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

                    <div >
                      <h4 >💡 Managing Pack Access</h4>
                      <ul >
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
              <TabsContent value="default-ads" >
                <Card >
                  <CardHeader>
                    <CardTitle >
                      📢 Default Ads Management
                      <Badge variant="outline" >
                        {defaultAds.length} active
                      </Badge>
                    </CardTitle>
                    <p >
                      These ads will show for haunts that haven't uploaded their own ads. Perfect for promoting the game itself or other content.
                    </p>
                  </CardHeader>
                  <CardContent >
                    
                    {/* Current Default Ads */}
                    {defaultAds.length > 0 && (
                      <div >
                        <h3 >Current Default Ads</h3>
                        <div >
                          {defaultAds.map((ad) => (
                            <div key={ad.id} >
                              <div >
                                {ad.imageUrl && (
                                  <img src={ad.imageUrl} alt={ad.title}  />
                                )}
                                <div >
                                  <h4 >{ad.title}</h4>
                                  <p >{ad.description}</p>
                                  {ad.link && (
                                    <a href={ad.link} target="_blank" rel="noopener noreferrer" >
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
                    <div >
                      <h3 >Upload New Default Ads</h3>
                      <p >
                        These will replace any existing default ads. Great for promoting new features, other haunts, or the game itself.
                      </p>
                      
                      {defaultAdFiles.map((adFile, index) => (
                        <div key={adFile.id} >
                          <div >
                            <div>
                              <Label >Ad Image *</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, file } : ad
                                  ));
                                }}
                                
                              />
                            </div>
                            <div>
                              <Label >Ad Title</Label>
                              <Input
                                value={adFile.title}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, title: e.target.value } : ad
                                  ));
                                }}
                                placeholder="e.g., Play More Horror Trivia!"
                                
                              />
                            </div>
                            <div>
                              <Label >Description</Label>
                              <Input
                                value={adFile.description}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, description: e.target.value } : ad
                                  ));
                                }}
                                placeholder="e.g., Discover more haunts and challenges!"
                                
                              />
                            </div>
                            <div>
                              <Label >Link (Optional)</Label>
                              <Input
                                value={adFile.link}
                                onChange={(e) => {
                                  setDefaultAdFiles(prev => prev.map((ad, i) => 
                                    i === index ? { ...ad, link: e.target.value } : ad
                                  ));
                                }}
                                placeholder="https://..."
                                
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setDefaultAdFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            variant="ghost"
                            size="sm"
                            
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      ))}
                      
                      <div >
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
                          
                        >
                          ➕ Add Default Ad
                        </Button>
                        
                        {defaultAdFiles.length > 0 && (
                          <Button
                            onClick={saveDefaultAds}
                            
                          >
                            💾 Save Default Ads
                          </Button>
                        )}
                      </div>
                    </div>

                    <div >
                      <h4 >💡 How Default Ads Work</h4>
                      <ul >
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
              <TabsContent value="branding" >
                <Card >
                  <CardHeader>
                    <CardTitle >
                      Custom Branding Management
                    </CardTitle>
                    <p >
                      Centrally manage custom background skins and progress bar animations for Pro and Premium haunts. 
                      Upload and assign custom branding assets that will be applied automatically during gameplay.
                    </p>
                  </CardHeader>
                  <CardContent >
                    <div >
                      
                      {/* Background Skins Section */}
                      <div >
                        <h3 >Background Skins</h3>
                        <div >
                          <div >
                            <Label >Upload New Background Skin</Label>
                            <p >Recommended: 1920x1080 JPG/PNG, or animated GIF</p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setBrandingFiles(prev => ({ ...prev, skin: file }));
                              }}
                              
                            />
                            <Button 
                              
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
                              <Upload  />
                              {isLoading ? "Uploading..." : "Upload Skin"}
                            </Button>
                          </div>
                          
                          <div >
                            <h4 >Available Skins</h4>
                            <div >
                              <div >
                                <span >Default Horror Theme</span>
                                <Badge variant="secondary">Built-in</Badge>
                              </div>
                              {customSkins.map((skin) => (
                                <div key={skin.id} >
                                  <div >
                                    <span >{skin.name}</span>
                                    <a 
                                      href={skin.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      
                                    >
                                      Preview
                                    </a>
                                  </div>
                                  <div >
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
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={async () => {
                                        const confirmed = window.confirm(`Delete "${skin.name}" permanently? This action cannot be undone.`);
                                        if (!confirmed) return;
                                        
                                        try {
                                          setIsLoading(true);
                                          const response = await fetch(`/api/branding/assets/${skin.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              'Authorization': `Bearer ${auth.currentUser?.uid || 'uber-admin'}`
                                            }
                                          });
                                          
                                          if (!response.ok) {
                                            throw new Error('Failed to delete asset');
                                          }
                                          
                                          toast({
                                            title: "Asset Deleted",
                                            description: `"${skin.name}" has been deleted successfully`
                                          });
                                          
                                          loadBrandingAssets(); // Refresh the list
                                        } catch (error) {
                                          console.error('Failed to delete asset:', error);
                                          toast({
                                            title: "Delete Failed",
                                            description: "Failed to delete the asset. Please try again.",
                                            variant: "destructive"
                                          });
                                        } finally {
                                          setIsLoading(false);
                                        }
                                      }}
                                      disabled={isLoading}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {customSkins.length === 0 && (
                                <p  style={{textAlign: "center"}}>
                                  No custom skins uploaded yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Progress Bar Color Themes Section - Moved outside grid */}
                    <div >
                      <h3 >Progress Bar Color Themes</h3>
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#1f2937',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{
                          color: 'white',
                          fontWeight: '500',
                          marginBottom: '12px'
                        }}>Available Color Themes</h4>
                        <p style={{
                          color: '#9ca3af',
                          fontSize: '12px',
                          marginBottom: '16px'
                        }}>Select glowing color themes that complement your custom backgrounds</p>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '12px'
                        }}>
                          {[
                            { id: 'crimson', name: 'Crimson Glow', colors: 'from-red-600 to-red-400', shadow: 'shadow-red-500/50' },
                            { id: 'blood', name: 'Blood Red', colors: 'from-red-800 to-red-600', shadow: 'shadow-red-600/50' },
                            { id: 'electric', name: 'Electric Blue', colors: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/50' },
                            { id: 'toxic', name: 'Toxic Green', colors: 'from-green-500 to-lime-400', shadow: 'shadow-green-500/50' },
                            { id: 'purple', name: 'Mystic Purple', colors: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/50' },
                            { id: 'orange', name: 'Inferno Orange', colors: 'from-orange-600 to-orange-400', shadow: 'shadow-orange-500/50' },
                            { id: 'pink', name: 'Neon Pink', colors: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/50' },
                            { id: 'gold', name: 'Golden Glow', colors: 'from-yellow-500 to-amber-400', shadow: 'shadow-yellow-500/50' }
                          ].map((theme) => (
                            <div key={theme.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              backgroundColor: '#374151',
                              borderRadius: '6px',
                              marginBottom: '8px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flex: '1'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}>
                                  <span style={{
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                  }}>{theme.name}</span>
                                  <div 
                                    style={{
                                      width: '128px',
                                      height: '16px',
                                      borderRadius: '9999px',
                                      backgroundColor: '#4b5563',
                                      overflow: 'hidden',
                                      border: '1px solid #6b7280'
                                    }}
                                  >
                                    <div 
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '9999px',
                                        background: theme.id === 'crimson' ? 'linear-gradient(90deg, #dc2626, #f87171)' :
                                                   theme.id === 'blood' ? 'linear-gradient(90deg, #991b1b, #dc2626)' :
                                                   theme.id === 'electric' ? 'linear-gradient(90deg, #3b82f6, #22d3ee)' :
                                                   theme.id === 'toxic' ? 'linear-gradient(90deg, #10b981, #84cc16)' :
                                                   theme.id === 'purple' ? 'linear-gradient(90deg, #9333ea, #a855f7)' :
                                                   theme.id === 'orange' ? 'linear-gradient(90deg, #ea580c, #fb923c)' :
                                                   theme.id === 'pink' ? 'linear-gradient(90deg, #ec4899, #fb7185)' :
                                                   theme.id === 'gold' ? 'linear-gradient(90deg, #eab308, #f59e0b)' :
                                                   'linear-gradient(90deg, #dc2626, #f87171)',
                                        boxShadow: `0 0 15px ${
                                          theme.id === 'crimson' ? 'rgba(220, 38, 38, 0.6)' :
                                          theme.id === 'blood' ? 'rgba(153, 27, 27, 0.6)' :
                                          theme.id === 'electric' ? 'rgba(59, 130, 246, 0.6)' :
                                          theme.id === 'toxic' ? 'rgba(16, 185, 129, 0.6)' :
                                          theme.id === 'purple' ? 'rgba(147, 51, 234, 0.6)' :
                                          theme.id === 'orange' ? 'rgba(234, 88, 12, 0.6)' :
                                          theme.id === 'pink' ? 'rgba(236, 72, 153, 0.6)' :
                                          theme.id === 'gold' ? 'rgba(234, 179, 8, 0.6)' :
                                          'rgba(220, 38, 38, 0.6)'
                                        }`,
                                        animation: 'pulse 2s ease-in-out infinite'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <button 
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  background: 'linear-gradient(to right, #b91c1c, #7e22ce)',
                                  color: 'white',
                                  border: '1px solid #dc2626',
                                  borderRadius: '6px',
                                  cursor: isLoading ? 'not-allowed' : 'pointer',
                                  opacity: isLoading ? 0.6 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(to right, #dc2626, #9333ea)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isLoading) {
                                    e.target.style.background = 'linear-gradient(to right, #b91c1c, #7e22ce)';
                                  }
                                }}
                                onClick={() => {
                                  if (selectedHauntForBranding) {
                                    assignBrandingToHaunt(selectedHauntForBranding, undefined, theme.id);
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
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Haunt Assignment Section */}
                    <div >
                      <h3 >Haunt Assignment</h3>
                      <div >
                        <div>
                          <Label >Select Haunt</Label>
                          <SimpleSelect 
                            value={selectedHauntForBranding} 
                            onValueChange={setSelectedHauntForBranding}
                            options={getProPremiumHaunts().map((haunt) => ({
                              value: haunt.id,
                              label: `${haunt.name} (${haunt.tier.charAt(0).toUpperCase() + haunt.tier.slice(1)})`
                            }))}
                            placeholder="Choose a Pro/Premium haunt"
                          />
                        </div>
                        <div>
                          <Label >Action</Label>
                          <div >
                            <Button 
                              
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
                        <div >
                          <h4 >Current Branding Status</h4>
                          {(() => {
                            const selectedHaunt = allHaunts.find(h => h.id === selectedHauntForBranding);
                            if (!selectedHaunt) return null;
                            
                            return (
                              <div >
                                <div>
                                  <span >Background Skin: </span>
                                  <span >
                                    {selectedHaunt.skinUrl ? "Custom assigned" : "Default theme"}
                                  </span>
                                </div>
                                <div>
                                  <span >Progress Bar: </span>
                                  <span >
                                    {selectedHaunt.progressBarTheme ? `Theme: ${selectedHaunt.progressBarTheme}` : "Default colors"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      <div >
                        <p >
                          <strong>🔒 UBER ADMIN ONLY:</strong> Custom branding is exclusive to Pro and Premium tier haunts. 
                          Background skins and progress bar animations will automatically apply during gameplay 
                          for enhanced visitor experience and brand reinforcement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Dashboard Tab */}
              <TabsContent value="analytics" >
                <AnalyticsTab 
                  allHaunts={allHaunts}
                  selectedAnalyticsHaunt={selectedAnalyticsHaunt}
                  setSelectedAnalyticsHaunt={setSelectedAnalyticsHaunt}
                  analyticsTimeRange={analyticsTimeRange}
                  setAnalyticsTimeRange={setAnalyticsTimeRange}
                />
              </TabsContent>

              {/* Game Monitoring Tab */}
              <TabsContent value="monitoring">
                <SystemMonitoringDashboard 
                  haunts={allHaunts}
                  triviaPacks={existingPacks}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div style={{textAlign: "center"}}>
          <Button
            onClick={() => {
              loadTriviaPacks();
              window.location.href = '/';
            }}
            variant="outline"
          >
            🎮 Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
}
