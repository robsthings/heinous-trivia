import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { HauntConfig, TriviaQuestion } from "@shared/schema";

interface TriviaPack {
  id: string;
  name: string;
  description: string;
  questions: TriviaQuestion[];
  accessType: 'all' | 'tier' | 'select';
  allowedTiers?: string[];
  allowedHaunts?: string[];
}

interface CustomTriviaQuestion {
  id?: string;
  question: string;
  choices: string[];
  correct: string;
}

export default function HauntAdminNew() {
  const [, params] = useRoute("/haunt-admin/:hauntId");
  const [, setLocation] = useLocation();
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [newAccessCode, setNewAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hauntConfig, setHauntConfig] = useState<HauntConfig | null>(null);
  const [formData, setFormData] = useState({
    mode: "individual",
    triviaFile: "",
    adFile: "",
    primaryColor: "#8B0000",
    secondaryColor: "#2D1B69",
    accentColor: "#FF6B35"
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adFiles, setAdFiles] = useState<Array<{
    file: File | null;
    link: string;
    id: string;
    title: string;
    description: string;
  }>>([]);
  const [uploadedAds, setUploadedAds] = useState<any[]>([]);
  const [triviaPacks, setTriviaPacks] = useState<TriviaPack[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomTriviaQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<CustomTriviaQuestion | null>(null);

  const getAdLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 3;
      case 'pro': return 5;
      case 'premium': return 10;
      default: return 3;
    }
  };

  const getQuestionLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 5;
      case 'pro': return 15;
      case 'premium': return 50;
      default: return 5;
    }
  };

  // Authentication and loading logic would go here...
  // For now, let's create the improved layout structure

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4 flex items-center justify-center">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading haunt configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hauntConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4 flex items-center justify-center">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Haunt Not Found</h2>
              <p className="text-gray-300 mb-6">The haunt "{hauntId}" could not be found.</p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
              >
                🎮 Back to Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center lg:text-left bg-black/60 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
            👹 {hauntConfig.name || hauntId}
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            Manage your haunt configuration, trivia questions, and advertisements
          </p>
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="px-3 py-1 bg-gray-800/80 text-gray-300 rounded-full text-sm border border-gray-600">
              Tier: <span className="text-white font-semibold capitalize">{hauntConfig.tier}</span>
            </span>
            <span className="px-3 py-1 bg-gray-800/80 text-gray-300 rounded-full text-sm border border-gray-600">
              Mode: <span className="text-white font-semibold capitalize">{hauntConfig.mode}</span>
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Haunt Branding Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  🎨 Haunt Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-white text-sm font-medium mb-2 block">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-white text-sm font-medium mb-2 block">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-white text-sm font-medium mb-2 block">Accent Color</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="h-11 bg-gray-800 border-gray-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoUpload" className="text-white text-sm font-medium mb-2 block">Logo Upload</Label>
                  <p className="text-gray-400 text-xs mb-2">Recommended size: 600x300 PNG</p>
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-2 file:mr-3 file:cursor-pointer"
                  />
                  {logoFile && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      ✅ Selected: {logoFile.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Game Configuration Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  ⚙️ Game Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="mode" className="text-white text-sm font-medium mb-2 block">Game Mode</Label>
                  <Select value={formData.mode} onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-11">
                      <SelectValue placeholder="Select game mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="individual" className="text-white hover:bg-gray-700">
                        Individual Mode - Players compete individually
                      </SelectItem>
                      <SelectItem value="queue" className="text-white hover:bg-gray-700">
                        Group Mode - Host-controlled synchronized sessions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-gray-400 text-xs mt-1">
                    Current: <span className="text-white font-medium capitalize">{hauntConfig.mode}</span> mode
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Ad Management Section */}
            <Card className="bg-black/60 border-gray-600 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
                  📢 Ad Management
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Your <span className="text-white font-medium capitalize">{hauntConfig.tier}</span> tier allows up to{" "}
                  <span className="text-white font-medium">{getAdLimit(hauntConfig.tier)}</span> ads. Recommended size: 800x400 PNG.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adFiles.map((ad, index) => (
                    <div key={ad.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium">Ad #{index + 1}</h4>
                        {adFiles.length > 1 && (
                          <Button
                            onClick={() => setAdFiles(prev => prev.filter((_, i) => i !== index))}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white text-xs"
                          >
                            🗑️ Remove
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-white text-sm">Ad Title *</Label>
                            <Input
                              type="text"
                              value={ad.title}
                              onChange={(e) => {
                                const updated = [...adFiles];
                                updated[index].title = e.target.value;
                                setAdFiles(updated);
                              }}
                              placeholder="e.g., Midnight Ghost Tours"
                              className="bg-gray-800 border-gray-600 text-white h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Link (Optional)</Label>
                            <Input
                              type="url"
                              value={ad.link}
                              onChange={(e) => {
                                const updated = [...adFiles];
                                updated[index].link = e.target.value;
                                setAdFiles(updated);
                              }}
                              placeholder="https://your-website.com"
                              className="bg-gray-800 border-gray-600 text-white h-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-white text-sm">Description</Label>
                          <Textarea
                            value={ad.description}
                            onChange={(e) => {
                              const updated = [...adFiles];
                              updated[index].description = e.target.value;
                              setAdFiles(updated);
                            }}
                            placeholder="Brief description of your ad..."
                            className="bg-gray-800 border-gray-600 text-white min-h-[60px]"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm">Image Upload *</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const updated = [...adFiles];
                              updated[index].file = e.target.files?.[0] || null;
                              setAdFiles(updated);
                            }}
                            className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {adFiles.length < getAdLimit(hauntConfig.tier) && (
                    <Button
                      onClick={() => setAdFiles(prev => [...prev, { 
                        file: null, 
                        link: "", 
                        id: `ad${prev.length + 1}`,
                        title: "",
                        description: ""
                      }])}
                      variant="outline"
                      className="w-full border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                    >
                      ➕ Add Another Ad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Custom Trivia Section - Full Width */}
        <Card className="bg-black/60 border-gray-600 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2" style={{ color: hauntConfig.theme?.primaryColor || '#dc2626' }}>
              📝 Custom Trivia Questions
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Create custom questions specific to your haunt. Your <span className="text-white font-medium capitalize">{hauntConfig.tier}</span> tier allows up to{" "}
              <span className="text-white font-medium">{getQuestionLimit(hauntConfig.tier)}</span> custom questions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customQuestions.map((question, index) => (
                <div key={question.id || index} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-medium">Question #{index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingQuestion(question)}
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white text-xs px-2 py-1"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm("Delete this question?")) {
                            setCustomQuestions(prev => prev.filter((_, i) => i !== index));
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white text-xs px-2 py-1"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-white text-sm font-medium">Question:</p>
                      <p className="text-gray-300 text-sm">{question.question}</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Choices:</p>
                      <ul className="text-gray-300 text-sm ml-3 space-y-1">
                        {question.choices.map((choice, choiceIndex) => (
                          <li key={choiceIndex} className={choice === question.correct ? "text-green-400 font-medium" : ""}>
                            {choice === question.correct ? "✅ " : "• "}{choice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              
              {customQuestions.length < getQuestionLimit(hauntConfig.tier) && (
                <Button
                  onClick={() => setEditingQuestion({
                    question: "",
                    choices: ["", "", "", ""],
                    correct: ""
                  })}
                  variant="outline"
                  className="w-full border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                >
                  ➕ Add Custom Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={() => {
              // Handle save logic here
              toast({
                title: "Configuration Saved!",
                description: "Your haunt settings have been updated successfully.",
              });
            }}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold w-full sm:w-auto shadow-lg"
          >
            {isSaving ? "Saving..." : "💾 Save Configuration"}
          </Button>
          <Button
            onClick={() => window.location.href = `/?haunt=${hauntId}`}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white w-full sm:w-auto"
          >
            🎮 Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
}