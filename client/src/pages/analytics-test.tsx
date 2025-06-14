import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

export default function AnalyticsTest() {
  const [, params] = useRoute("/analytics-test/:hauntId");
  const hauntId = params?.hauntId || "headquarters";

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics-test", hauntId],
    queryFn: async () => {
      console.log(`Fetching analytics for haunt: ${hauntId}`);
      const response = await fetch(`/api/analytics/${hauntId}?timeRange=30d`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Analytics API Response:', data);
      return data;
    },
    enabled: !!hauntId,
  });

  console.log('Component state:', { isLoading, error, analyticsData });

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
        <h1>Analytics Dashboard - Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
        <h1>Analytics Dashboard - Error</h1>
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1>Analytics Dashboard - {hauntId}</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>Data:</h2>
        <div style={{ backgroundColor: '#333', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          <p>Total Games: {analyticsData?.totalGames || 0}</p>
          <p>Unique Players: {analyticsData?.uniquePlayers || 0}</p>
          <p>Average Score: {analyticsData?.competitiveMetrics?.averageScore || 0}</p>
          <p>Top Score: {analyticsData?.competitiveMetrics?.topScore || 0}</p>
        </div>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#ccc' }}>
          <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}