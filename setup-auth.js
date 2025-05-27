// Quick script to add authentication to your existing haunt
// Run this in browser console or as a one-time setup

import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "./client/src/lib/firebase.js";

async function addAuthCode() {
  try {
    const hauntRef = doc(firestore, 'haunts', 'widowshollow');
    await updateDoc(hauntRef, {
      authCode: 'spooky123'  // You can change this to any password you want
    });
    console.log('✅ Auth code added to widowshollow haunt!');
    console.log('🔑 Access Code: spooky123');
    console.log('🏠 Haunt ID: widowshollow');
  } catch (error) {
    console.error('❌ Failed to add auth code:', error);
  }
}

// Uncomment the line below to run
// addAuthCode();