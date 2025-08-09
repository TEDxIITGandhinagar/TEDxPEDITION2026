// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBQQ4RQZhDqm1lB1TQs8TkOMIPmAWmV7zU",
    authDomain: "tedx-5d2ce.firebaseapp.com",
    projectId: "tedx-5d2ce",
    storageBucket: "tedx-5d2ce.firebasestorage.app",
    messagingSenderId: "498889009556",
    appId: "1:498889009556:web:c3cd0067b747d198b54781",
    measurementId: "G-ZZQD3RZHH8"
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
