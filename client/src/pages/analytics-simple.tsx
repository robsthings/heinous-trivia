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
      <div >
        <div >
          <div  style={{textAlign: "center"}}>
            <h1 >Analytics Dashboard</h1>
            <p>Loading analytics data...</p>
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

  return (
    <div >
      <div >
        <div  style={{textAlign: "center"}}>
          <h1 >SIMPLIFIED Analytics Dashboard</h1>
          <p >Haunt: {hauntId}</p>
          <p >New Component - Ad Engagement Fixed</p>
        </div>

        {/* Key Metrics Grid */}
        <div >
          <Card >
            <CardHeader >
              <CardTitle >Total Games</CardTitle>
              <Trophy  />
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.totalGames || 0}</div>
              <p >Games completed</p>
            </CardContent>
          </Card>

          <Card >
            <CardHeader >
              <CardTitle >Unique Players</CardTitle>
              <Users  />
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.uniquePlayers || 0}</div>
              <p >Individual players</p>
            </CardContent>
          </Card>

          <Card >
            <CardHeader >
              <CardTitle >Average Score</CardTitle>
              <Target  />
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.averageScore || 0}</div>
              <p >Points per game</p>
            </CardContent>
          </Card>

          <Card >
            <CardHeader >
              <CardTitle >Return Rate</CardTitle>
              <TrendingUp  />
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.returnPlayerRate || 0}%</div>
              <p >Player retention</p>
            </CardContent>
          </Card>
        </div>

        {/* Ad Engagement Card */}
        <div >
          <Card >
            <CardHeader>
              <CardTitle >
                <MousePointer  />
                Ad Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div >
                <div >
                  <div >
                    <MousePointer  />
                    <span >Ad Click-Through Rate</span>
                  </div>
                  <span >
                    {analyticsData?.adClickThrough !== undefined ? `${analyticsData.adClickThrough}%` : 'LOADING...'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <div >
          <h3 >Debug Information</h3>
          <pre >
            {JSON.stringify(analyticsData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}