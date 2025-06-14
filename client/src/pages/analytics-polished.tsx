import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Target, TrendingUp, Trophy, Clock, Eye, MousePointer } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  averageScore: number;
  competitiveMetrics: {
    topScore: number;
    averageScore: number;
    participationRate: number;
  };
  engagementMetrics?: {
    totalPlayers: number;
    returningPlayers: number;
    returnRate: number;
    averageSessionTime: number;
    completionRate: number;
    peakDay: string;
    dailyAverage: number;
    playerSessions: Array<{
      playerName: string;
      sessions: number;
      totalScore: number;
      lastPlayed: any;
    }>;
  };
  questionAnalytics: Array<{
    question: string;
    correctRate: number;
    rank: string;
  }>;
  dailyStats: Array<{
    date: string;
    games: number;
    players: number;
  }>;
  leaderboard: Array<{
    date: string;
    playerName: string;
    score: number;
  }>;
}

export default function AnalyticsPolished() {
  const [, params] = useRoute("/analytics/:hauntId");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const hauntId = params?.hauntId || "headquarters";
  
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics", hauntId, timeRange],
    queryFn: async () => {
      console.log(`🔍 Fetching analytics for ${hauntId} with timeRange ${timeRange}`);
      const response = await fetch(`/api/analytics/${hauntId}?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('📊 Frontend received analytics data:', data);
      console.log('📊 Ad engagement value:', data.adClickThrough);
      return data as AnalyticsData;
    },
    enabled: !!hauntId,
    refetchInterval: 5000,
    staleTime: 0,
  });

  // Debug: Log component rendering
  console.log('Analytics component rendering, hauntId:', hauntId, 'timeRange:', timeRange);
  console.log('Current analyticsData:', analyticsData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <p>Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-red-400">Error loading analytics data: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Games",
      value: analyticsData?.totalGames || 0,
      icon: Trophy,
      description: "Games completed",
      color: "text-blue-400"
    },
    {
      title: "Unique Players",
      value: analyticsData?.uniquePlayers || 0,
      icon: Users,
      description: "Individual players",
      color: "text-green-400"
    },
    {
      title: "Average Score",
      value: analyticsData?.averageScore || 0,
      icon: Target,
      description: "Points per game",
      color: "text-purple-400"
    },
    {
      title: "Top Score",
      value: analyticsData?.competitiveMetrics?.topScore || 0,
      icon: TrendingUp,
      description: "Best performance",
      color: "text-yellow-400"
    }
  ];

  // Mock chart data for demonstration
  const dailyData = [
    { date: 'Mon', games: 3, players: 3 },
    { date: 'Tue', games: 2, players: 2 },
    { date: 'Wed', games: 4, players: 4 },
    { date: 'Thu', games: 2, players: 2 },
    { date: 'Fri', games: 3, players: 3 },
  ];

  const scoreDistribution = [
    { range: '0-500', count: 4, fill: '#8b5cf6' },
    { range: '500-1000', count: 6, fill: '#a78bfa' },
    { range: '1000+', count: 4, fill: '#c4b5fd' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-300">Haunt: {hauntId}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-white border-gray-600"
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="bg-slate-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{metric.title}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                      <p className="text-gray-500 text-xs">{metric.description}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Tables */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-gray-700">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
            <TabsTrigger value="engagement" className="text-white">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Activity Chart */}
              <Card className="bg-slate-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daily Activity</CardTitle>
                  <CardDescription className="text-gray-400">Games and players over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Bar dataKey="games" fill="#8b5cf6" name="Games" />
                      <Bar dataKey="players" fill="#06b6d4" name="Players" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card className="bg-slate-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Score Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Player performance ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ range, count }) => `${range}: ${count}`}
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
                <CardDescription className="text-gray-400">Detailed performance statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-purple-400">{analyticsData?.averageScore || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Top Score</p>
                    <p className="text-2xl font-bold text-yellow-400">{analyticsData?.competitiveMetrics?.topScore || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Participation Rate</p>
                    <p className="text-2xl font-bold text-green-400">{analyticsData?.competitiveMetrics?.participationRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Engagement Overview */}
              <Card className="bg-slate-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Player Engagement</CardTitle>
                  <CardDescription className="text-gray-400">Core engagement metrics that matter to your haunt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                        <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{analyticsData?.engagementMetrics?.totalPlayers || analyticsData?.uniquePlayers || 0}</p>
                        <p className="text-gray-400 text-sm">Total Players</p>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                        <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{analyticsData?.engagementMetrics?.returningPlayers || 0}</p>
                        <p className="text-gray-400 text-sm">Return Players</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Return Rate</span>
                        <span className="text-white font-medium">{analyticsData?.engagementMetrics?.returnRate || analyticsData?.returnPlayerRate || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(analyticsData?.engagementMetrics?.returnRate || analyticsData?.returnPlayerRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Completion Rate</span>
                        <span className="text-white font-medium">{analyticsData?.engagementMetrics?.completionRate || analyticsData?.competitiveMetrics?.participationRate || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-purple-400 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(analyticsData?.engagementMetrics?.completionRate || analyticsData?.competitiveMetrics?.participationRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Insights */}
              <Card className="bg-slate-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Activity Insights</CardTitle>
                  <CardDescription className="text-gray-400">When and how players engage with your haunt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-300">Avg. Session Time</span>
                      </div>
                      <span className="text-white font-medium">{analyticsData?.engagementMetrics?.averageSessionTime || 5} min</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">Daily Average</span>
                      </div>
                      <span className="text-white font-medium">{analyticsData?.engagementMetrics?.dailyAverage || Math.round((analyticsData?.totalGames || 0) / 7)} games</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        <span className="text-gray-300">Peak Activity</span>
                      </div>
                      <span className="text-white font-medium">{analyticsData?.engagementMetrics?.peakDay || 'Recent'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MousePointer className="h-5 w-5 text-yellow-400" />
                        <span className="text-gray-300">Ad Engagement</span>
                      </div>
                      <span className="text-white font-medium">{analyticsData?.adClickThrough || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Most Active Players */}
            {analyticsData?.engagementMetrics?.playerSessions && analyticsData.engagementMetrics.playerSessions.length > 0 && (
              <Card className="bg-slate-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Most Active Players</CardTitle>
                  <CardDescription className="text-gray-400">Your most engaged visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.engagementMetrics.playerSessions.slice(0, 5).map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' : 
                            index === 1 ? 'bg-gray-400 text-black' : 
                            index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{player.playerName}</p>
                            <p className="text-gray-400 text-sm">{player.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{player.totalScore}</p>
                          <p className="text-gray-400 text-sm">total score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Badge variant="outline" className="text-purple-300 border-purple-300">
            Analytics Dashboard - Pro/Premium Feature
          </Badge>
        </div>
      </div>
    </div>
  );
}