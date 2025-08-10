// Firebase Setup Script for TEDxIITGandhinagar
// This script helps initialize the Firebase collections and sample data

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

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
const db = getFirestore(app);