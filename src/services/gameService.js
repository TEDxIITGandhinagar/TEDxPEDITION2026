import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, increment, arrayUnion } from 'firebase/firestore';

export const QUESTIONS = {
  1: {
    title: "Innovation Challenge",
    description: "Solve this puzzle about TEDx innovation",
    question: "What is the main theme of TEDxIITGandhinagar 2026?",
    answer: "Innovation",
    location: "Main Auditorium",
    videoUrl: "https://example.com/video1.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  2: {
    title: "Technology Puzzle",
    description: "Decode this technological mystery",
    question: "Which technology is most likely to shape the future of education?",
    answer: "Artificial Intelligence",
    location: "Computer Lab",
    videoUrl: "https://example.com/video2.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  3: {
    title: "Design Thinking",
    description: "Apply design thinking principles",
    question: "What is the first step in the design thinking process?",
    answer: "Empathize",
    location: "Design Studio",
    videoUrl: "https://example.com/video3.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  4: {
    title: "Sustainability Challenge",
    description: "Think about environmental solutions",
    question: "What is the most effective way to reduce carbon footprint in cities?",
    answer: "Public Transportation",
    location: "Green Campus",
    videoUrl: "https://example.com/video4.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  5: {
    title: "Final Challenge",
    description: "The ultimate test of your knowledge",
    question: "What makes TEDx talks so impactful and memorable?",
    answer: "Storytelling",
    location: "Grand Hall",
    videoUrl: "https://example.com/video5.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  6: {
    title: "Science Discovery",
    description: "Explore scientific concepts",
    question: "What is the hardest natural substance on Earth?",
    answer: "Diamond",
    location: "Science Lab",
    videoUrl: "https://example.com/video6.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  7: {
    title: "History Mystery",
    description: "Uncover historical facts",
    question: "In which year was the first TED conference held?",
    answer: "1984",
    location: "History Room",
    videoUrl: "https://example.com/video7.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  8: {
    title: "Mathematics Challenge",
    description: "Solve mathematical puzzles",
    question: "What is the value of π (pi) to two decimal places?",
    answer: "3.14",
    location: "Math Center",
    videoUrl: "https://example.com/video8.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  9: {
    title: "Literature Quest",
    description: "Explore literary works",
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare",
    location: "Library",
    videoUrl: "https://example.com/video9.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  10: {
    title: "Geography Explorer",
    description: "Discover world geography",
    question: "What is the capital of Japan?",
    answer: "Tokyo",
    location: "Geography Room",
    videoUrl: "https://example.com/video10.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  11: {
    title: "Art Appreciation",
    description: "Understand artistic concepts",
    question: "Who painted the Mona Lisa?",
    answer: "Leonardo da Vinci",
    location: "Art Gallery",
    videoUrl: "https://example.com/video11.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  12: {
    title: "Music Theory",
    description: "Learn musical concepts",
    question: "How many notes are in a standard octave?",
    answer: "8",
    location: "Music Room",
    videoUrl: "https://example.com/video12.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  13: {
    title: "Physics Principles",
    description: "Understand physical laws",
    question: "What is the SI unit of force?",
    answer: "Newton",
    location: "Physics Lab",
    videoUrl: "https://example.com/video13.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  14: {
    title: "Chemistry Elements",
    description: "Explore chemical elements",
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    location: "Chemistry Lab",
    videoUrl: "https://example.com/video14.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  15: {
    title: "Biology Basics",
    description: "Learn biological concepts",
    question: "What is the powerhouse of the cell?",
    answer: "Mitochondria",
    location: "Biology Lab",
    videoUrl: "https://example.com/video15.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  16: {
    title: "Computer Science",
    description: "Understand programming concepts",
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language",
    location: "Computer Lab",
    videoUrl: "https://example.com/video16.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  17: {
    title: "Economics Insight",
    description: "Learn economic principles",
    question: "What is the study of how people make choices called?",
    answer: "Economics",
    location: "Economics Room",
    videoUrl: "https://example.com/video17.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  18: {
    title: "Psychology Basics",
    description: "Understand human behavior",
    question: "Who is considered the father of psychology?",
    answer: "Wilhelm Wundt",
    location: "Psychology Lab",
    videoUrl: "https://example.com/video18.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  19: {
    title: "Philosophy Quest",
    description: "Explore philosophical ideas",
    question: "Who said 'I think, therefore I am'?",
    answer: "René Descartes",
    location: "Philosophy Room",
    videoUrl: "https://example.com/video19.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  20: {
    title: "Astronomy Discovery",
    description: "Explore the universe",
    question: "What is the closest planet to the Sun?",
    answer: "Mercury",
    location: "Observatory",
    videoUrl: "https://example.com/video20.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  21: {
    title: "Environmental Science",
    description: "Learn about the environment",
    question: "What gas do plants absorb from the atmosphere?",
    answer: "Carbon Dioxide",
    location: "Greenhouse",
    videoUrl: "https://example.com/video21.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  22: {
    title: "Engineering Principles",
    description: "Understand engineering concepts",
    question: "What is the study of motion called?",
    answer: "Kinematics",
    location: "Engineering Lab",
    videoUrl: "https://example.com/video22.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  23: {
    title: "Medicine Basics",
    description: "Learn medical concepts",
    question: "What is the largest organ in the human body?",
    answer: "Skin",
    location: "Medical Center",
    videoUrl: "https://example.com/video23.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  24: {
    title: "Architecture Design",
    description: "Understand architectural concepts",
    question: "What is the study of building design called?",
    answer: "Architecture",
    location: "Design Studio",
    videoUrl: "https://example.com/video24.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  },
  25: {
    title: "Final Masterpiece",
    description: "The ultimate challenge",
    question: "What is the purpose of TEDx events?",
    answer: "Share Ideas Worth Spreading",
    location: "Grand Hall",
    videoUrl: "https://example.com/video25.mp4",
    hint1: "It starts with understanding and connecting with your users' feelings.",
    hint2: "It starts with understanding and connecting with your users' feelings.",
  }
};

export const getCurrentQuestion = async (questionNumber) => {
  return QUESTIONS[questionNumber] || null;
};

export const getRandomQuestions = () => {
  // Create an array of all question numbers
  const allQuestions = Array.from({length: 25}, (_, i) => i + 1);
  
  // Shuffle the array to get random order
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  
  // Return first 5 questions for the treasure hunt
  return shuffled.slice(0, 5);
};

// Auto-initialize team score to 200 once
async function ensureStartingScore(teamDocId, data) {
  const hasScore = typeof data.score === 'number';
  if (!hasScore) {
    const ref = doc(db, 'teams', teamDocId);
    await updateDoc(ref, { score: 200, scoreInitialized: true });
    return 200;
  }
  return data.score;
}

export const getTeamData = async (email) => {
  try {
    const teamsRef = collection(db, 'teams');
    
    // First try to find team where the email matches the primary email field
    const qEmail = query(teamsRef, where('email', '==', email));
    const emailSnapshot = await getDocs(qEmail);
    
    if (!emailSnapshot.empty) {
      const teamDoc = emailSnapshot.docs[0];
      const data = teamDoc.data();
      const score = await ensureStartingScore(teamDoc.id, data);
      
      // Ensure memberEmails array exists for backward compatibility
      if (!data.memberEmails) {
        const updateData = { memberEmails: [email] };
        await updateDoc(doc(db, 'teams', teamDoc.id), updateData);
        data.memberEmails = [email];
      }
      
      return { id: teamDoc.id, ...data, score };
    }
    
    // Then try to find team where the email is in the memberEmails array
    const qArray = query(teamsRef, where('memberEmails', 'array-contains', email));
    const arraySnapshot = await getDocs(qArray);
    
    if (!arraySnapshot.empty) {
      const teamDoc = arraySnapshot.docs[0];
      const data = teamDoc.data();
      const score = await ensureStartingScore(teamDoc.id, data);
      return { id: teamDoc.id, ...data, score };
    }
    
    console.log(`No team found for email: ${email}`);
    return null;
  } catch (error) {
    console.error('Error getting team data:', error);
    throw error;
  }
};

export const listenToTeam = (teamId, callback) => {
  const teamRef = doc(db, 'teams', teamId);
  return onSnapshot(teamRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

/**
 * TEAM MEMBER MANAGEMENT FUNCTIONS
 * 
 * The system now supports teams with multiple members (up to 3 per team).
 * Each team has:
 * - email: Primary email (leader's email, kept for backward compatibility)
 * - memberEmails: Array of all team member emails
 * - leaderEmail: Email of the team leader
 * 
 * Database structure example:
 * {
 *   name: "Team Alpha",
 *   email: "leader@example.com",
 *   memberEmails: ["leader@example.com", "member2@example.com", "member3@example.com"],
 *   leaderEmail: "leader@example.com",
 *   score: 200,
 *   currentQuestion: 1,
 *   ...
 * }
 */

// Helper function to create a team with multiple member emails
export const createTeamWithMembers = async (teamName, memberEmails, leaderEmail = null) => {
  try {
    if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
      throw new Error('memberEmails must be a non-empty array');
    }
    
    // Use leader email as primary email, or first email if no leader specified
    const primaryEmail = leaderEmail || memberEmails[0];
    
    // Get 5 random questions for this team
    const assignedQuestions = getRandomQuestions();
    
    const teamData = {
      name: teamName,
      email: primaryEmail, // Keep for backward compatibility
      memberEmails: memberEmails, // Array of all member emails
      leaderEmail: primaryEmail,
      assignedQuestions: assignedQuestions, // Array of 5 question numbers
      score: 200,
      currentQuestion: assignedQuestions[0],
      currentQuestionIndex: 0, // Index in assignedQuestions array (0-4)
      questionStarted: false,
      answerStarted: false,
      questionStatuses: {}, // Initialize empty question statuses object
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const teamsRef = collection(db, 'teams');
    const docRef = await addDoc(teamsRef, teamData);
    
    return { id: docRef.id, ...teamData };
  } catch (error) {
    console.error('Error creating team with members:', error);
    throw error;
  }
};

// Helper function to check if an email belongs to any team
export const checkEmailInTeam = async (email) => {
  try {
    const teamData = await getTeamData(email);
    return teamData !== null;
  } catch (error) {
    console.error('Error checking email in team:', error);
    return false;
  }
};

// Helper function to add a member to an existing team
export const addMemberToTeam = async (teamId, newMemberEmail) => {
  try {
    // Check if email is already in another team
    const existingTeam = await getTeamData(newMemberEmail);
    if (existingTeam && existingTeam.id !== teamId) {
      throw new Error('Email is already part of another team');
    }
    
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    
    if (!teamSnap.exists()) {
      throw new Error('Team not found');
    }
    
    const teamData = teamSnap.data();
    const currentMembers = teamData.memberEmails || [teamData.email];
    
    // Check if member is already in the team
    if (currentMembers.includes(newMemberEmail)) {
      throw new Error('Email is already a member of this team');
    }
    
    // Add new member to the team
    const updatedMembers = [...currentMembers, newMemberEmail];
    
    await updateDoc(teamRef, {
      memberEmails: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    return { id: teamId, ...teamData, memberEmails: updatedMembers };
  } catch (error) {
    console.error('Error adding member to team:', error);
    throw error;
  }
};

// Upsert a scanned team document keyed by admin+team to avoid duplicates
// Upsert a scanned team document keyed by admin+team to avoid duplicates
export const saveScannedTeam = async (adminEmail, teamData) => {
  try {
    // Validate required fields and provide fallbacks
    const validatedTeamData = {
      id: teamData.id || '',
      name: teamData.name || teamData.teamName || `Team ${teamData.id || 'Unknown'}`,
      email: teamData.email || '',
      memberEmails: teamData.memberEmails || [teamData.email || ''],
      currentQuestion: teamData.currentQuestion || teamData.assignedQuestions[0],
      score: typeof teamData.score === 'number' ? teamData.score : 200
    };
    
    console.log('Saving scanned team with validated data:', validatedTeamData);
    
    const id = `${adminEmail}_${validatedTeamData.id}`;
    const scannedDocRef = doc(db, 'scannedTeams', id);
    
    await setDoc(
      scannedDocRef,
      {
        adminEmail,
        teamId: validatedTeamData.id,
        teamName: validatedTeamData.name,
        teamEmail: validatedTeamData.email,
        memberEmails: validatedTeamData.memberEmails,
        scannedAt: serverTimestamp(),
        currentQuestion: validatedTeamData.currentQuestion,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving scanned team:', error);
    console.error('Team data that failed:', teamData);
    throw error;
  }
};

export const removeScannedTeam = async (adminEmail, teamId) => {
  try {
    const id = `${adminEmail}_${teamId}`;
    await deleteDoc(doc(db, 'scannedTeams', id));
  } catch (error) {
    console.error('Error removing scanned team:', error);
    throw error;
  }
};

export const getScannedTeams = async (adminEmail) => {
  try {
    const scannedRef = collection(db, 'scannedTeams');
    const q = query(scannedRef, where('adminEmail', '==', adminEmail));
    const querySnapshot = await getDocs(q);

    const uniqueByTeam = new Map();
    for (const scannedSnapshot of querySnapshot.docs) {
      const data = scannedSnapshot.data();
      const teamRef = doc(db, 'teams', data.teamId);
      const teamSnapshot = await getDoc(teamRef);
      if (teamSnapshot.exists()) {
        const teamData = teamSnapshot.data();
        const score = await ensureStartingScore(teamSnapshot.id, teamData);
        uniqueByTeam.set(teamSnapshot.id, { id: teamSnapshot.id, ...teamData, score });
      }
    }
    return Array.from(uniqueByTeam.values());
  } catch (error) {
    console.error('Error getting scanned teams:', error);
    throw error;
  }
};

// Candidate starts question: also starts shared 2-minute window
export const startTeamQuestion = async (teamId, questionNumber) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');
    
    const data = teamSnap.data();
    const assignedQuestions = data.assignedQuestions || [];
    const currentQuestionIndex = data.currentQuestionIndex || 0;
    
    // Verify the question number matches the current assigned question
    const expectedQuestion = assignedQuestions[currentQuestionIndex];
    if (questionNumber !== expectedQuestion) {
      console.warn(`Question mismatch: expected ${expectedQuestion}, got ${questionNumber}`);
    }
    
    await updateDoc(teamRef, {
      questionStarted: true,
      questionStartTime: serverTimestamp(),
      answerStarted: true,
      answerStartTime: serverTimestamp(),
      currentQuestion: questionNumber
    });
  } catch (error) {
    console.error('Error starting team question:', error);
    throw error;
  }
};

function computeTimeBasedPoints(elapsedSeconds) {
  // Points start counting after 60s (video). <=70s => 100, then -10 every +10s, min 50 by 120s
  if (elapsedSeconds <= 70) return 100;
  if (elapsedSeconds <= 80) return 90;
  if (elapsedSeconds <= 90) return 80;
  if (elapsedSeconds <= 100) return 70;
  if (elapsedSeconds <= 110) return 60;
  if (elapsedSeconds <= 120) return 50;
  return 0;
}

// FIXED: Submit team answer with proper score calculation and immediate next question update
export const submitTeamAnswer = async (teamId, questionNumber, isCorrect, answer = '') => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');

    const data = teamSnap.data();
    const assignedQuestions = data.assignedQuestions || [];
    const currentQuestionIndex = data.currentQuestionIndex || 0;
    const currentScore = data.score || 200;
    
    const startTs = data.answerStartTime?.toDate?.() || data.questionStartTime?.toDate?.();
    const elapsedSeconds = startTs ? Math.floor((Date.now() - startTs.getTime()) / 1000) : 9999;

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = computeTimeBasedPoints(elapsedSeconds);
    } else {
      // Wrong answer gives 0 additional points
      pointsEarned = 0;
    }

    // Calculate new score
    const newScore = currentScore + pointsEarned;

    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = assignedQuestions[nextQuestionIndex] || null;
    const isGameCompleted = nextQuestionIndex >= assignedQuestions.length;

    // Update question status tracking
    const questionStatuses = data.questionStatuses || {};
    questionStatuses[questionNumber] = {
      status: isCorrect ? 'correct' : 'incorrect',
      answer: answer,
      pointsEarned: pointsEarned,
      timeElapsed: elapsedSeconds,
      completedAt: serverTimestamp()
    };

    const updateData = {
      currentQuestionIndex: nextQuestionIndex,
      questionStarted: false,
      answerStarted: false,
      answerStartTime: null,
      questionStartTime: null,
      lastAnswerCorrect: isCorrect,
      lastAnswer: answer,
      lastAnswerTime: serverTimestamp(),
      questionStatuses: questionStatuses,
      score: newScore, // Set absolute score instead of increment
      updatedAt: serverTimestamp()
    };

    // Mark game as completed if all questions are done
    if (isGameCompleted) {
      updateData.gameCompleted = true;
      updateData.gameCompletedAt = serverTimestamp();
    }

    // Always update currentQuestion for immediate UI update
    if (nextQuestion) {
      updateData.currentQuestion = nextQuestion;
    } else if (isGameCompleted) {
      // Clear current question when game is completed
      updateData.currentQuestion = null;
    }

    await updateDoc(teamRef, updateData);

    // IMPORTANT: Remove the team from scanned teams so they need to be scanned again for the next question
    if (!isGameCompleted) {
      try {
        // Remove all scanned entries for this team so admin needs to scan again
        const scannedRef = collection(db, 'scannedTeams');
        const qScanned = query(scannedRef, where('teamId', '==', teamId));
        const scannedSnapshot = await getDocs(qScanned);
        
        const deletePromises = scannedSnapshot.docs.map(doc => deleteDoc(doc.ref));
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
          console.log(`Removed ${deletePromises.length} scanned entries for team ${teamId}`);
        }
      } catch (error) {
        console.error('Error removing scanned teams:', error);
        // Continue execution even if cleanup fails
      }
    }

    // Return updated team data for immediate UI updates
    return {
      ...data,
      ...updateData,
      id: teamId
    };
  } catch (error) {
    console.error('Error submitting team answer:', error);
    throw error;
  }
};

// FIXED: Skip team question with proper score calculation and immediate next question update
// FIXED: Skip team question with proper score calculation and immediate next question update
export const skipTeamQuestion = async (teamId, questionNumber) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');
    const data = teamSnap.data();

    const assignedQuestions = data.assignedQuestions || [];
    const currentQuestionIndex = data.currentQuestionIndex || 0;
    const currentScore = data.score || 200;
    
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = assignedQuestions[nextQuestionIndex] || null;
    const isGameCompleted = nextQuestionIndex >= assignedQuestions.length;

    // Calculate new score (subtract 100 for skipping)
    const newScore = currentScore - 100;

    // Update question status tracking
    const questionStatuses = data.questionStatuses || {};
    questionStatuses[questionNumber] = {
      status: 'skipped',
      answer: '',
      pointsEarned: -100,
      timeElapsed: 0,
      completedAt: serverTimestamp()
    };

    const updateData = {
      currentQuestionIndex: nextQuestionIndex,
      questionStarted: false,
      answerStarted: false,
      answerStartTime: null,
      questionStartTime: null,
      lastAnswerCorrect: false,
      lastAnswerTime: serverTimestamp(),
      questionStatuses: questionStatuses,
      score: newScore, // Set absolute score instead of increment
      updatedAt: serverTimestamp()
    };

    // Mark game as completed if all questions are done
    if (isGameCompleted) {
      updateData.gameCompleted = true;
      updateData.gameCompletedAt = serverTimestamp();
    }

    // Always update currentQuestion for immediate UI update
    if (nextQuestion) {
      updateData.currentQuestion = nextQuestion;
    } else if (isGameCompleted) {
      // Clear current question when game is completed
      updateData.currentQuestion = null;
    }

    await updateDoc(teamRef, updateData);

    // IMPORTANT: Remove the team from scanned teams so they need to be scanned again for the next question
    if (!isGameCompleted) {
      // Remove all scanned entries for this team so admin needs to scan again
      const scannedRef = collection(db, 'scannedTeams');
      const qScanned = query(scannedRef, where('teamId', '==', teamId));
      const scannedSnapshot = await getDocs(qScanned);
      
      const deletePromises = [];
      scannedSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    }

    // Return updated team data for immediate UI updates
    return {
      ...data,
      ...updateData,
      id: teamId
    };
  } catch (error) {
    console.error('Error skipping team question:', error);
    throw error;
  }
};

export const giveTeamHint = async (teamId, questionNumber) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');
    const data = teamSnap.data();

    // Initialize hintsUsed as an object to track hints per question
    const hintsUsed = data.hintsUsed || {};
    const questionHints = hintsUsed[questionNumber] || 0; // Number of hints used for this question
    const currentScore = data.score || 200;

    // Maximum 2 hints per question
    if (questionHints >= 2) {
      throw new Error('Maximum hints already used for this question');
    }

    // Calculate points to deduct: first hint -25, second hint -50
    const pointsToDeduct = questionHints === 0 ? 25 : 50;
    const newScore = currentScore - pointsToDeduct;
    
    // Update hints used for this specific question
    const updatedHintsUsed = {
      ...hintsUsed,
      [questionNumber]: questionHints + 1
    };

    await updateDoc(teamRef, {
      hintsUsed: updatedHintsUsed,
      hintGiven: true,
      hintTime: serverTimestamp(),
      score: newScore,
      updatedAt: serverTimestamp()
    });

    return {
      hintsUsedForQuestion: questionHints + 1,
      pointsDeducted: pointsToDeduct,
      newScore: newScore
    };
  } catch (error) {
    console.error('Error giving team hint:', error);
    throw error;
  }
};

export const addAdminEmail = async (email) => {
  try {
    const adminsRef = collection(db, 'admins');
    await addDoc(adminsRef, {
      email,
      addedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding admin email:', error);
    throw error;
  }
};

export const getAdminsList = async () => {
  try {
    const adminsRef = collection(db, 'admins');
    const querySnapshot = await getDocs(adminsRef);

    const admins = [];
    querySnapshot.forEach((snapshot) => {
      admins.push({ id: snapshot.id, ...snapshot.data() });
    });
    return admins;
  } catch (error) {
    console.error('Error getting admins list:', error);
    throw error;
  }
};

export const getLeaderboard = async () => {
  try {
    const teamsRef = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsRef);

    const teams = [];
    for (const snapshot of querySnapshot.docs) {
      const data = snapshot.data();
      // Initialize missing score to 200
      if (typeof data.score !== 'number') {
        await updateDoc(doc(db, 'teams', snapshot.id), { score: 200, scoreInitialized: true });
        data.score = 200;
      }
      teams.push({ id: snapshot.id, ...data });
    }
    // Sort by score desc
    teams.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return teams;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

export const listenTeamScanned = (teamId, callback) => {
  const scannedRef = collection(db, 'scannedTeams');
  const qRef = query(scannedRef, where('teamId', '==', teamId));
  return onSnapshot(qRef, (snap) => {
    callback(!snap.empty);
  });
};

// Helper function to get team progress with question statuses
export const getTeamProgress = async (teamId) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    
    if (!teamSnap.exists()) {
      throw new Error('Team not found');
    }
    
    const teamData = teamSnap.data();
    const questionStatuses = teamData.questionStatuses || {};
    const assignedQuestions = teamData.assignedQuestions || [];
    const currentQuestionIndex = teamData.currentQuestionIndex || 0;
    
    // If team doesn't have assigned questions (old teams), assign them now
    if (assignedQuestions.length === 0) {
      const randomQuestions = getRandomQuestions();
      await updateDoc(teamRef, { 
        assignedQuestions: randomQuestions,
        currentQuestionIndex: 0 
      });
      assignedQuestions.push(...randomQuestions);
    }
    
    const totalQuestions = assignedQuestions.length; // Should be 5
    const progress = [];
    
    // Create progress for assigned questions only
    assignedQuestions.forEach((questionNumber, index) => {
      const questionData = QUESTIONS[questionNumber];
      const status = questionStatuses[questionNumber];
      
      progress.push({
        questionNumber: questionNumber,
        questionIndex: index + 1, // Display as 1-5 instead of actual question numbers
        title: questionData?.title || `Question ${questionNumber}`,
        status: status ? status.status : (index < currentQuestionIndex ? 'not-attempted' : 'upcoming'),
        pointsEarned: status?.pointsEarned || 0,
        timeElapsed: status?.timeElapsed || 0,
        answer: status?.answer || '',
        completedAt: status?.completedAt || null,
        isCurrent: index === currentQuestionIndex
      });
    });
    
    return {
      currentQuestionIndex,
      currentQuestion: assignedQuestions[currentQuestionIndex] || assignedQuestions[0],
      assignedQuestions,
      totalQuestions,
      score: teamData.score || 200,
      progress
    };
  } catch (error) {
    console.error('Error getting team progress:', error);
    throw error;
  }
};

// Helper function to get progress statistics
export const getProgressStats = (progress) => {
  const correct = progress.filter(q => q.status === 'correct').length;
  const incorrect = progress.filter(q => q.status === 'incorrect').length;
  const skipped = progress.filter(q => q.status === 'skipped').length;
  const completed = correct + incorrect + skipped;
  const remaining = progress.filter(q => q.status === 'upcoming').length;
  
  return {
    correct,
    incorrect,
    skipped,
    completed,
    remaining,
    totalQuestions: progress.length
  };
};

// Add this temporary debug function to your gameService.js
export const debugTeamStructure = async (email) => {
  try {
    const teamsRef = collection(db, 'teams');
    
    // Get all teams to see the structure
    const allTeamsSnapshot = await getDocs(teamsRef);
    console.log('=== ALL TEAMS STRUCTURE DEBUG ===');
    
    allTeamsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Team ID: ${doc.id}`);
      console.log('Team data:', data);
      console.log('Fields present:', Object.keys(data));
      console.log('Name field:', data.name);
      console.log('TeamName field:', data.teamName);
      console.log('Email field:', data.email);
      console.log('MemberEmails field:', data.memberEmails);
      console.log('---');
    });
    
    // Specific search for the email
    const qEmail = query(teamsRef, where('email', '==', email));
    const emailSnapshot = await getDocs(qEmail);
    
    console.log(`=== SEARCH FOR EMAIL: ${email} ===`);
    if (!emailSnapshot.empty) {
      emailSnapshot.forEach((doc) => {
        console.log('Found team by email:', doc.id, doc.data());
      });
    } else {
      console.log('No team found with email:', email);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Call this function in your Admin component after scanning fails
// debugTeamStructure('just.backup.op@gmail.com');