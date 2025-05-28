// HAUNT ADMIN PAGE - KEY CODE SECTIONS
// =====================================

// 1. CUSTOM QUESTION SAVING FUNCTION
const saveCustomQuestions = async (questions) => {
  try {
    // Clear existing questions first
    const questionsRef = collection(firestore, 'trivia-custom', hauntId, 'questions');
    const existingQuestions = await getDocs(questionsRef);
    
    // Delete existing questions
    for (const questionDoc of existingQuestions.docs) {
      await deleteDoc(questionDoc.ref);
    }
    
    // Add new questions
    for (const question of questions) {
      await addDoc(questionsRef, {
        question: question.question,
        choices: question.choices,
        correct: question.correct,
        timestamp: new Date().toISOString()
      });
    }
    
    toast({
      title: "Questions Saved",
      description: `${questions.length} custom questions saved successfully`,
    });
  } catch (error) {
    console.error('Failed to save questions:', error);
    toast({
      title: "Error",
      description: "Failed to save custom questions",
      variant: "destructive"
    });
  }
};

// 2. ADD CUSTOM QUESTION BUTTON
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

// 3. SAVE QUESTION BUTTON IN MODAL
<Button
  onClick={async () => {
    if (editingQuestion.question && editingQuestion.choices.every(c => c.trim()) && editingQuestion.correct) {
      if (editingQuestion.question && customQuestions.find(q => q.question === editingQuestion.question)) {
        // Update existing
        setCustomQuestions(prev => prev.map(q => 
          q.question === editingQuestion.question ? editingQuestion : q
        ));
      } else {
        // Add new
        setCustomQuestions(prev => [...prev, {...editingQuestion, id: `q${Date.now()}`}]);
      }
      // Save questions immediately after adding/editing
      const updatedQuestions = editingQuestion.question && customQuestions.find(q => q.question === editingQuestion.question) 
        ? customQuestions.map(q => q.question === editingQuestion.question ? editingQuestion : q)
        : [...customQuestions, {...editingQuestion, id: `q${Date.now()}`}];
      saveCustomQuestions(updatedQuestions); // THIS SHOULD SAVE TO FIREBASE
      setEditingQuestion(null);
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a correct answer",
        variant: "destructive"
      });
    }
  }}
  className="bg-green-600 hover:bg-green-700 text-white"
>
  Save Question
</Button>

// 4. ADS SAVING FUNCTION  
const saveAds = async () => {
  try {
    // Clear existing ads first
    const adsRef = collection(firestore, 'haunt-ads', hauntId, 'ads');
    const existingAds = await getDocs(adsRef);
    
    // Delete existing ads
    for (const adDoc of existingAds.docs) {
      await deleteDoc(adDoc.ref);
    }
    
    // Upload and save new ads (only those with image files)
    let savedAdsCount = 0;
    for (const ad of adFiles) {
      if (ad.file) {
        try {
          // Upload image to Firebase Storage
          const imageRef = ref(storage, `haunt-assets/${hauntId}/ads/${ad.id}.${ad.file.name.split('.').pop()}`);
          await uploadBytes(imageRef, ad.file);
          const imageUrl = await getDownloadURL(imageRef);
          
          // Save ad data to Firestore
          await addDoc(adsRef, {
            title: ad.title || "Untitled Ad",
            description: ad.description || "Check this out!",
            link: ad.link || "#",
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
          });
          savedAdsCount++;
        } catch (uploadError) {
          console.error(`Failed to upload ad ${ad.title || 'Untitled'}:`, uploadError);
        }
      }
    }
    
    toast({
      title: "Ads Saved",
      description: `${savedAdsCount} ads saved successfully`,
    });
  } catch (error) {
    console.error('Failed to save ads:', error);
    toast({
      title: "Error", 
      description: "Failed to save ads",
      variant: "destructive"
    });
  }
};

// 5. LOGO UPLOAD FUNCTION
const handleSave = async () => {
  setIsSaving(true);
  try {
    let logoPath = hauntConfig?.logoPath || "";

    // Upload logo if a new file was selected
    if (logoFile) {
      try {
        // Force authentication check
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });
        
        const currentUser = auth.currentUser;
        console.log('Current user:', currentUser ? currentUser.uid : 'Not authenticated');
        
        if (!currentUser) {
          // Sign in anonymously if not authenticated
          const { signInAnonymously } = await import('firebase/auth');
          await signInAnonymously(auth);
          console.log('Signed in anonymously for upload');
        }
        
        console.log('Uploading logo for haunt:', hauntId);
        const logoRef = ref(storage, `haunt-assets/${hauntId}/logo.${logoFile.name.split('.').pop()}`);
        console.log('Upload path:', `haunt-assets/${hauntId}/logo.${logoFile.name.split('.').pop()}`);
        
        const uploadResult = await uploadBytes(logoRef, logoFile);
        console.log('Upload successful:', uploadResult);
        
        logoPath = await getDownloadURL(logoRef);
        console.log('Download URL:', logoPath);
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        toast({
          title: "Logo Upload Failed",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive"
        });
        return; // Don't save config if logo upload fails
      }
    }

    // Save configuration
    const updatedConfig = {
      ...hauntConfig,
      mode: formData.mode,
      logoPath: logoPath,
      // ... other config
    };

    const docRef = doc(firestore, 'haunts', hauntId);
    await updateDoc(docRef, updatedConfig);
    
    setHauntConfig(updatedConfig);
    
    // Save custom questions if any exist
    if (customQuestions.length > 0) {
      await saveCustomQuestions(customQuestions);
    }
    
    // Save ads if any exist
    if (adFiles.length > 0 && adFiles.some(ad => ad.file)) {
      await saveAds(); // THIS SHOULD SAVE ADS TO FIREBASE
    }
    
    toast({
      title: "Success!",
      description: "Haunt configuration, questions, and ads saved successfully!",
    });
  } catch (error) {
    console.error('Failed to update haunt config:', error);
    toast({
      title: "Error",
      description: "Failed to update haunt configuration",
      variant: "destructive"
    });
  } finally {
    setIsSaving(false);
  }
};

// POTENTIAL ISSUES TO CHECK:
// 1. Firebase Storage rules - may not allow public writes
// 2. Firebase authentication - anonymous auth might not have upload permissions  
// 3. Question saving might not be triggered from the main save button
// 4. Ad files array might be empty when save is called
// 5. Logo upload path might not have proper permissions

// DEBUG STEPS:
// 1. Check browser console for Firebase errors
// 2. Verify Firebase Storage rules allow write access
// 3. Check if saveCustomQuestions is called from main save button
// 4. Verify adFiles array has files when saveAds is called