import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import type { HauntConfig } from "@shared/schema";

interface CustomTriviaQuestion {
  id?: string;
  question: string;
  choices: string[];
  correct: string;
}

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
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adFiles, setAdFiles] = useState<Array<{ file: File | null; link: string; id: string }>>([]);
  
  // Custom trivia state
  const [customQuestions, setCustomQuestions] = useState<CustomTriviaQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    choices: ["", "", "", ""],
    correct: ""
  });

  // Get ad limits based on tier
  const getAdLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 3;
      case 'pro': return 5;
      case 'premium': return 10;
      default: return 3;
    }
  };

  // Get custom trivia limits based on tier
  const getTriviaLimit = (tier: string) => {
    switch (tier) {
      case 'basic': return 5;
      case 'pro': return 15;
      case 'premium': return 50;
      default: return 5;
    }
  };

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

  // Load haunt configuration on mount
  useEffect(() => {
    if (hauntId) {
      loadHauntConfig();
      loadCustomQuestions();
    }
  }, [hauntId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      setLogoFile(file);
    }
  };

  const handleAdFileUpload = (index: number, file: File | null) => {
    setAdFiles(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].file = file;
      }
      return updated;
    });
  };

  const handleAdLinkChange = (index: number, link: string) => {
    setAdFiles(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].link = link;
      }
      return updated;
    });
  };

  const addAdSlot = () => {
    if (!hauntConfig) return;
    const limit = getAdLimit(hauntConfig.tier);
    if (adFiles.length < limit) {
      setAdFiles(prev => [...prev, { file: null, link: "", id: `ad${prev.length + 1}` }]);
    }
  };

  const removeAdSlot = (index: number) => {
    setAdFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Initialize ad slots when haunt config loads
  useEffect(() => {
    if (hauntConfig && adFiles.length === 0) {
      // Initialize with one empty ad slot
      setAdFiles([{ file: null, link: "", id: "ad1" }]);
    }
  }, [hauntConfig]);

  const loadCustomQuestions = async () => {
    try {
      console.log('📚 Loading custom trivia questions for:', hauntId);
      const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const questions: CustomTriviaQuestion[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as CustomTriviaQuestion);
      });
      
      setCustomQuestions(questions);
      console.log('✅ Custom trivia questions loaded:', questions);
    } catch (error) {
      console.error('❌ Failed to load custom trivia questions:', error);
    }
  };

  const handleQuestionChange = (value: string) => {
    setNewQuestion(prev => ({ ...prev, question: value }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    setNewQuestion(prev => {
      const newChoices = [...prev.choices];
      newChoices[index] = value;
      return { ...prev, choices: newChoices };
    });
  };

  const handleCorrectAnswerChange = (choice: string, checked: boolean) => {
    if (checked) {
      setNewQuestion(prev => ({ ...prev, correct: choice }));
    }
  };

  const addCustomQuestion = async () => {
    if (!hauntConfig) return;
    
    // Validate question
    if (!newQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    // Validate all choices are filled
    if (newQuestion.choices.some(choice => !choice.trim())) {
      toast({
        title: "Error", 
        description: "Please fill in all answer choices",
        variant: "destructive"
      });
      return;
    }

    // Validate correct answer is selected
    if (!newQuestion.correct) {
      toast({
        title: "Error",
        description: "Please select the correct answer",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('💾 Adding custom trivia question:', newQuestion);
      
      const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
      await addDoc(questionsRef, {
        question: newQuestion.question,
        choices: newQuestion.choices,
        correct: newQuestion.correct
      });

      toast({
        title: "Success!",
        description: "Custom trivia question added",
      });

      // Reset form
      setNewQuestion({
        question: "",
        choices: ["", "", "", ""],
        correct: ""
      });

      // Reload questions
      loadCustomQuestions();
    } catch (error) {
      console.error('❌ Failed to add custom trivia question:', error);
      toast({
        title: "Error",
        description: "Failed to add trivia question",
        variant: "destructive"
      });
    }
  };

  const deleteCustomQuestion = async (questionId: string) => {
    try {
      console.log('🗑️ Deleting custom trivia question:', questionId);
      
      const questionRef = doc(firestore, 'trivia-custom', hauntId, 'questions', questionId);
      await deleteDoc(questionRef);

      toast({
        title: "Success!",
        description: "Trivia question deleted",
      });

      // Reload questions
      loadCustomQuestions();
    } catch (error) {
      console.error('❌ Failed to delete custom trivia question:', error);
      toast({
        title: "Error",
        description: "Failed to delete trivia question",
        variant: "destructive"
      });
    }
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

            {/* Logo Upload Section */}
            <Card className="bg-gray-900/50 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-red-400">🖼️ Logo Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Upload your haunt logo. Recommended size: 600x300 PNG
                  </p>
                  <div>
                    <Label htmlFor="logoUpload" className="text-white">Logo Upload</Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    />
                    {logoFile && (
                      <p className="text-green-400 text-sm mt-2">
                        ✅ Selected: {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Images Section */}
            <Card className="bg-gray-900/50 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-red-400">📢 Advertisement Images</CardTitle>
                <p className="text-gray-300 text-sm">
                  Your <span className="text-red-400 font-bold capitalize">{hauntConfig.tier}</span> subscription tier allows up to{" "}
                  <span className="text-red-400 font-bold">{getAdLimit(hauntConfig.tier)}</span> ad images. 
                  Recommended size: 800x400 PNG.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {adFiles.map((ad, index) => (
                    <div key={ad.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold">Ad #{index + 1}</h4>
                        {adFiles.length > 1 && (
                          <Button
                            onClick={() => removeAdSlot(index)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                          >
                            🗑️ Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Image Upload</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAdFileUpload(index, e.target.files?.[0] || null)}
                            className="bg-gray-800 border-gray-600 text-white file:bg-red-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                          />
                          {ad.file && (
                            <p className="text-green-400 text-sm mt-2">
                              ✅ Selected: {ad.file.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-white">Link (Optional)</Label>
                          <Input
                            type="url"
                            value={ad.link}
                            onChange={(e) => handleAdLinkChange(index, e.target.value)}
                            placeholder="https://example.com/vip"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {adFiles.length < getAdLimit(hauntConfig.tier) && (
                    <Button
                      onClick={addAdSlot}
                      variant="outline"
                      className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                    >
                      ➕ Add Another Ad Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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

            {/* Custom Trivia Section */}
            <Card className="bg-gray-900/50 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-red-400">🧠 Custom Trivia Questions</CardTitle>
                <p className="text-gray-300 text-sm">
                  Your <span className="text-red-400 font-bold capitalize">{hauntConfig.tier}</span> subscription allows up to{" "}
                  <span className="text-red-400 font-bold">{getTriviaLimit(hauntConfig.tier)}</span> custom questions.{" "}
                  Current: <span className="text-red-400 font-bold">{customQuestions.length}</span>
                </p>
              </CardHeader>
              <CardContent>
                {customQuestions.length >= getTriviaLimit(hauntConfig.tier) ? (
                  <div className="text-center p-8 border border-gray-600 rounded-lg bg-gray-800/50">
                    <h3 className="text-red-400 font-bold text-lg mb-2">Limit Reached</h3>
                    <p className="text-gray-300">
                      You've reached your custom trivia limit for your current plan. 
                      Upgrade your tier for more question slots.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Add Question Form */}
                    <div className="border border-gray-600 rounded-lg p-6 bg-gray-800/50">
                      <h3 className="text-white font-bold text-lg mb-4">Add New Question</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Question</Label>
                          <Textarea
                            value={newQuestion.question}
                            onChange={(e) => handleQuestionChange(e.target.value)}
                            placeholder="What spirit haunts the boiler room?"
                            className="bg-gray-800 border-gray-600 text-white"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newQuestion.choices.map((choice, index) => (
                            <div key={index} className="space-y-2">
                              <Label className="text-white">Answer {index + 1}</Label>
                              <div className="flex gap-2 items-center">
                                <Checkbox
                                  checked={newQuestion.correct === choice}
                                  onCheckedChange={(checked) => handleCorrectAnswerChange(choice, checked as boolean)}
                                  className="border-gray-600"
                                />
                                <Input
                                  value={choice}
                                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                                  placeholder={`Answer ${index + 1}`}
                                  className="bg-gray-800 border-gray-600 text-white flex-1"
                                />
                              </div>
                              {newQuestion.correct === choice && (
                                <p className="text-green-400 text-sm">✅ Correct Answer</p>
                              )}
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={addCustomQuestion}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          ➕ Add Question
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Questions List */}
                {customQuestions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-white font-bold text-lg mb-4">Your Custom Questions</h3>
                    <div className="space-y-4">
                      {customQuestions.map((question, index) => (
                        <div key={question.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-white font-bold">Question #{index + 1}</h4>
                            <Button
                              onClick={() => question.id && deleteCustomQuestion(question.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-gray-300">
                              <span className="font-bold text-white">Q:</span> {question.question}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.choices.map((choice, choiceIndex) => (
                                <div
                                  key={choiceIndex}
                                  className={`p-2 rounded border ${
                                    choice === question.correct
                                      ? 'border-green-500 bg-green-500/20 text-green-400'
                                      : 'border-gray-600 text-gray-300'
                                  }`}
                                >
                                  {choice === question.correct && '✅ '}{choice}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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