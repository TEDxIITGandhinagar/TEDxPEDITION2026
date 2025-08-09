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

// Function to get random questions
const getRandomQuestions = () => {
  // Create an array of all question numbers
  const allQuestions = Array.from({length: 25}, (_, i) => i + 1);
  
  // Shuffle the array to get random order
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  
  // Return first 5 questions for the treasure hunt
  return shuffled.slice(0, 5);
};

const sampleTeams = [
  {
    name: "Team Alpha",
    email: "backupacc896578@gmail.com",
    status: "active",
    currentQuestion: 1,
    score: 0,
    questionStarted: false,
    questionSequence: getRandomQuestions() // Assign random question sequence
  },
  {
    name: "Team Beta",
    email: "rathodyuvraj1953@gmail.com",
    status: "active",
    currentQuestion: 1,
    score: 0,
    questionStarted: false,
    questionSequence: getRandomQuestions()
  },
  {
    name: "Team Gamma",
    email: "team.gamma@example.com",
    status: "active",
    currentQuestion: 1,
    score: 0,
    questionStarted: false,
    questionSequence: getRandomQuestions()
  },
  {
    name: "Team Delta",
    email: "team.delta@example.com",
    status: "active",
    currentQuestion: 1,
    score: 0,
    questionStarted: false,
    questionSequence: getRandomQuestions()
  },
  {
    name: "Team Epsilon",
    email: "team.epsilon@example.com",
    status: "active",
    currentQuestion: 1,
    score: 0,
    questionStarted: false,
    questionSequence: getRandomQuestions()
  }
];

const adminUsers = [
  { email: "just.backup.op@gmail.com" },
  { email: "rathodyuvraj1953@gmail.com" }
];

const superAdminUsers = [
  { email: "deepbuha0604@gmail.com" }
];

async function setupFirebase() {
  try {
    console.log('Setting up Firebase collections...');

    // Add teams
    console.log('Adding teams...');
    for (const team of sampleTeams) {
      await addDoc(collection(db, 'teams'), team);
      console.log(`Added team: ${team.name}`);
    }

    // Add admin users
    console.log('Adding admin users...');
    for (const admin of adminUsers) {
      await addDoc(collection(db, 'admins'), admin);
      console.log(`Added admin: ${admin.email}`);
    }

    // Add super admin users
    console.log('Adding super admin users...');
    for (const superAdmin of superAdminUsers) {
      await addDoc(collection(db, 'superadmins'), superAdmin);
      console.log(`Added super admin: ${superAdmin.email}`);
    }

    console.log('Firebase setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Firebase:', error);
  }
}

setupFirebase();
