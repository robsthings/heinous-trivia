import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, UsersIcon, TrendingUpIcon, TargetIcon, MousePointerClickIcon, GroupIcon, BarChart3Icon, PieChartIcon, ActivityIcon, AwardIcon, RefreshCwIcon } from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  completionRate: number;
  adClickThrough: number;
  avgSessionTime: number;
  dailyAverage: number;
  peakActivity: string;
}

interface AdData {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  timestamp: string;
}

interface AdPerformance extends AdData {
  views: number;
  clicks: number;
  ctr: number;
}

export default function Analytics() {
  const [, params] = useRoute("/analytics/:hauntId");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const hauntId = params?.hauntId || "headquarters";
  const queryClient = useQueryClient();

  const refreshData = () => {
    console.log('Refreshing analytics data...');
    queryClient.invalidateQueries({ queryKey: ["analytics", hauntId, timeRange] });
    queryClient.invalidateQueries({ queryKey: ["ads", hauntId] });
    console.log('Analytics queries invalidated');
  };

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

  const { data: adsData, isLoading: adsLoading } = useQuery<AdData[]>({
    queryKey: ["ads", hauntId],
    queryFn: async () => {
      const cacheBuster = Date.now();
      const response = await fetch(`/api/ads/${hauntId}?t=${cacheBuster}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ads data');
      }
      return response.json();
    },
    enabled: !!hauntId,
    staleTime: 0,
    gcTime: 0
  });

  const { data: adPerformanceData, isLoading: adMetricsLoading } = useQuery<AdPerformance[]>({
    queryKey: ["adPerformance", hauntId, timeRange, adsData, analyticsData],
    queryFn: async () => {
      if (!adsData || adsData.length === 0 || !analyticsData) return [];
      
      // Fetch detailed ad interactions from the analytics API
      const response = await fetch(`/api/analytics/ad-interactions/${hauntId}?timeRange=${timeRange}`);
      let adInteractions = [];
      
      if (response.ok) {
        adInteractions = await response.json();
      }
      
      // Group interactions by unique ad ID for accurate tracking
      const interactionMap = new Map();
      adInteractions.forEach((interaction: any) => {
        const adId = interaction.adId || `ad-${interaction.adIndex}`;
        if (!interactionMap.has(adId)) {
          interactionMap.set(adId, { views: 0, clicks: 0 });
        }
        const stats = interactionMap.get(adId);
        if (interaction.type === 'view') stats.views++;
        if (interaction.type === 'click') stats.clicks++;
      });
      
      // Map ads to their actual performance data by unique ID
      const adPerformance: AdPerformance[] = adsData.map((ad) => {
        const stats = interactionMap.get(ad.id) || { views: 0, clicks: 0 };
        const ctr = stats.views > 0 ? Math.round((stats.clicks / stats.views) * 100) : 0;
        
        return {
          ...ad,
          views: stats.views,
          clicks: stats.clicks,
          ctr
        };
      });
      
      // Sort by CTR (highest first)
      return adPerformance.sort((a, b) => b.ctr - a.ctr);
    },
    enabled: !!hauntId && !!adsData && !!analyticsData,
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
    <TooltipProvider>
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
                <Button 
                  onClick={refreshData}
                  variant="outline" 
                  size="sm"
                  className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
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

          {/* Completion Rate */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-yellow-200">Completion Rate</CardTitle>
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <AwardIcon className="h-5 w-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analyticsData?.completionRate || 0}%</div>
              <p className="text-xs text-yellow-300 mt-1">Games finished</p>
            </CardContent>
          </Card>

          {/* Ad Engagement - Highlighted */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30 backdrop-blur-sm ring-2 ring-purple-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-sm font-medium text-purple-200 cursor-help">Ad Engagement</CardTitle>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Overall Click-Through Rate</p>
                  <p>Total clicks divided by total views across ALL ads. Weighted by actual traffic volume, so popular ads have more influence on this metric.</p>
                </TooltipContent>
              </Tooltip>
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

        {/* Ad Performance Metrics Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <MousePointerClickIcon className="w-5 h-5 mr-2 text-purple-400" />
              Ad Performance Metrics
            </CardTitle>
            <CardDescription className="text-gray-300">
              Detailed performance data for all ads uploaded to this haunt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adsLoading || adMetricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-300">Loading ad performance data...</span>
              </div>
            ) : !adsData || adsData.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                  <MousePointerClickIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-lg">No ads found for this haunt</p>
                  <p className="text-gray-500 text-sm mt-1">Upload ads through the haunt admin panel to see performance metrics here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/10 text-sm font-medium text-gray-300">
                  <div className="col-span-1">Preview</div>
                  <div className="col-span-4">Ad Details</div>
                  <div className="col-span-2 text-center">Views</div>
                  <div className="col-span-2 text-center">Clicks</div>
                  <div className="col-span-2 text-center">CTR</div>
                  <div className="col-span-1 text-center">Performance</div>
                </div>

                {/* Ad Performance Rows */}
                {adPerformanceData && adPerformanceData.length > 0 ? (
                  adPerformanceData.map((ad, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 py-4 border-b border-white/5 hover:bg-white/5 rounded-lg transition-colors">
                      {/* Thumbnail */}
                      <div className="col-span-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                          {ad.imageUrl ? (
                            <img 
                              src={ad.imageUrl} 
                              alt={ad.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-gray-500" style={{display: ad.imageUrl ? 'none' : 'flex'}}>
                            <PieChartIcon className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      {/* Ad Details */}
                      <div className="col-span-4 space-y-1">
                        <h4 className="text-white font-medium truncate">{ad.title || 'Untitled Ad'}</h4>
                        <p className="text-gray-400 text-sm truncate">{ad.description || 'No description'}</p>
                        {ad.link && ad.link !== '#' && (
                          <a 
                            href={ad.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-xs hover:text-blue-300 truncate block"
                          >
                            {ad.link}
                          </a>
                        )}
                      </div>

                      {/* Views */}
                      <div className="col-span-2 text-center">
                        <div className="text-white font-semibold text-lg">{ad.views}</div>
                        <div className="text-gray-400 text-xs">impressions</div>
                      </div>

                      {/* Clicks */}
                      <div className="col-span-2 text-center">
                        <div className="text-white font-semibold text-lg">{ad.clicks}</div>
                        <div className="text-gray-400 text-xs">engagements</div>
                      </div>

                      {/* CTR */}
                      <div className="col-span-2 text-center">
                        <div className={`font-bold text-lg ${
                          ad.ctr >= 100 ? 'text-green-400' : 
                          ad.ctr >= 50 ? 'text-yellow-400' : 
                          ad.ctr > 0 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {ad.ctr}%
                        </div>
                        <div className="text-gray-400 text-xs">click rate</div>
                      </div>

                      {/* Performance Badge */}
                      <div className="col-span-1 text-center">
                        {ad.ctr >= 100 ? (
                          <Badge className="bg-green-500/30 text-green-200 border-green-500/50 text-xs">
                            Excellent
                          </Badge>
                        ) : ad.ctr >= 50 ? (
                          <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-500/50 text-xs">
                            Good
                          </Badge>
                        ) : ad.ctr > 0 ? (
                          <Badge className="bg-blue-500/30 text-blue-200 border-blue-500/50 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                            No Data
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No ad performance data available</p>
                  </div>
                )}

                {/* Summary Stats */}
                {adPerformanceData && adPerformanceData.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">
                          {adPerformanceData.reduce((sum, ad) => sum + ad.views, 0)}
                        </div>
                        <div className="text-gray-300 text-sm">Total Ad Views</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">
                          {adPerformanceData.reduce((sum, ad) => sum + ad.clicks, 0)}
                        </div>
                        <div className="text-gray-300 text-sm">Total Ad Clicks</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-2xl font-bold text-purple-400">
                          {adPerformanceData.length > 0 ? 
                            Math.round(adPerformanceData.reduce((sum, ad) => sum + ad.ctr, 0) / adPerformanceData.length) 
                            : 0}%
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-gray-300 text-sm cursor-help">Average CTR</div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Mathematical Average</p>
                            <p>Sum of all individual ad CTRs divided by number of ads. Each ad contributes equally regardless of traffic volume.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            Analytics Dashboard • Pro/Premium Feature
          </p>
        </div>
        </div>
      </div>
    </TooltipProvider>
  );
}