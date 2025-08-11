// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMjpRHo3Qal-KtsrmLAB1RJCJXLpmxABI",
  authDomain: "tedxpedition26.firebaseapp.com",
  projectId: "tedxpedition26",
  storageBucket: "tedxpedition26.firebasestorage.app",
  messagingSenderId: "382120351045",
  appId: "1:382120351045:web:1221066bdb01ed3c8cda2c",
  measurementId: "G-36FS92ZF9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User role checking functions
export const checkUserRole = async (email) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Check super admin
    const superAdminQuery = query(collection(db, 'superadmins'), where('email', '==', email));
    const superAdminSnapshot = await getDocs(superAdminQuery);
    if (!superAdminSnapshot.empty) {
      return 'superadmin';
    }
    
    // Check admin
    const adminQuery = query(collection(db, 'admins'), where('email', '==', email));
    const adminSnapshot = await getDocs(adminQuery);
    if (!adminSnapshot.empty) {
      return 'admin';
    }
    
    // Default to candidate
    return 'candidate';
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'candidate';
  }
};

export default app;
