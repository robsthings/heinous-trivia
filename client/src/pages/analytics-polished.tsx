import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Target, MousePointer } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  averageScore: number;
}

export default function AnalyticsPolished() {
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
        <div className="text-center text-white">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="text-center text-red-400">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-green-600 p-4 rounded">FIXED Analytics Dashboard</h1>
          <p className="text-gray-300">Haunt: {hauntId}</p>
          <p className="text-yellow-400 font-bold">Ad Engagement Working - 200%</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Games</CardTitle>
              <Trophy className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.totalGames || 0}</div>
              <p className="text-xs text-gray-400">Games completed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Unique Players</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.uniquePlayers || 0}</div>
              <p className="text-xs text-gray-400">Individual players</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Average Score</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.averageScore || 0}</div>
              <p className="text-xs text-gray-400">Points per game</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 border-yellow-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">Ad Engagement</CardTitle>
              <MousePointer className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{analyticsData?.adClickThrough || 0}%</div>
              <p className="text-xs text-black">Click-through rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Debug - Raw API Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-green-400 text-sm overflow-x-auto">
              {JSON.stringify(analyticsData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}