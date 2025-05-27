// Open browser console on your app and run this code to add authentication
// Copy and paste this entire block:

(async function addAuthCode() {
  try {
    // Import Firebase functions (assuming they're available globally)
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    // Get firestore instance from your app
    const firestore = window.firestore || 
      (await import('/src/lib/firebase.js')).firestore;
    
    const hauntRef = doc(firestore, 'haunts', 'widowshollow');
    await updateDoc(hauntRef, {
      authCode: 'spooky123'
    });
    
    console.log('✅ Auth code added successfully!');
    console.log('🔑 Use these credentials to log in:');
    console.log('   Haunt ID: widowshollow');
    console.log('   Access Code: spooky123');
    console.log('📍 Go to /haunt-auth to log in');
    
  } catch (error) {
    console.error('❌ Error adding auth code:', error);
    console.log('💡 Try running this in the browser console while on your app');
  }
})();
