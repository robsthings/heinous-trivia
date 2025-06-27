/**
 * FIREBASE FIELD NAME REFERENCE: Check /fieldGlossary.json before modifying any Firebase operations
 * - Use 'haunt' for query parameters, 'hauntId' for Firebase document fields
 * - Use 'action' for ad interactions (NOT 'interactionType')
 * - Collections: game_sessions, ad_interactions (snake_case), haunt-ads (kebab-case)
 * - Verify all field names against canonical glossary before changes
 */
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
  adPerformanceData?: Array<{
    adId: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
}

interface AdData {
  id: string;
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
    queryKey: ["adPerformance", hauntId, timeRange, adsData?.length],
    queryFn: async () => {
      console.log('Ad Performance Query - adsData:', adsData?.length, 'ads found');
      if (!adsData || adsData.length === 0) {
        console.log('Ad Performance Query - No ads data available');
        return [];
      }
      
      // Fetch detailed ad interactions from the analytics API
      const response = await fetch(`/api/analytics/ad-interactions/${hauntId}?timeRange=${timeRange}`);
      let adInteractions = [];
      
      if (response.ok) {
        adInteractions = await response.json();
        console.log('Ad Performance Query - interactions:', adInteractions.length);
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
      
      console.log('Ad Performance Query - final result:', adPerformance.length, 'ad performance entries');
      // Sort by title alphabetically for consistent display
      return adPerformance.sort((a, b) => a.title.localeCompare(b.title));
    },
    enabled: !!hauntId && !!adsData && adsData.length > 0,
  });

  if (error) {
    console.error('Analytics Query Error:', error);
  }

  if (isLoading) {
    return (
      <div >
        <div >
          <div >
            <div >
              <div ></div>
              <div  style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <div  style={{textAlign: "center"}}>
              <h1 >
                Analytics Dashboard
              </h1>
              <p >Loading comprehensive analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div >
        <div >
          <div  style={{textAlign: "center"}}>
            <h1 >Analytics Dashboard</h1>
            <p >Error loading analytics data: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Analytics Data:', analyticsData);
  console.log('Ads Data:', adsData?.length, 'ads loaded');
  console.log('Ad Performance Data:', adPerformanceData?.length, 'ad performance entries');
  console.log('Ad Metrics Loading:', adMetricsLoading);
  console.log('Query Enabled:', !!hauntId && !!adsData && adsData && adsData.length > 0);

  return (
    <TooltipProvider>
      <div >
        <div >
          {/* Header Section */}
          <div >
            <div >
            <div >
              <h1 >
                Analytics Dashboard
              </h1>
              <div >
                <Badge variant="outline" >
                  <BarChart3Icon  />
                  {hauntId}
                </Badge>
                <Badge variant="outline" >
                  <ActivityIcon  />
                  Live Data
                </Badge>
                <Badge variant="outline" >
                  Pro Feature
                </Badge>
                <Button 
                  onClick={refreshData}
                  variant="outline" 
                  size="sm"
                  
                >
                  <RefreshCwIcon  />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div >
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
        <div >
          {/* Total Games */}
          <Card >
            <CardHeader >
              <CardTitle >Total Games</CardTitle>
              <div >
                <CalendarIcon  />
              </div>
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.totalGames || 0}</div>
              <p >Games completed</p>
            </CardContent>
          </Card>

          {/* Unique Players */}
          <Card >
            <CardHeader >
              <CardTitle >Unique Players</CardTitle>
              <div >
                <UsersIcon  />
              </div>
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.uniquePlayers || 0}</div>
              <p >Individual players</p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card >
            <CardHeader >
              <CardTitle >Completion Rate</CardTitle>
              <div >
                <AwardIcon  />
              </div>
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.completionRate || 0}%</div>
              <p >Games finished</p>
            </CardContent>
          </Card>

          {/* Ad Engagement - Highlighted */}
          <Card >
            <CardHeader >
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle >Ad Engagement</CardTitle>
                </TooltipTrigger>
                <TooltipContent >
                  <p >Overall Click-Through Rate</p>
                  <p>Total clicks divided by total views across ALL ads. Weighted by actual traffic volume, so popular ads have more influence on this metric.</p>
                </TooltipContent>
              </Tooltip>
              <div >
                <MousePointerClickIcon  />
              </div>
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.adClickThrough || 0}%</div>
              <p >Click-through rate</p>
              <div >
                <Badge className={`${
                  (analyticsData?.adClickThrough || 0) >= 5 
                    ? 'bg-green-500/30 text-green-200 border-green-500/50' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50'
                    : 'bg-red-500/30 text-red-200 border-red-500/50'
                }`}>
                  {(analyticsData?.adClickThrough || 0) >= 5 
                    ? 'Excellent' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'Good'
                    : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Section */}
        <div >
          {/* Player Engagement Card */}
          <Card >
            <CardHeader>
              <CardTitle >
                <GroupIcon  />
                Player Engagement
              </CardTitle>
              <CardDescription >
                Core engagement metrics that matter to your haunt
              </CardDescription>
            </CardHeader>
            <CardContent >
              <div >
                <div >
                  <div >
                    <span >Total Players</span>
                    <span >{analyticsData?.uniquePlayers || 0}</span>
                  </div>
                  <div >
                    <span >Return Players</span>
                    <span >{analyticsData?.uniquePlayers || 0}</span>
                  </div>
                </div>
                <div >
                  <div >
                    <span >Return Rate</span>
                    <span >{analyticsData?.returnPlayerRate || 0}%</span>
                  </div>
                  <div >
                    <span >Completion Rate</span>
                    <span >{analyticsData?.completionRate || 0}%</span>
                  </div>
                </div>
              </div>

              <div >
                <div >
                  <span >Return Rate</span>
                  <span >{analyticsData?.returnPlayerRate || 0}%</span>
                </div>
                <Progress value={analyticsData?.returnPlayerRate || 0}  />
                
                <div >
                  <span >Completion Rate</span>
                  <span >{analyticsData?.completionRate || 0}%</span>
                </div>
                <Progress value={analyticsData?.completionRate || 0}  />
              </div>
            </CardContent>
          </Card>

          {/* Activity Insights Card */}
          <Card >
            <CardHeader>
              <CardTitle >
                <TrendingUpIcon  />
                Activity Insights
              </CardTitle>
              <CardDescription >
                When and how players engage with your haunt
              </CardDescription>
            </CardHeader>
            <CardContent >
              <div >
                <div >
                  <div >
                    <ActivityIcon  />
                    <span >Avg. Session Time</span>
                  </div>
                  <span >{analyticsData?.avgSessionTime || 0} min</span>
                </div>
                
                <div >
                  <div >
                    <CalendarIcon  />
                    <span >Daily Average</span>
                  </div>
                  <span >{analyticsData?.dailyAverage || 0} games</span>
                </div>
                
                <div >
                  <div >
                    <TargetIcon  />
                    <span >Peak Activity</span>
                  </div>
                  <span >{analyticsData?.peakActivity || 'No data'}</span>
                </div>
                
                {/* Ad Engagement Highlight */}
                <div >
                  <div >
                    <MousePointerClickIcon  />
                    <span >Ad Engagement</span>
                  </div>
                  <div >
                    <span >{analyticsData?.adClickThrough || 0}%</span>
                    <Badge className={`text-xs ${
                      (analyticsData?.adClickThrough || 0) >= 5 
                        ? 'bg-green-500/30 text-green-200 border-green-500/50' 
                        : (analyticsData?.adClickThrough || 0) >= 2 
                        ? 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50'
                        : 'bg-red-500/30 text-red-200 border-red-500/50'
                    }`}>
                      {(analyticsData?.adClickThrough || 0) >= 5 
                        ? 'Excellent' 
                        : (analyticsData?.adClickThrough || 0) >= 2 
                        ? 'Good'
                        : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Performance Metrics Section */}
        <Card >
          <CardHeader>
            <CardTitle >
              <MousePointerClickIcon  />
              Ad Performance Metrics
            </CardTitle>
            <CardDescription >
              Detailed performance data for all ads uploaded to this haunt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adsLoading || adMetricsLoading ? (
              <div >
                <div ></div>
                <span >Loading ad performance data...</span>
              </div>
            ) : !adsData || adsData.length === 0 ? (
              <div  style={{textAlign: "center"}}>
                <div >
                  <MousePointerClickIcon  />
                  <p >No ads found for this haunt</p>
                  <p >Upload ads through the haunt admin panel to see performance metrics here</p>
                </div>
              </div>
            ) : adsData && adsData.length > 0 ? (
              <div >
                {/* Table Header */}
                <div >
                  <div >Preview</div>
                  <div >Ad Details</div>
                  <div  style={{textAlign: "center"}}>Views</div>
                  <div  style={{textAlign: "center"}}>Clicks</div>
                  <div  style={{textAlign: "center"}}>CTR</div>
                  <div  style={{textAlign: "center"}}>Performance</div>
                </div>

                {/* Display ads with their performance metrics */}
                {adsData.map((ad, index) => {
                  // Find performance data for this ad
                  const adPerformance = analyticsData?.adPerformanceData?.find(perf => perf.adId === ad.id);
                  const views = adPerformance?.views || 0;
                  const clicks = adPerformance?.clicks || 0;
                  const ctr = adPerformance?.ctr || 0;

                  return (
                    <div key={ad.id || index} >
                      {/* Thumbnail */}
                      <div >
                        <div >
                          {ad.imageUrl ? (
                            <img 
                              src={ad.imageUrl} 
                              alt={ad.title}
                              
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div  style={{display: ad.imageUrl ? 'none' : 'flex'}}>
                            <PieChartIcon  />
                          </div>
                        </div>
                      </div>

                      {/* Ad Details */}
                      <div >
                        <h4 >{ad.title || 'Untitled Ad'}</h4>
                        <p >{ad.description || 'No description'}</p>
                        {ad.link && ad.link !== '#' && (
                          <a 
                            href={ad.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            
                          >
                            {ad.link}
                          </a>
                        )}
                      </div>

                      {/* Views */}
                      <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.25rem", fontWeight: "bold"}}>{views}</div>
                        <div style={{fontSize: "0.75rem", color: "#9ca3af"}}>impressions</div>
                      </div>

                      {/* Clicks */}
                      <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.25rem", fontWeight: "bold"}}>{clicks}</div>
                        <div style={{fontSize: "0.75rem", color: "#9ca3af"}}>engagements</div>
                      </div>

                      {/* CTR */}
                      <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.25rem", fontWeight: "bold"}}>
                          {ctr > 0 ? `${ctr.toFixed(1)}%` : '0%'}
                        </div>
                        <div style={{fontSize: "0.75rem", color: "#9ca3af"}}>click rate</div>
                      </div>

                      {/* Performance Badge */}
                      <div  style={{textAlign: "center"}}>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            ctr >= 5 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                              : ctr >= 2 
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}
                        >
                          {ctr >= 5 ? 'Excellent' : ctr >= 2 ? 'Good' : views > 0 ? 'Low CTR' : 'No Data'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div >
                {/* Table Header */}
                <div >
                  <div >Preview</div>
                  <div >Ad Details</div>
                  <div  style={{textAlign: "center"}}>Views</div>
                  <div  style={{textAlign: "center"}}>Clicks</div>
                  <div  style={{textAlign: "center"}}>CTR</div>
                  <div  style={{textAlign: "center"}}>Performance</div>
                </div>

                {/* Ad Performance Rows */}
                {adPerformanceData && adPerformanceData.length > 0 ? (
                  adPerformanceData.map((ad, index) => (
                    <div key={index} >
                      {/* Thumbnail */}
                      <div >
                        <div >
                          {ad.imageUrl ? (
                            <img 
                              src={ad.imageUrl} 
                              alt={ad.title}
                              
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div  style={{display: ad.imageUrl ? 'none' : 'flex'}}>
                            <PieChartIcon  />
                          </div>
                        </div>
                      </div>

                      {/* Ad Details */}
                      <div >
                        <h4 >{ad.title || 'Untitled Ad'}</h4>
                        <p >{ad.description || 'No description'}</p>
                        {ad.link && ad.link !== '#' && (
                          <a 
                            href={ad.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            
                          >
                            {ad.link}
                          </a>
                        )}
                      </div>

                      {/* Views */}
                      <div  style={{textAlign: "center"}}>
                        <div >{ad.views}</div>
                        <div >impressions</div>
                      </div>

                      {/* Clicks */}
                      <div  style={{textAlign: "center"}}>
                        <div >{ad.clicks}</div>
                        <div >engagements</div>
                      </div>

                      {/* CTR */}
                      <div  style={{textAlign: "center"}}>
                        <div className={`font-bold text-lg ${
                          ad.ctr >= 100 ? 'text-green-400' : 
                          ad.ctr >= 50 ? 'text-yellow-400' : 
                          ad.ctr > 0 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {ad.ctr}%
                        </div>
                        <div >click rate</div>
                      </div>

                      {/* Performance Badge */}
                      <div  style={{textAlign: "center"}}>
                        {ad.ctr >= 100 ? (
                          <Badge >
                            Excellent
                          </Badge>
                        ) : ad.ctr >= 50 ? (
                          <Badge >
                            Good
                          </Badge>
                        ) : ad.ctr > 0 ? (
                          <Badge >
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" >
                            No Data
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div  style={{textAlign: "center"}}>
                    <p >No ad performance data available</p>
                  </div>
                )}

                {/* Summary Stats */}
                {adPerformanceData && adPerformanceData.length > 0 && (
                  <div >
                    <div >
                      <div >
                        <div >
                          {adPerformanceData.reduce((sum, ad) => sum + ad.views, 0)}
                        </div>
                        <div >Total Ad Views</div>
                      </div>
                      <div >
                        <div >
                          {adPerformanceData.reduce((sum, ad) => sum + ad.clicks, 0)}
                        </div>
                        <div >Total Ad Clicks</div>
                      </div>
                      <div >
                        <div >
                          {adPerformanceData.length > 0 ? 
                            Math.round(adPerformanceData.reduce((sum, ad) => sum + ad.ctr, 0) / adPerformanceData.length) 
                            : 0}%
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div >Average CTR</div>
                          </TooltipTrigger>
                          <TooltipContent >
                            <p >Mathematical Average</p>
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

        {/* Ad Summary Section */}
        <Card >
          <CardHeader>
            <CardTitle >
              <MousePointerClickIcon  />
              Ad Campaign Summary
            </CardTitle>
            <CardDescription >
              Comprehensive overview of all advertising performance across your haunt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div >
              {/* Total Ads */}
              <div >
                <div >
                  <div >
                    <PieChartIcon  />
                  </div>
                  <Badge variant="outline" >
                    Active
                  </Badge>
                </div>
                <div >{adsData?.length || 0}</div>
                <div >Total Ads Uploaded</div>
              </div>

              {/* Total Impressions */}
              <div >
                <div >
                  <div >
                    <TrendingUpIcon  />
                  </div>
                  <Badge variant="outline" >
                    Views
                  </Badge>
                </div>
                <div >
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.views, 0) || 0}
                </div>
                <div >Total Impressions</div>
              </div>

              {/* Total Clicks */}
              <div >
                <div >
                  <div >
                    <MousePointerClickIcon  />
                  </div>
                  <Badge variant="outline" >
                    Clicks
                  </Badge>
                </div>
                <div >
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.clicks, 0) || 0}
                </div>
                <div >Total Engagements</div>
              </div>

              {/* Overall Performance */}
              <div >
                <div >
                  <div >
                    <AwardIcon  />
                  </div>
                  <Badge className={`text-xs ${
                    (analyticsData?.adClickThrough || 0) >= 5 
                      ? 'bg-green-500/30 text-green-200 border-green-500/50' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50'
                      : 'bg-red-500/30 text-red-200 border-red-500/50'
                  }`}>
                    {(analyticsData?.adClickThrough || 0) >= 5 
                      ? 'Excellent' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'Good'
                      : 'Needs Improvement'}
                  </Badge>
                </div>
                <div >{analyticsData?.adClickThrough || 0}%</div>
                <div >Overall CTR</div>
              </div>
            </div>

            {/* Call to Action */}
            <div >
              <div >
                <div >
                  <div >
                    <h3 >Ready to optimize your ad performance?</h3>
                    <p >
                      Upload more ads, adjust targeting, and maximize your haunt's revenue potential with detailed analytics insights.
                    </p>
                  </div>
                  <div >
                    <Button 
                      onClick={() => window.location.href = `https://heinoustrivia.com/haunt-admin/${hauntId}`}
                      
                    >
                      <MousePointerClickIcon  />
                      Manage Ads
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={refreshData}
                      
                    >
                      <RefreshCwIcon  />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div  style={{textAlign: "center"}}>
          <p >
            Analytics Dashboard • Pro/Premium Feature
          </p>
        </div>
        </div>
      </div>
    </TooltipProvider>
  );
}