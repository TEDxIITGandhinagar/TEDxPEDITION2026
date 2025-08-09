import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Fetch questions from database based on team ID
export const getTeamQuestions = async (teamId) => {
  try {
    const questionsRef = doc(db, 'questions', teamId);
    const questionsSnap = await getDoc(questionsRef);
    
    if (questionsSnap.exists()) {
      const data = questionsSnap.data();
      return data.questions || []; // Returns array of 5 questions
    } else {
      throw new Error(`No questions found for team ID: ${teamId}`);
    }
  } catch (error) {
    console.error('Error fetching team questions:', error);
    throw error;
  }
};

export const getCurrentQuestion = async (teamId, questionIndex) => {
  try {
    const questions = await getTeamQuestions(teamId);
    return questions[questionIndex] || null;
  } catch (error) {
    console.error('Error getting current question:', error);
    return null;
  }
};

export const getRandomQuestions = () => {
  // DEPRECATED: This function is no longer used
  // Questions are now pre-assigned in the database per team
  console.warn('getRandomQuestions is deprecated - questions should be pre-assigned in database');
  return [];
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
    
    // console.log(`No team found for email: ${email}`);
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
    
    const teamData = {
      name: teamName,
      email: primaryEmail, // Keep for backward compatibility
      memberEmails: memberEmails, // Array of all member emails
      leaderEmail: primaryEmail,
      score: 200,
      currentQuestionIndex: 0, // Index in questions array (0-4)
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
export const saveScannedTeam = async (adminEmail, teamData) => {
  try {
    // Validate required fields and provide fallbacks
    const validatedTeamData = {
      id: teamData.id || '',
      name: teamData.name || teamData.teamName || `Team ${teamData.id || 'Unknown'}`,
      email: teamData.email || '',
      memberEmails: teamData.memberEmails || [teamData.email || ''],
      currentQuestionIndex: teamData.currentQuestionIndex || 0,
      score: typeof teamData.score === 'number' ? teamData.score : 200
    };
    
    // console.log('Saving scanned team with validated data:', validatedTeamData);
    
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
        currentQuestionIndex: validatedTeamData.currentQuestionIndex,
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
export const startTeamQuestion = async (teamId, questionIndex) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');
    
    const data = teamSnap.data();
    const currentQuestionIndex = data.currentQuestionIndex || 0;
    
    // Verify the question index matches the current question index
    if (questionIndex !== currentQuestionIndex) {
      console.warn(`Question index mismatch: expected ${currentQuestionIndex}, got ${questionIndex}`);
    }
    
    await updateDoc(teamRef, {
      questionStarted: true,
      questionStartTime: serverTimestamp(),
      answerStarted: true,
      answerStartTime: serverTimestamp(),
      currentQuestionIndex: questionIndex
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
export const submitTeamAnswer = async (teamId, questionIndex, isCorrect, answer = '') => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');

    const data = teamSnap.data();
    const currentQuestionIndex = data.currentQuestionIndex || 0;
    const currentScore = data.score || 200;
    
    // Fetch questions to get total count
    const questions = await getTeamQuestions(teamId);
    
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
    const isGameCompleted = nextQuestionIndex >= questions.length;

    // Update question status tracking
    const questionStatuses = data.questionStatuses || {};
    questionStatuses[questionIndex] = {
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
          // console.log(`Removed ${deletePromises.length} scanned entries for team ${teamId}`);
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
export const skipTeamQuestion = async (teamId, questionIndex) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error('Team not found');
    const data = teamSnap.data();

    const currentQuestionIndex = data.currentQuestionIndex || 0;
    const currentScore = data.score || 200;
    
    // Fetch questions to get total count
    const questions = await getTeamQuestions(teamId);
    
    const nextQuestionIndex = currentQuestionIndex + 1;
    const isGameCompleted = nextQuestionIndex >= questions.length;

    // Calculate new score (subtract 100 for skipping)
    const newScore = currentScore - 100;

    // Update question status tracking
    const questionStatuses = data.questionStatuses || {};
    questionStatuses[questionIndex] = {
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
    const currentQuestionIndex = teamData.currentQuestionIndex || 0;
    
    // Fetch questions from database
    const questions = await getTeamQuestions(teamId);
    
    if (questions.length !== 5) {
      throw new Error(`Expected 5 questions for team ${teamId}, but found ${questions.length}`);
    }
    
    const totalQuestions = questions.length; // Should be 5
    const progress = [];
    
    // Create progress for team questions
    questions.forEach((question, index) => {
      const status = questionStatuses[index]; // Use index as key since we don't have question numbers
      
      progress.push({
        questionIndex: index + 1, // Display as 1-5
        video_url: question.video_url || '',
        location: question.location || '',
        hint1: question.hint1 || '',
        hint2: question.hint2 || '',
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
      currentQuestion: questions[currentQuestionIndex] || questions[0],
      questions,
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
    
    
    
    
    
    // Specific search for the email
    const qEmail = query(teamsRef, where('email', '==', email));
    const emailSnapshot = await getDocs(qEmail);
    
    // console.log(`=== SEARCH FOR EMAIL: ${email} ===`);
    if (!emailSnapshot.empty) {
      emailSnapshot.forEach((doc) => {
        // console.log('Found team by email:', doc.id, doc.data());
      });
    } else {
      // console.log('No team found with email:', email);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Call this function in your Admin component after scanning fails
// debugTeamStructure('just.backup.op@gmail.com');

// Helper function to create questions document for a team
export const createTeamQuestions = async (teamId, questions) => {
  try {
    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error('Questions must be an array of exactly 5 questions');
    }
    
    // Validate each question has required fields
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.video_url || !question.location || !question.hint1 || !question.hint2) {
        throw new Error(`Question ${i + 1} is missing required fields: video_url, location, hint1, hint2`);
      }
    }
    
    const questionsRef = doc(db, 'questions', teamId);
    await setDoc(questionsRef, {
      questions: questions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // console.log(`Questions created for team ${teamId}`);
    return true;
  } catch (error) {
    console.error('Error creating team questions:', error);
    throw error;
  }
};

// Example function to create sample questions for testing
export const createSampleQuestions = (teamId) => {
  const sampleQuestions = [
    {
      title: "Innovation Challenge",
      video_url: "https://example.com/video1.mp4",
      location: "Main Auditorium",
      hint1: "This is the first hint for innovation challenge",
      hint2: "This is the second hint for innovation challenge"
    },
    {
      title: "Technology Quest",
      video_url: "https://example.com/video2.mp4", 
      location: "Computer Lab",
      hint1: "Technology shapes our future",
      hint2: "Think about artificial intelligence"
    },
    {
      title: "Design Thinking",
      video_url: "https://example.com/video3.mp4",
      location: "Design Studio", 
      hint1: "Start with empathy",
      hint2: "Understand user needs first"
    },
    {
      title: "Sustainability Challenge",
      video_url: "https://example.com/video4.mp4",
      location: "Green Campus",
      hint1: "Think about the environment",
      hint2: "Reduce, reuse, recycle"
    },
    {
      title: "Final Challenge",
      video_url: "https://example.com/video5.mp4",
      location: "Grand Hall",
      hint1: "Combine all your learnings",
      hint2: "The power of storytelling"
    }
  ];
  
  return createTeamQuestions(teamId, sampleQuestions);
};