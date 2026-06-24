import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration de votre application Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialization de Firebase
const app = initializeApp(firebaseConfig);

// Initialization de Cloud Firestore (la base de donnees) et exportation
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("DEBUG: firebaseConfig.apiKey =", firebaseConfig.apiKey);
console.log("DEBUG: auth.config.apiKey =", auth.config ? auth.config.apiKey : "undefined");
