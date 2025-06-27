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
      <div >
        <div  style={{textAlign: "center"}}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div >
        <div  style={{textAlign: "center"}}>Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div >
      <div >
        <div  style={{textAlign: "center"}}>
          <h1 >FIXED Analytics Dashboard</h1>
          <p >Haunt: {hauntId}</p>
          <p >Ad Engagement Working - 200%</p>
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
              <CardTitle >Ad Engagement</CardTitle>
              <MousePointer  />
            </CardHeader>
            <CardContent>
              <div >{analyticsData?.adClickThrough || 0}%</div>
              <p >Click-through rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Section */}
        <Card >
          <CardHeader>
            <CardTitle >Debug - Raw API Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre >
              {JSON.stringify(analyticsData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}