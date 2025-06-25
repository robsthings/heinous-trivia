import { useState } from "react";
import { CustomProgressBar } from "@/components/CustomProgressBar";
import type { HauntConfig } from "@shared/schema";

export function TestProgressThemesPage() {
  const [progress, setProgress] = useState(75);

  const createTestConfig = (theme: string): HauntConfig => ({
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
    progressBarTheme: theme,
    theme: {
      primaryColor: "#8B0000",
      secondaryColor: "#2D1B69",
      accentColor: "#FF6B35",
      backgroundColor: "#1f2937",
      fontFamily: "Inter",
      logoUrl: "",
      customCSS: ""
    }
  });

  const themes = [
    { id: 'crimson', name: 'Crimson Glow', description: 'Deep red to bright red' },
    { id: 'blood', name: 'Blood Red', description: 'Dark red to crimson' },
    { id: 'electric', name: 'Electric Blue', description: 'Blue to cyan' },
    { id: 'toxic', name: 'Toxic Green', description: 'Emerald to lime' },
    { id: 'purple', name: 'Mystic Purple', description: 'Deep purple to violet' },
    { id: 'orange', name: 'Inferno Orange', description: 'Orange to amber' },
    { id: 'pink', name: 'Neon Pink', description: 'Hot pink to rose' },
    { id: 'gold', name: 'Golden Glow', description: 'Yellow to amber' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '32px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'white'
        }}>Progress Bar Theme Testing</h1>
        
        <p style={{
          color: '#94a3b8',
          marginBottom: '32px'
        }}>Testing all 8 Progress Bar Color Themes for Pro/Premium haunts</p>

        <div style={{
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500'
          }}>Progress: {progress}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: '#374151',
              outline: 'none',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {themes.map((theme) => (
            <div key={theme.id} style={{
              padding: '20px',
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '8px',
              border: '1px solid #374151'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'white'
              }}>{theme.name}</h3>
              <p style={{
                fontSize: '14px',
                color: '#9ca3af',
                marginBottom: '16px'
              }}>{theme.description}</p>
              <CustomProgressBar 
                progress={progress} 
                hauntConfig={createTestConfig(theme.id)}
                className="mb-4"
              />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'white'
          }}>Basic Tier (Default Theme)</h3>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            marginBottom: '16px'
          }}>Default progress bar for Basic tier haunts (no custom themes)</p>
          <CustomProgressBar 
            progress={progress} 
            hauntConfig={{
              ...createTestConfig(''),
              tier: 'basic',
              progressBarTheme: undefined
            }}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
}