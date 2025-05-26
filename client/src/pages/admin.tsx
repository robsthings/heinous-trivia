import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { HauntConfig } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    logoPath: "",
    triviaFile: "",
    adFile: "",
    primaryColor: "#8B0000",
    secondaryColor: "#2D1B69",
    accentColor: "#FF6B35"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name) {
      toast({
        title: "Error",
        description: "Haunt ID and Name are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const hauntConfig: HauntConfig = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        logoPath: formData.logoPath || `/haunt-assets/${formData.id}/logo.png`,
        triviaFile: formData.triviaFile || `${formData.id}-trivia.json`,
        adFile: formData.adFile || `${formData.id}-ads.json`,
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor
        }
      };

      console.log('🔥 Saving haunt config to Firebase:', hauntConfig);
      
      // Save to Firebase
      const docRef = doc(firestore, 'haunts', formData.id);
      await setDoc(docRef, hauntConfig);
      
      console.log('✅ Haunt config saved successfully!');
      
      toast({
        title: "Success!",
        description: `Haunt "${formData.name}" saved to Firebase`,
      });

      // Clear form
      setFormData({
        id: "",
        name: "",
        description: "",
        logoPath: "",
        triviaFile: "",
        adFile: "",
        primaryColor: "#8B0000",
        secondaryColor: "#2D1B69",
        accentColor: "#FF6B35"
      });

    } catch (error) {
      console.error('❌ Failed to save haunt config:', error);
      toast({
        title: "Error",
        description: "Failed to save haunt configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/80 border-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-red-500">
              🎃 Heinous Trivia Admin
            </CardTitle>
            <p className="text-center text-gray-300">Add New Haunt Configuration</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id" className="text-white">Haunt ID *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    placeholder="e.g., mansionofmadness"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-white">Haunt Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Mansion of Madness"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A chilling description of this haunted location..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="logoPath" className="text-white">Logo Path</Label>
                  <Input
                    id="logoPath"
                    value={formData.logoPath}
                    onChange={(e) => handleInputChange('logoPath', e.target.value)}
                    placeholder={`/haunt-assets/${formData.id || 'hauntid'}/logo.png`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triviaFile" className="text-white">Trivia File</Label>
                  <Input
                    id="triviaFile"
                    value={formData.triviaFile}
                    onChange={(e) => handleInputChange('triviaFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-trivia.json`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="adFile" className="text-white">Ad File</Label>
                  <Input
                    id="adFile"
                    value={formData.adFile}
                    onChange={(e) => handleInputChange('adFile', e.target.value)}
                    placeholder={`${formData.id || 'hauntid'}-ads.json`}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white mb-4 block">Theme Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm text-gray-300">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm text-gray-300">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-sm text-gray-300">Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
                      />
                      <Input
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
              >
                {isLoading ? "Saving to Firebase..." : "💾 Save Haunt Configuration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          >
            🎮 Back to Game
          </Button>
        </div>
      </div>
    </div>
  );
}