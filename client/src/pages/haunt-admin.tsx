import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { HauntConfig } from "@shared/schema";

export default function HauntAdmin() {
  const [, params] = useRoute("/haunt-admin/:hauntId");
  const hauntId = params?.hauntId || "";
  const { toast } = useToast();
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

  // Load haunt configuration on mount
  useEffect(() => {
    if (hauntId) {
      loadHauntConfig();
    }
  }, [hauntId]);

  const loadHauntConfig = async () => {
    setIsLoading(true);
    try {
      console.log('📋 Loading haunt config for:', hauntId);
      
      const docRef = doc(firestore, 'haunts', hauntId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const config = docSnap.data() as HauntConfig;
        setHauntConfig(config);
        setFormData({
          mode: config.mode,
          triviaFile: config.triviaFile,
          adFile: config.adFile,
          primaryColor: config.theme.primaryColor,
          secondaryColor: config.theme.secondaryColor,
          accentColor: config.theme.accentColor
        });
        console.log('✅ Haunt config loaded:', config);
      } else {
        toast({
          title: "Error",
          description: `Haunt "${hauntId}" not found`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Failed to load haunt config:', error);
      toast({
        title: "Error",
        description: "Failed to load haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!hauntConfig) return;

    setIsSaving(true);
    try {
      const updatedConfig = {
        ...hauntConfig,
        mode: formData.mode,
        triviaFile: formData.triviaFile,
        adFile: formData.adFile,
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor
        }
      };

      console.log('💾 Saving haunt config updates:', updatedConfig);
      
      const docRef = doc(firestore, 'haunts', hauntId);
      await updateDoc(docRef, updatedConfig);
      
      setHauntConfig(updatedConfig);
      
      toast({
        title: "Success!",
        description: "Haunt configuration updated successfully",
      });

      console.log('✅ Haunt config updated successfully');
    } catch (error) {
      console.error('❌ Failed to update haunt config:', error);
      toast({
        title: "Error",
        description: "Failed to update haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-red-500">
              👹 {hauntConfig.name} Admin
            </CardTitle>
            <p className="text-center text-gray-300">Manage your haunt settings</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Game Mode Section */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-400">🎮 Game Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentMode" className="text-white">Current Mode</Label>
                      <div className="text-2xl font-bold text-red-400 capitalize">
                        {hauntConfig.mode}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mode" className="text-white">Switch Mode</Label>
                      <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select game mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="individual" className="text-white hover:bg-gray-700">
                            Individual - Players compete individually
                          </SelectItem>
                          <SelectItem value="queue" className="text-white hover:bg-gray-700">
                            Queue - Players join a waiting queue
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Paths Section */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-400">📁 Content Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="triviaFile" className="text-white">Trivia File</Label>
                      <Input
                        id="triviaFile"
                        value={formData.triviaFile}
                        onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                        placeholder={`${hauntId}-trivia.json`}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adFile" className="text-white">Ad File</Label>
                      <Input
                        id="adFile"
                        value={formData.adFile}
                        onChange={(e) => handleInputChange('adFile', e.target.value)}
                        placeholder={`${hauntId}-ads.json`}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Theme Colors Section */}
            <Card className="bg-gray-900/50 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-red-400">🎨 Theme Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-white">Secondary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-white">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6"
              >
                {isSaving ? "Saving..." : "💾 Save Changes"}
              </Button>
              <Button
                onClick={() => window.location.href = `/`}
                variant="outline"
                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white py-3 px-6"
              >
                🎮 Back to Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}