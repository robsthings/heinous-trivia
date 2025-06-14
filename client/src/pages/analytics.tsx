import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, UsersIcon, TrendingUpIcon, TargetIcon, MousePointerClickIcon, GroupIcon, BarChart3Icon, PieChartIcon, ActivityIcon, AwardIcon } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  averageScore: number;
}

export default function Analytics() {
  const [, params] = useRoute("/analytics/:hauntId");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const hauntId = params?.hauntId || "headquarters";

  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics", hauntId, timeRange],
    queryFn: async () => {
      console.log(`Fetching analytics for haunt: ${hauntId}, timeRange: ${timeRange}`);
      const cacheBuster = Date.now();
      const response = await fetch(`/api/analytics/${hauntId}?timeRange=${timeRange}&t=${cacheBuster}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Analytics API Response:', data);
      return data;
    },
    enabled: !!hauntId,
    staleTime: 0,
    gcTime: 0
  });

  if (error) {
    console.error('Analytics Query Error:', error);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500/20 border-r-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-300 text-lg">Loading comprehensive analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-red-400">Error loading analytics data: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Analytics Data:', analyticsData);
  console.log('Total Games:', analyticsData?.totalGames);
  console.log('Ad Click Through:', analyticsData?.adClickThrough);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <BarChart3Icon className="w-4 h-4 mr-2" />
                  {hauntId}
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                  <ActivityIcon className="w-4 h-4 mr-2" />
                  Live Data
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                  Pro Feature
                </Badge>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-2 border border-white/10">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Games */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-200">Total Games</CardTitle>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analyticsData?.totalGames || 0}</div>
              <p className="text-xs text-blue-300 mt-1">Games completed</p>
            </CardContent>
          </Card>

          {/* Unique Players */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-green-200">Unique Players</CardTitle>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <UsersIcon className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analyticsData?.uniquePlayers || 0}</div>
              <p className="text-xs text-green-300 mt-1">Individual players</p>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-yellow-200">Average Score</CardTitle>
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <AwardIcon className="h-5 w-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analyticsData?.averageScore || 0}</div>
              <p className="text-xs text-yellow-300 mt-1">Points per game</p>
            </CardContent>
          </Card>

          {/* Ad Engagement - Highlighted */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30 backdrop-blur-sm ring-2 ring-purple-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">Ad Engagement</CardTitle>
              <div className="bg-purple-500/30 p-2 rounded-lg">
                <MousePointerClickIcon className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analyticsData?.adClickThrough || 0}%</div>
              <p className="text-xs text-purple-300 mt-1">Click-through rate</p>
              <div className="mt-2">
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-500/50">
                  High Performance
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Engagement Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <GroupIcon className="w-5 h-5 mr-2 text-blue-400" />
                Player Engagement
              </CardTitle>
              <CardDescription className="text-gray-300">
                Core engagement metrics that matter to your haunt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Total Players</span>
                    <span className="text-lg font-semibold text-white">{analyticsData?.uniquePlayers || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Return Players</span>
                    <span className="text-lg font-semibold text-white">{analyticsData?.uniquePlayers || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Return Rate</span>
                    <span className="text-lg font-semibold text-green-400">{analyticsData?.returnPlayerRate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Completion Rate</span>
                    <span className="text-lg font-semibold text-green-400">100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Return Rate</span>
                  <span className="text-white">{analyticsData?.returnPlayerRate || 0}%</span>
                </div>
                <Progress value={analyticsData?.returnPlayerRate || 0} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Completion Rate</span>
                  <span className="text-white">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Activity Insights Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <TrendingUpIcon className="w-5 h-5 mr-2 text-green-400" />
                Activity Insights
              </CardTitle>
              <CardDescription className="text-gray-300">
                When and how players engage with your haunt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <ActivityIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Avg. Session Time</span>
                  </div>
                  <span className="text-white font-semibold">10 min</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Daily Average</span>
                  </div>
                  <span className="text-white font-semibold">2 games</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <TargetIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Peak Activity</span>
                  </div>
                  <span className="text-white font-semibold">2025-06-13</span>
                </div>
                
                {/* Ad Engagement Highlight */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <MousePointerClickIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200">Ad Engagement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-lg">{analyticsData?.adClickThrough || 0}%</span>
                    <Badge className="bg-purple-500/30 text-purple-200 border-purple-500/50 text-xs">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            Analytics Dashboard • Pro/Premium Feature
          </p>
        </div>
      </div>
    </div>
  );
}