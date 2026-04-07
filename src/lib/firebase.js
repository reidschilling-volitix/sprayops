/**
 * VOLITIX AG - FIREBASE CONFIGURATION
 * Permanent Database & Authentication Vault
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Fallback configuration for local development. 
// In production, these are injected via environment variables.
const fallbackConfig = {
  apiKey: "AIzaSyBiW4z1vIMlznLsHs-Xhz44chOYkiYVBKI",
  authDomain: "spray-drone-compliance-hub.firebaseapp.com",
  projectId: "spray-drone-compliance-hub",
  storageBucket: "spray-drone-compliance-hub.firebasestorage.app",
  messagingSenderId: "565689528030",
  appId: "1:565689528030:web:3e405f9d0ff30b02061c4f",
  measurementId: "G-J3QZKLGNX1"
};

// Initialize Firebase
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : fallbackConfig;
const app = initializeApp(firebaseConfig);

// Export Auth and DB instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Application ID namespace for multi-tenant isolation
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'aviation-compliance-hub';

// Enable Offline Persistence for remote field logging (Crucial for rural operations)
try {
   enableIndexedDbPersistence(db).catch((err) => {
       console.warn("Offline persistence warning. This is normal if running multiple tabs:", err.code);
   });
} catch (e) {
   console.error("Could not enable offline persistence:", e);
}
