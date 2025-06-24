import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Target, TrendingUp, MousePointer } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  averageScore: number;
}

export default function AnalyticsSimple() {
  const [, params] = useRoute("/analytics/:hauntId");
  const hauntId = params?.hauntId || "headquarters";

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics", hauntId],
    queryFn: async () => {
      console.log(`🔍 Fetching analytics for ${hauntId}`);
      const response = await fetch(`/api/analytics/${hauntId}?timeRange=30d`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('📊 Frontend received analytics data:', data);
      console.log('📊 Ad engagement value:', data.adClickThrough);
      return data as AnalyticsData;
    },
    refetchInterval: 5000,
    staleTime: 0,
  });

  console.log('Analytics component rendering');
  console.log('Current analyticsData:', analyticsData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className=" text-white" style={{textAlign: "center"}}>
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
          <div className=" text-white" style={{textAlign: "center"}}>
            <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-red-400">Error loading analytics data: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className=" text-white mb-8" style={{textAlign: "center"}}>
          <h1 className="text-3xl font-bold mb-4 bg-green-600 p-4 rounded">SIMPLIFIED Analytics Dashboard</h1>
          <p className="text-gray-300">Haunt: {hauntId}</p>
          <p className="text-yellow-400 font-bold">New Component - Ad Engagement Fixed</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Games</CardTitle>
              <Trophy className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.totalGames || 0}</div>
              <p className="text-xs text-gray-400">Games completed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Unique Players</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.uniquePlayers || 0}</div>
              <p className="text-xs text-gray-400">Individual players</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
              <Target className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.averageScore || 0}</div>
              <p className="text-xs text-gray-400">Points per game</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Return Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.returnPlayerRate || 0}%</div>
              <p className="text-xs text-gray-400">Player retention</p>
            </CardContent>
          </Card>
        </div>

        {/* Ad Engagement Card */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-yellow-400" />
                Ad Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300">Ad Click-Through Rate</span>
                  </div>
                  <span className="text-white font-bold text-4xl bg-yellow-400 text-black px-4 py-2 rounded">
                    {analyticsData?.adClickThrough !== undefined ? `${analyticsData.adClickThrough}%` : 'LOADING...'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg">
          <h3 className="text-white font-medium mb-2">Debug Information</h3>
          <pre className="text-gray-300 text-sm overflow-x-auto">
            {JSON.stringify(analyticsData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}