import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, UsersIcon, TrendingUpIcon, TargetIcon, MousePointerClickIcon, GroupIcon } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  adClickThrough: number;
  bestQuestions: Array<{
    question: string;
    correctRate: number;
    pack: string;
  }>;
  competitiveMetrics: {
    averageScore: number;
    topScore: number;
    participationRate: number;
  };
  averageGroupSize: number;
  timeRangeData: {
    daily: Array<{ date: string; games: number; players: number; }>;
    weekly: Array<{ week: string; games: number; players: number; }>;
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [hauntId, setHauntId] = useState<string>("headquarters"); // Default haunt

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", hauntId, timeRange],
    enabled: !!hauntId,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-lg text-gray-300">Track your haunt's performance and player engagement</p>
          <Badge variant="outline" className="mt-2 text-purple-300 border-purple-300">
            Pro/Premium Feature
          </Badge>
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Games Played</CardTitle>
              <CalendarIcon className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.totalGames || 0}</div>
              <p className="text-xs text-gray-400">Games completed in selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Unique Players</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.uniquePlayers || 0}</div>
              <p className="text-xs text-gray-400">Individual players who participated</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Return Player Rate</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.returnPlayerRate || 0}%</div>
              <p className="text-xs text-gray-400">Players who came back to play again</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Ad Click-Through Rate</CardTitle>
              <MousePointerClickIcon className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.adClickThrough || 0}%</div>
              <p className="text-xs text-gray-400">Ads clicked vs ads shown</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Average Group Size</CardTitle>
              <GroupIcon className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.averageGroupSize || 0}</div>
              <p className="text-xs text-gray-400">Players per group session</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Competitive Score</CardTitle>
              <TargetIcon className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analyticsData?.competitiveMetrics?.averageScore || 0}</div>
              <p className="text-xs text-gray-400">Average score across all games</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Performing Questions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Questions</CardTitle>
              <CardDescription className="text-gray-400">
                Questions with highest correct answer rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.bestQuestions?.map((question, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium line-clamp-2">{question.question}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {question.pack.charAt(0).toUpperCase() + question.pack.slice(1)} Pack
                      </Badge>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-400">{question.correctRate}%</div>
                      <div className="text-xs text-gray-400">Correct Rate</div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-400 text-center py-4">No question data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Competitive Engagement */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Competitive Engagement</CardTitle>
              <CardDescription className="text-gray-400">
                Player performance and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Average Score</span>
                  <span className="text-xl font-bold text-purple-400">
                    {analyticsData?.competitiveMetrics?.averageScore || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Highest Score</span>
                  <span className="text-xl font-bold text-yellow-400">
                    {analyticsData?.competitiveMetrics?.topScore || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="text-white">Participation Rate</span>
                  <span className="text-xl font-bold text-green-400">
                    {analyticsData?.competitiveMetrics?.participationRate || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro/Premium Feature Notice */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-600 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-300 mb-4">
                Track your haunt's performance with detailed analytics including player engagement, 
                question performance, and revenue metrics.
              </p>
              <Badge variant="outline" className="text-purple-300 border-purple-300">
                Available in Pro & Premium Tiers
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}