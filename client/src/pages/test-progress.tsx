import { CustomProgressBar } from "@/components/CustomProgressBar";
import type { HauntConfig } from "@shared/schema";

export function TestProgressPage() {
  const testConfig: HauntConfig = {
    id: "test",
    name: "Test Haunt",
    description: "Test description",
    logoPath: "",
    triviaFile: "test.csv",
    adFile: "test-ads.json",
    mode: "individual",
    tier: "premium",
    isActive: true,
    isPublished: true,
    progressBarTheme: "toxic",
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#84cc16",
      backgroundColor: "#1f2937",
      fontFamily: "Inter",
      logoUrl: "",
      customCSS: ""
    }
  };

  const themes = ['crimson', 'blood', 'electric', 'toxic', 'purple', 'orange', 'pink', 'gold'];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-2xl mb-8">Progress Bar Theme Test</h1>
      
      {themes.map((theme) => (
        <div key={theme} className="mb-6">
          <h2 className="text-white text-lg mb-2 capitalize">{theme} Theme</h2>
          <CustomProgressBar 
            progress={75} 
            hauntConfig={{...testConfig, progressBarTheme: theme}}
            className="mb-4"
          />
        </div>
      ))}

      <div className="mb-6">
        <h2 className="text-white text-lg mb-2">Default (Basic Tier)</h2>
        <CustomProgressBar 
          progress={50} 
          hauntConfig={{...testConfig, tier: "basic", progressBarTheme: undefined}}
        />
      </div>
    </div>
  );
}