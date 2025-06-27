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
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: timeRange === range 
                      ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' 
                      : 'transparent',
                    color: timeRange === range ? 'white' : '#d1d5db',
                    boxShadow: timeRange === range ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: timeRange === range ? 'scale(1.05)' : 'scale(1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (timeRange !== range) {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeRange !== range) {
                      e.currentTarget.style.color = '#d1d5db';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
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
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#10b981'}}>{analyticsData?.completionRate || 0}%</div>
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
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{analyticsData?.adClickThrough || 0}%</div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Click-through rate</p>
              <div>
                <Badge style={{
                  backgroundColor: (analyticsData?.adClickThrough || 0) >= 5 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'rgba(234, 179, 8, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
                  color: (analyticsData?.adClickThrough || 0) >= 5 
                    ? 'rgb(187, 247, 208)' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'rgb(254, 240, 138)'
                    : 'rgb(254, 202, 202)',
                  border: `1px solid ${(analyticsData?.adClickThrough || 0) >= 5 
                    ? 'rgba(34, 197, 94, 0.5)' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'rgba(234, 179, 8, 0.5)'
                    : 'rgba(239, 68, 68, 0.5)'}`
                }}>
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
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MousePointerClickIcon style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)' }}>Ad Engagement</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{analyticsData?.adClickThrough || 0}%</span>
                    <Badge style={{
                      backgroundColor: (analyticsData?.adClickThrough || 0) >= 5 
                        ? 'rgba(34, 197, 94, 0.3)' 
                        : (analyticsData?.adClickThrough || 0) >= 2 
                        ? 'rgba(234, 179, 8, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)',
                      color: (analyticsData?.adClickThrough || 0) >= 5 
                        ? '#bbf7d0' 
                        : (analyticsData?.adClickThrough || 0) >= 2 
                        ? '#fef3c7'
                        : '#fecaca',
                      border: `1px solid ${(analyticsData?.adClickThrough || 0) >= 5 
                        ? 'rgba(34, 197, 94, 0.5)' 
                        : (analyticsData?.adClickThrough || 0) >= 2 
                        ? 'rgba(234, 179, 8, 0.5)'
                        : 'rgba(239, 68, 68, 0.5)'}`
                    }}>
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
                      <div style={{textAlign: "center"}}>
                        <Badge 
                          variant="outline" 
                          style={{
                            backgroundColor: ctr >= 5 
                              ? 'rgba(34, 197, 94, 0.2)' 
                              : ctr >= 2 
                              ? 'rgba(234, 179, 8, 0.2)'
                              : 'rgba(107, 114, 128, 0.2)',
                            color: ctr >= 5 
                              ? '#86efac' 
                              : ctr >= 2 
                              ? '#fde047'
                              : '#d1d5db',
                            border: ctr >= 5 
                              ? '1px solid rgba(34, 197, 94, 0.3)' 
                              : ctr >= 2 
                              ? '1px solid rgba(234, 179, 8, 0.3)'
                              : '1px solid rgba(107, 114, 128, 0.3)'
                          }}
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
                      <div style={{textAlign: "center"}}>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 'bold',
                          color: ad.ctr >= 100 ? '#4ade80' : 
                                 ad.ctr >= 50 ? '#facc15' : 
                                 ad.ctr > 0 ? '#60a5fa' : '#9ca3af'
                        }}>
                          {ad.ctr}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>click rate</div>
                      </div>

                      {/* Performance Badge */}
                      <div style={{textAlign: "center"}}>
                        {ad.ctr >= 100 ? (
                          <Badge style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)', color: '#bbf7d0', border: '1px solid rgba(34, 197, 94, 0.5)' }}>
                            Excellent
                          </Badge>
                        ) : ad.ctr >= 50 ? (
                          <Badge style={{ backgroundColor: 'rgba(234, 179, 8, 0.3)', color: '#fef3c7', border: '1px solid rgba(234, 179, 8, 0.5)' }}>
                            Good
                          </Badge>
                        ) : ad.ctr > 0 ? (
                          <Badge style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#dbeafe', border: '1px solid rgba(59, 130, 246, 0.5)' }}>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" style={{ backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #6b7280' }}>
                            No Data
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{textAlign: "center"}}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No ad performance data available</p>
                  </div>
                )}

                {/* Summary Stats */}
                {adPerformanceData && adPerformanceData.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                          {adPerformanceData.reduce((sum, ad) => sum + ad.views, 0)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total Ad Views</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                          {adPerformanceData.reduce((sum, ad) => sum + ad.clicks, 0)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total Ad Clicks</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                          {adPerformanceData.length > 0 ? 
                            Math.round(adPerformanceData.reduce((sum, ad) => sum + ad.ctr, 0) / adPerformanceData.length) 
                            : 0}%
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Average CTR</div>
                          </TooltipTrigger>
                          <TooltipContent style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <p style={{ fontSize: '0.875rem' }}>Mathematical Average</p>
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
        <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem' }}>
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
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{adsData?.length || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total Ads Uploaded</div>
              </div>

              {/* Total Impressions */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.6)' }} />
                  </div>
                  <Badge variant="outline" style={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    Views
                  </Badge>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.views, 0) || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total Impressions</div>
              </div>

              {/* Total Clicks */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MousePointerClickIcon style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.6)' }} />
                  </div>
                  <Badge variant="outline" style={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    Clicks
                  </Badge>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.clicks, 0) || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total Engagements</div>
              </div>

              {/* Overall Performance */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AwardIcon style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.6)' }} />
                  </div>
                  <Badge style={{
                    backgroundColor: (analyticsData?.adClickThrough || 0) >= 5 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'rgba(234, 179, 8, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)',
                    color: (analyticsData?.adClickThrough || 0) >= 5 
                      ? '#bbf7d0' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? '#fef3c7'
                      : '#fecaca',
                    border: (analyticsData?.adClickThrough || 0) >= 5 
                      ? '1px solid rgba(34, 197, 94, 0.5)' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? '1px solid rgba(234, 179, 8, 0.5)'
                      : '1px solid rgba(239, 68, 68, 0.5)'
                  }}>
                    {(analyticsData?.adClickThrough || 0) >= 5 
                      ? 'Excellent' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'Good'
                      : 'Needs Improvement'}
                  </Badge>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{analyticsData?.adClickThrough || 0}%</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Overall CTR</div>
              </div>
            </div>

            {/* Call to Action */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Ready to optimize your ad performance?</h3>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Upload more ads, adjust targeting, and maximize your haunt's revenue potential with detailed analytics insights.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button 
                      onClick={() => window.location.href = `https://heinoustrivia.com/haunt-admin/${hauntId}`}
                      style={{ background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(79, 70, 229))', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                      <MousePointerClickIcon style={{ width: '1rem', height: '1rem' }} />
                      Manage Ads
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={refreshData}
                      style={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '0.5rem 1rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                      <RefreshCwIcon style={{ width: '1rem', height: '1rem' }} />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div style={{textAlign: "center", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)"}}>
          <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)" }}>
            Analytics Dashboard • Pro/Premium Feature
          </p>
        </div>
        </div>
      </div>
    </TooltipProvider>
  );
}