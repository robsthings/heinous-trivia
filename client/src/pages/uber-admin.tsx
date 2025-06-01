import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Gamepad2, Users, TrendingUp, Eye, MousePointer, Trophy, Building } from "lucide-react";
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

export default function UberAdmin() {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

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
      } catch (error) {
        console.error("Failed to load global analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Global Analytics Dashboard</h1>
            <p>Loading platform-wide analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Global Analytics Dashboard</h1>
            <p className="text-red-400">Failed to load analytics data. Please check your Firebase configuration.</p>
            <Link href="/admin" className="text-purple-400 hover:text-purple-300 underline mt-4 block">
              Return to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Haunts */}
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="totalGames" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Haunt Breakdown */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Haunts Performance</CardTitle>
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
      </div>
    </div>
  );
}