/**
 * Production-matching Analytics Dashboard
 * Matches the design shown in production screenshot
 */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarIcon, 
  UsersIcon, 
  TrendingUpIcon, 
  TargetIcon, 
  MousePointerClickIcon, 
  BarChart3Icon, 
  ActivityIcon, 
  AwardIcon, 
  RefreshCwIcon,
  ExternalLinkIcon 
} from "lucide-react";

interface AnalyticsData {
  totalGames: number;
  uniquePlayers: number;
  returnPlayerRate: number;
  completionRate: number;
  adClickThrough: number;
  avgSessionTime: number | null;
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
  imageUrl?: string;
  link: string;
}

export default function AnalyticsProduction() {
  const [, params] = useRoute("/analytics/:hauntId");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const hauntId = params?.hauntId || "headquarters";
  const queryClient = useQueryClient();

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics", hauntId, timeRange] });
    queryClient.invalidateQueries({ queryKey: ["ads", hauntId] });
  };

  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics", hauntId, timeRange],
    queryFn: async () => {
      const cacheBuster = Date.now();
      const response = await fetch(`/api/analytics/${hauntId}?timeRange=${timeRange}&t=${cacheBuster}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    enabled: !!hauntId,
    staleTime: 0,
    gcTime: 0
  });

  const { data: adsData } = useQuery<AdData[]>({
    queryKey: ["ads", hauntId],
    queryFn: async () => {
      const response = await fetch(`/api/ads/${hauntId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ads data');
      }
      return response.json();
    },
    enabled: !!hauntId,
  });

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        padding: '1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            width: '3rem',
            height: '3rem',
            border: '4px solid #334155',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 1rem'
          }}></div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Analytics Dashboard</h1>
          <p style={{ color: '#94a3b8' }}>Loading comprehensive analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        padding: '1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
          <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>Analytics Dashboard</h1>
          <p style={{ color: '#ef4444' }}>Error loading analytics data: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ 
                color: '#a78bfa',
                fontSize: '1.875rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                Analytics Dashboard
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Badge style={{ 
                  background: 'rgba(59, 130, 246, 0.2)', 
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '0.25rem 0.75rem'
                }}>
                  {hauntId}
                </Badge>
                <Badge style={{ 
                  background: 'rgba(34, 197, 94, 0.2)', 
                  color: '#86efac',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '0.25rem 0.75rem'
                }}>
                  Live Data
                </Badge>
                <Badge style={{ 
                  background: 'rgba(168, 85, 247, 0.2)', 
                  color: '#c4b5fd',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '0.25rem 0.75rem'
                }}>
                  Pro Feature
                </Badge>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.25rem', borderRadius: '0.5rem' }}>
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: timeRange === range 
                      ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' 
                      : 'transparent',
                    color: timeRange === range ? 'white' : '#94a3b8',
                    transform: timeRange === range ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          
          {/* Total Games */}
          <Card style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(8px)'
          }}>
            <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: '500' }}>
                  Total Games
                </CardTitle>
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.2)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem' 
                }}>
                  <CalendarIcon style={{ width: '1.25rem', height: '1.25rem', color: '#60a5fa' }} />
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 1rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {analyticsData?.totalGames || 0}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '0.25rem' }}>
                Games completed
              </p>
            </CardContent>
          </Card>

          {/* Unique Players */}
          <Card style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(8px)'
          }}>
            <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ color: '#86efac', fontSize: '0.875rem', fontWeight: '500' }}>
                  Unique Players
                </CardTitle>
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.2)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem' 
                }}>
                  <UsersIcon style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 1rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {analyticsData?.uniquePlayers || 0}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.25rem' }}>
                Individual players
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            backdropFilter: 'blur(8px)'
          }}>
            <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: '500' }}>
                  Completion Rate
                </CardTitle>
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.2)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem' 
                }}>
                  <AwardIcon style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 1rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {analyticsData?.completionRate || 0}%
              </div>
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.25rem' }}>
                Games finished
              </p>
            </CardContent>
          </Card>

          {/* Ad Engagement */}
          <Card style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1))',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
          }}>
            <CardHeader style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ color: '#c4b5fd', fontSize: '0.875rem', fontWeight: '500' }}>
                  Ad Engagement
                </CardTitle>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.3)', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem' 
                }}>
                  <MousePointerClickIcon style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 1rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {Math.round(analyticsData?.adClickThrough || 0)}%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
                  Click-through rate
                </p>
                <Badge style={{
                  fontSize: '0.625rem',
                  padding: '0.125rem 0.375rem',
                  background: (analyticsData?.adClickThrough || 0) >= 5 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
                  color: (analyticsData?.adClickThrough || 0) >= 5 
                    ? '#86efac' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? '#fbbf24'
                    : '#fca5a5',
                  border: `1px solid ${(analyticsData?.adClickThrough || 0) >= 5 
                    ? 'rgba(34, 197, 94, 0.5)' 
                    : (analyticsData?.adClickThrough || 0) >= 2 
                    ? 'rgba(245, 158, 11, 0.5)'
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

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* Player Engagement */}
          <Card style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <CardHeader>
              <CardTitle style={{ 
                color: 'white', 
                fontSize: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <UsersIcon style={{ width: '1.25rem', height: '1.25rem', color: '#60a5fa' }} />
                Player Engagement
              </CardTitle>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Core engagement metrics that matter to your haunt
              </p>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Players</span>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {analyticsData?.uniquePlayers || 0}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Return Players</span>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {Math.round(analyticsData?.returnPlayerRate || 0)}%
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Completion Rate</span>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {analyticsData?.completionRate || 0}%
                </span>
              </div>

            </CardContent>
          </Card>

          {/* Activity Insights */}
          <Card style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <CardHeader>
              <CardTitle style={{ 
                color: 'white', 
                fontSize: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <ActivityIcon style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                Activity Insights
              </CardTitle>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                When and how players engage with your haunt
              </p>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ActivityIcon style={{ width: '1rem', height: '1rem', color: '#a855f7' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Avg. Session Time</span>
                </div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {analyticsData?.avgSessionTime ? `${Math.round(analyticsData.avgSessionTime)} min` : '0 min'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Daily Average</span>
                </div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {analyticsData?.dailyAverage || 0} games
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TargetIcon style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Peak Activity</span>
                </div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                  {analyticsData?.peakActivity || 'No data'}
                </span>
              </div>

              {/* Ad Engagement Highlight */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.1))',
                borderRadius: '0.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MousePointerClickIcon style={{ width: '1rem', height: '1rem', color: '#a855f7' }} />
                  <span style={{ color: '#c4b5fd', fontSize: '0.875rem' }}>Ad Engagement</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '1.125rem' }}>
                    {Math.round(analyticsData?.adClickThrough || 0)}%
                  </span>
                  <Badge style={{
                    fontSize: '0.625rem',
                    padding: '0.125rem 0.375rem',
                    background: (analyticsData?.adClickThrough || 0) >= 5 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)',
                    color: (analyticsData?.adClickThrough || 0) >= 5 
                      ? '#86efac' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? '#fbbf24'
                      : '#fca5a5',
                  }}>
                    {(analyticsData?.adClickThrough || 0) >= 5 
                      ? 'Excellent' 
                      : (analyticsData?.adClickThrough || 0) >= 2 
                      ? 'Good'
                      : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Ad Performance Metrics */}
        <Card style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <CardHeader>
            <CardTitle style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <MousePointerClickIcon style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
              Ad Performance Metrics
            </CardTitle>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Detailed performance data for all ads uploaded to this haunt
            </p>
          </CardHeader>
          <CardContent>
            {!adsData || adsData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <MousePointerClickIcon style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  color: '#64748b', 
                  margin: '0 auto 0.75rem' 
                }} />
                <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>No ads found for this haunt</p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Upload ads through the haunt admin panel to see performance metrics here
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 80px 80px 80px 100px',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#94a3b8'
                }}>
                  <div>Preview</div>
                  <div>Ad Details</div>
                  <div style={{ textAlign: 'center' }}>Views</div>
                  <div style={{ textAlign: 'center' }}>Clicks</div>
                  <div style={{ textAlign: 'center' }}>CTR</div>
                  <div style={{ textAlign: 'center' }}>Performance</div>
                </div>

                {/* Ad Rows */}
                {adsData.map((ad, index) => {
                  const adPerformance = analyticsData?.adPerformanceData?.find(perf => perf.adId === ad.id);
                  const views = adPerformance?.views || 0;
                  const clicks = adPerformance?.clicks || 0;
                  const ctr = adPerformance?.ctr || 0;

                  return (
                    <div 
                      key={ad.id || index} 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 80px 80px 80px 100px',
                        gap: '1rem',
                        padding: '0.75rem',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                        borderRadius: '0.5rem',
                        transition: 'background-color 0.2s',
                        ':hover': {
                          backgroundColor: 'rgba(148, 163, 184, 0.05)'
                        }
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {ad.imageUrl ? (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                        ) : (
                          <ExternalLinkIcon style={{ width: '1.5rem', height: '1.5rem', color: '#64748b' }} />
                        )}
                      </div>

                      {/* Ad Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ 
                          color: 'white', 
                          fontWeight: '600', 
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ad.title}
                        </h4>
                        <p style={{ 
                          color: '#94a3b8', 
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ad.description}
                        </p>
                        <a 
                          href={ad.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#60a5fa', 
                            fontSize: '0.75rem', 
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {ad.link}
                        </a>
                      </div>

                      {/* Views */}
                      <div style={{ 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center' 
                      }}>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                          {views}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          impressions
                        </span>
                      </div>

                      {/* Clicks */}
                      <div style={{ 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center' 
                      }}>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                          {clicks}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          engagements
                        </span>
                      </div>

                      {/* CTR */}
                      <div style={{ 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center' 
                      }}>
                        <span style={{ 
                          color: ctr >= 50 ? '#86efac' : ctr >= 25 ? '#fbbf24' : '#94a3b8', 
                          fontWeight: '600', 
                          fontSize: '1rem' 
                        }}>
                          {Math.round(ctr)}%
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          click rate
                        </span>
                      </div>

                      {/* Performance Badge */}
                      <div style={{ 
                        textAlign: 'center', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Badge style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: ctr >= 50 
                            ? 'rgba(34, 197, 94, 0.3)' 
                            : ctr >= 25 
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'rgba(100, 116, 139, 0.3)',
                          color: ctr >= 50 
                            ? '#86efac' 
                            : ctr >= 25 
                            ? '#fbbf24'
                            : '#94a3b8',
                          border: `1px solid ${ctr >= 50 
                            ? 'rgba(34, 197, 94, 0.5)' 
                            : ctr >= 25 
                            ? 'rgba(245, 158, 11, 0.5)'
                            : 'rgba(100, 116, 139, 0.5)'}`
                        }}>
                          {ctr >= 50 
                            ? 'Excellent' 
                            : ctr >= 25 
                            ? 'Good'
                            : 'Moderate'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Campaign Summary */}
        <Card style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(168, 85, 247, 0.2)'
        }}>
          <CardHeader>
            <CardTitle style={{ 
              color: '#c4b5fd', 
              fontSize: '1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <BarChart3Icon style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
              Ad Campaign Summary
            </CardTitle>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Comprehensive overview of all advertising performance across your haunt
            </p>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              
              {/* Total Ads */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.5rem' }}>
                  {adsData?.length || 0}
                </div>
                <div style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: '500' }}>
                  Active
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Total Ads Uploaded
                </div>
              </div>

              {/* Total Impressions */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '0.5rem' }}>
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.views, 0) || 0}
                </div>
                <div style={{ color: '#86efac', fontSize: '0.875rem', fontWeight: '500' }}>
                  Views
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Total Impressions
                </div>
              </div>

              {/* Total Engagements */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
                  {analyticsData?.adPerformanceData?.reduce((sum, ad) => sum + ad.clicks, 0) || 0}
                </div>
                <div style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: '500' }}>
                  Clicks
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Total Engagements
                </div>
              </div>

              {/* Overall CTR */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a855f7', marginBottom: '0.5rem' }}>
                  {Math.round(analyticsData?.adClickThrough || 0)}%
                </div>
                <div style={{ color: '#c4b5fd', fontSize: '0.875rem', fontWeight: '500' }}>
                  Excellent
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Overall CTR
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center'
            }}>
              <div>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem' 
                }}>
                  Ready to optimize your ad performance?
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Upload more ads, adjust targeting, and maximize your haunt's revenue potential with detailed analytics insights.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button 
                  onClick={() => window.location.href = `/haunt-admin/${hauntId}`}
                  style={{
                    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MousePointerClickIcon style={{ width: '1rem', height: '1rem' }} />
                  Manage Ads
                </Button>
                <Button 
                  onClick={refreshData}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCwIcon style={{ width: '1rem', height: '1rem' }} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
          Analytics Dashboard • Pro/Premium Feature
        </div>

      </div>
    </div>
  );
}