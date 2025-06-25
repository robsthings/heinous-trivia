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
import { ExternalLink, Settings, GamepadIcon, Crown, Zap, Gem, Copy, Upload, Palette, TrendingUp, Users, Target, MousePointer, Calendar, BarChart3 } from "lucide-react";
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
          <Label style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Select Haunt for Analytics</Label>
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
          <div className=" py-8" style={{textAlign: "center"}}>
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Select a Pro or Premium haunt to view analytics</p>
          </div>
        )}

        {selectedAnalyticsHaunt && !isPaidTier && (
          <div className=" py-8" style={{textAlign: "center"}}>
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Analytics are only available for Pro and Premium haunts</p>
            <p className="text-sm text-gray-500">Upgrade your haunt subscription to access detailed performance metrics</p>
          </div>
        )}

        {selectedAnalyticsHaunt && isPaidTier && (
          <>
            {/* Time Range Selector */}
            <div className="flex justify-center " style={{marginBottom: "1.5rem"}}>
              <Tabs value={analyticsTimeRange} onValueChange={(value) => setAnalyticsTimeRange(value as "7d" | "30d" | "90d")} className="w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                  <TabsTrigger value="7d" className="text-white data-[state=active]:bg-red-600">Last 7 Days</TabsTrigger>
                  <TabsTrigger value="30d" className="text-white data-[state=active]:bg-red-600">Last 30 Days</TabsTrigger>
                  <TabsTrigger value="90d" className="text-white data-[state=active]:bg-red-600">Last 90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {analyticsLoading && (
              <div className=" py-8" style={{textAlign: "center"}}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            )}

            {analyticsData && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                          <GamepadIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Games</p>
                          <p className="text-white text-2xl font-bold">{analyticsData.totalGames || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600/20 rounded-lg">
                          <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Unique Players</p>
                          <p className="text-white text-2xl font-bold">{analyticsData.uniquePlayers || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                          <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Return Rate</p>
                          <p className="text-white text-2xl font-bold">{analyticsData.returnPlayerRate || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-600/20 rounded-lg">
                          <MousePointer className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Ad Click Rate</p>
                          <p className="text-white text-2xl font-bold">{analyticsData.adClickThrough || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Average Score</span>
                        <span className="text-white font-semibold">{analyticsData.competitiveMetrics?.averageScore || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Top Score</span>
                        <span className="text-white font-semibold">{analyticsData.competitiveMetrics?.topScore || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Completion Rate</span>
                        <span className="text-white font-semibold">{analyticsData.competitiveMetrics?.participationRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Avg Group Size</span>
                        <span className="text-white font-semibold">{analyticsData.averageGroupSize || 1}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600 md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">Best Performing Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.bestQuestions && analyticsData.bestQuestions.length > 0 ? (
                        <div className="space-y-2">
                          {analyticsData.bestQuestions.slice(0, 3).map((question: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                              <div className="flex-1">
                                <p className="text-white text-sm truncate">{question.question}</p>
                                <p className="text-gray-400 text-xs">{question.pack}</p>
                              </div>
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                {question.correctRate}% correct
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No question performance data available yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Activity Chart */}
                {analyticsData.timeRangeData?.daily && analyticsData.timeRangeData.daily.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Daily Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.timeRangeData.daily.map((day: any) => (
                          <div key={day.date} className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{new Date(day.date).toLocaleDateString()}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-white text-sm">{day.games} games</span>
                              <span className="text-gray-400 text-sm">{day.players} players</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Data State */}
                {analyticsData.totalGames === 0 && (
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className=" py-8" style={{textAlign: "center"}}>
                      <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No gameplay data found for this time period</p>
                      <p className="text-sm text-gray-500">
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
    loadDefaultAds();
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
      
      // Test if prompt is working
      const testPrompt = confirm(`Email management for "${hauntName}"\n\n${emailList}\n\nDo you want to continue?`);
      console.log('Test prompt result:', testPrompt);
      
      if (!testPrompt) {
        toast({
          title: "Cancelled",
          description: "Email management cancelled",
        });
        return;
      }
      
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

      toast({
        title: "Authentication Link Sent",
        description: `Email sent to ${email} for "${hauntName}" admin access`,
      });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Authentication Status Card */}
        <Card className="bg-yellow-900/80 border-yellow-600 text-white mb-4">
          <CardContent className="pt-6">
            <div style={{textAlign: "center"}}>
              <h3 className="text-xl font-bold mb-2">🔐 Authentication Status</h3>
              <p className="mb-4">Status: {authStatus === 'authenticated' ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
              <p className="text-sm mb-4">User: {auth.currentUser?.uid || 'None'}</p>
              
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
                className="bg-gradient-to-r from-red-700 to-purple-700 hover:from-red-600 hover:to-purple-600 text-lg px-8 py-3 text-white"
                disabled={authStatus === 'authenticated'}
              >
                {authStatus === 'authenticated' ? '✅ Already Signed In' : '🔐 Sign In to Firebase'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold  text-red-500" style={{textAlign: "center"}}>
              Heinous Trivia Uber Admin
            </CardTitle>
            <p className=" text-gray-300" style={{textAlign: "center"}}>Manage Haunts & Trivia Packs</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="management" className="w-full" onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 bg-gray-900/80 border border-gray-600 rounded-lg">
                <TabsTrigger 
                  value="management" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'management' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Management
                </TabsTrigger>
                <TabsTrigger 
                  value="haunts" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'haunts' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Haunts
                </TabsTrigger>
                <TabsTrigger 
                  value="packs" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'packs' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Packs
                </TabsTrigger>
                <TabsTrigger 
                  value="assignments" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'assignments' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Assignments
                </TabsTrigger>
                <TabsTrigger 
                  value="default-ads" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'default-ads' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Default Ads
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'branding' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Branding
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="text-xs md:text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-700/80 hover:text-white"
                  style={activeTab === 'analytics' ? {
                    background: 'linear-gradient(to right, rgb(185, 28, 28), rgb(126, 34, 206))',
                    color: 'white'
                  } : {
                    color: 'white',
                    backgroundColor: 'rgba(75, 85, 99, 0.3)'
                  }}
                >
                  Analytics
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
                      <div className=" py-8" style={{textAlign: "center"}}>
                        <p className="text-gray-400">No haunts found. Create your first haunt below!</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {allHaunts.map((haunt) => (
                          <Card key={haunt.id} className="bg-gray-800/30 border-gray-600 hover:bg-gray-800/50 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                
                                {/* Haunt Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-white font-bold text-xl">{haunt.name}</h3>
                                    <Badge className={`flex items-center gap-1 px-3 py-1 ${getTierColor(haunt.tier)}`}>
                                      {getTierIcon(haunt.tier)}
                                      {haunt.tier?.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{haunt.description || 'No description available'}</p>
                                
                                {/* Quick Links */}
                                <div className="space-y-2">
                                  {/* Game Link */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white flex-1"
                                      onClick={() => window.open(`${window.location.origin}/welcome/${haunt.id}`, '_blank')}
                                    >
                                      <GamepadIcon className="h-3 w-3 mr-1" />
                                      Game: /welcome/{haunt.id}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600 hover:text-white"
                                      onClick={() => copyToClipboard(`${window.location.origin}/welcome/${haunt.id}`, "Game URL")}
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

                                  {/* Host Panel Link - Hidden/Disabled
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
                                  */}

                                  {/* Email Authentication Management */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-8 text-xs bg-gradient-to-r from-red-700 to-purple-700 hover:from-red-600 hover:to-purple-600 text-white border-red-600 flex-1"
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
                              <div className="flex flex-col gap-3 lg:w-64">
                                
                                {/* Active Toggle */}
                                <div className="flex items-center justify-between bg-gray-800/80 p-3 rounded border border-gray-600">
                                  <Label className="text-white text-sm font-medium">Active</Label>
                                  <div className="relative">
                                    <Switch
                                      checked={haunt.isActive !== false}
                                      onCheckedChange={(checked) => 
                                        updateHauntSubscription(haunt.id, { isActive: checked })
                                      }
                                      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-500"
                                    />
                                    <span className="ml-2 text-xs text-gray-300">
                                      {haunt.isActive !== false ? 'ON' : 'OFF'}
                                    </span>
                                  </div>
                                </div>

                                {/* Published Toggle */}
                                <div className="flex items-center justify-between bg-gray-800/80 p-3 rounded border border-gray-600">
                                  <Label className="text-white text-sm font-medium">Published</Label>
                                  <div className="relative">
                                    <Switch
                                      checked={haunt.isPublished !== false}
                                      onCheckedChange={(checked) => 
                                        updateHauntSubscription(haunt.id, { isPublished: checked })
                                      }
                                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-500"
                                    />
                                    <span className="ml-2 text-xs text-gray-300">
                                      {haunt.isPublished !== false ? 'ON' : 'OFF'}
                                    </span>
                                  </div>
                                </div>

                                {/* Tier Selection */}
                                <div className="space-y-1">
                                  <Label className="text-white text-sm">Subscription Tier</Label>
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
                                    className="w-full bg-gradient-to-r from-red-700 to-purple-700 hover:from-red-600 hover:to-purple-600 text-white border-red-600"
                                  >
                                    ✏️ Edit Profile
                                  </Button>
                                  
                                  <Button
                                    onClick={() => deleteHaunt(haunt.id, haunt.name)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-red-700 to-purple-700 hover:from-red-600 hover:to-purple-600 text-white border-red-600"
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
                                    className="w-full bg-gradient-to-r from-red-700 to-purple-700 hover:from-red-600 hover:to-purple-600 text-white border-red-600"
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
                                    className="w-full bg-gradient-to-r from-blue-700 to-green-700 hover:from-blue-600 hover:to-green-600 text-white border-blue-600"
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
                      <p className="text-gray-400  py-8" style={{textAlign: "center"}}>No haunts found</p>
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
                      Custom Branding Management
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
                                  <div className="flex gap-2">
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
                                <p className="text-gray-400 text-sm  py-4" style={{textAlign: "center"}}>
                                  No custom skins uploaded yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Progress Bar Color Themes Section - Moved outside grid */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Progress Bar Color Themes</h3>
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
                    <div className="p-6 bg-gray-800 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Haunt Assignment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm font-medium mb-2 block">Select Haunt</Label>
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
                                  <span className={selectedHaunt.progressBarTheme ? "text-green-400" : "text-gray-400"}>
                                    {selectedHaunt.progressBarTheme ? `Theme: ${selectedHaunt.progressBarTheme}` : "Default colors"}
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

              {/* Analytics Dashboard Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab 
                  allHaunts={allHaunts}
                  selectedAnalyticsHaunt={selectedAnalyticsHaunt}
                  setSelectedAnalyticsHaunt={setSelectedAnalyticsHaunt}
                  analyticsTimeRange={analyticsTimeRange}
                  setAnalyticsTimeRange={setAnalyticsTimeRange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 " style={{textAlign: "center"}}>
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