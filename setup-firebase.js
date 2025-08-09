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

// Sample questions for teams (you should create questions separately in the questions collection)
const createSampleQuestions = (teamName) => [
  {
    title: `${teamName} Innovation Challenge`,
    video_url: "https://example.com/video1.mp4",
    location: "Main Auditorium",
    hint1: "Think about groundbreaking ideas",
    hint2: "Innovation starts with a problem"
  },
  {
    title: `${teamName} Technology Quest`,
    video_url: "https://example.com/video2.mp4",
    location: "Computer Lab",
    hint1: "The future is digital",
    hint2: "AI is transforming everything"
  },
  {
    title: `${teamName} Design Challenge`,
    video_url: "https://example.com/video3.mp4",
    location: "Design Studio",
    hint1: "Start with understanding users",
    hint2: "Empathy is the first step"
  },
  {
    title: `${teamName} Sustainability Task`,
    video_url: "https://example.com/video4.mp4",
    location: "Green Campus",
    hint1: "Think green and sustainable",
    hint2: "Small changes make big impact"
  },
  {
    title: `${teamName} Final Challenge`,
    video_url: "https://example.com/video5.mp4",
    location: "Grand Hall",
    hint1: "Bring everything together",
    hint2: "Stories inspire action"
  }
];

const sampleTeams = [
  {
    name: "Team Alpha",
    email: "backupacc896578@gmail.com",
    status: "active",
    currentQuestionIndex: 0,
    score: 200,
    questionStarted: false
  },
  {
    name: "Team Beta",
    email: "rathodyuvraj1953@gmail.com",
    status: "active",
    currentQuestionIndex: 0,
    score: 200,
    questionStarted: false
  },
  {
    name: "Team Gamma",
    email: "team.gamma@example.com",
    status: "active",
    currentQuestionIndex: 0,
    score: 200,
    questionStarted: false
  },
  {
    name: "Team Delta",
    email: "team.delta@example.com",
    status: "active",
    currentQuestionIndex: 0,
    score: 200,
    questionStarted: false
  },
  {
    name: "Team Epsilon",
    email: "team.epsilon@example.com",
    status: "active",
    currentQuestionIndex: 0,
    score: 200,
    questionStarted: false
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

    // Add teams and create questions for each team
    console.log('Adding teams...');
    for (const team of sampleTeams) {
      const teamDoc = await addDoc(collection(db, 'teams'), team);
      console.log(`Added team: ${team.name} with ID: ${teamDoc.id}`);
      
      // Create questions for this team
      const teamQuestions = createSampleQuestions(team.name);
      await setDoc(doc(db, 'questions', teamDoc.id), {
        questions: teamQuestions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created questions for team: ${team.name}`);
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
    console.log('Teams have been created with their respective questions in the questions collection.');
  } catch (error) {
    console.error('Error setting up Firebase:', error);
  }
}

setupFirebase();
