import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getTeamData, 
  listenToTeam, 
  getCurrentQuestion,
  startTeamQuestion,
  listenTeamScanned,
  skipTeamQuestion,
  giveTeamHint,
  getTeamQuestions
} from '../services/gameService';
import QRCode from 'qrcode';
import Progress from '../components/Progress';
import logo from '../assets/images/TEDx_Logo_Short.png';


const Candidate = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questionStarted, setQuestionStarted] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isScanned, setIsScanned] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);


  // Define functions first
  const initializeTeam = useCallback(async () => {
    try {
      setLoading(true);
      const teamData = await getTeamData(user.email);
      if (teamData) {
        setTeam(teamData);
        
        // Load current question using team ID and current question index
        const currentQuestionIndex = teamData.currentQuestionIndex || 0;

        const questions = await getTeamQuestions(teamData.id);
        
        await loadCurrentQuestion(teamData.id, currentQuestionIndex);
        
        // Check question state
        if (teamData.questionStarted) {
          setQuestionStarted(true);
        }
        
        // Count hints used for current question (now using question index)
        const hintsArray = teamData.hintsUsed || {};
        const currentHints = hintsArray[currentQuestionIndex] || 0;
        setHintsUsed(currentHints);
        if(hintsArray[currentQuestionIndex] === 0) {
          setRevealedHints([]);
        }else if(hintsArray[currentQuestionIndex] === 1){
          setRevealedHints([questions[currentQuestionIndex]['hint1']]);
        }else if(hintsArray[currentQuestionIndex] === 2){
          setRevealedHints([questions[currentQuestionIndex]['hint1'], questions[currentQuestionIndex]['hint2']]);
        }
      } else {
        setError('Team not found. Please contact the organizers.');
      }
    } catch (error) {
      console.error('Error initializing team:', error);
      setError('Failed to load team data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  const loadCurrentQuestion = async (teamId, questionIndex) => {
    try {
      const question = await getCurrentQuestion(teamId, questionIndex);
      setCurrentQuestion(question);
      // console.log('Loaded question:', questionIndex, question);
    } catch (error) {
      console.error('Error loading question:', error);
      setError('Failed to load question.');
    }
  };

  const generateQRCode = useCallback(async () => {
    if (!team) return;
    try {
      const qrData = { 
        teamId: team.id, 
        teamName: team.name, 
        email: team.email 
      };
      
      // console.log('Generating QR code with data:', qrData);
      
      const qrString = JSON.stringify(qrData);
      // console.log('QR string:', qrString);
      
      const qrDataUrl = await QRCode.toDataURL(qrString, { 
        width: 256, 
        margin: 2, 
        color: { dark: '#000000', light: '#FFFFFF' } 
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code.');
    }
  }, [team]);

  // Now useEffects that call the functions
  useEffect(() => {
    initializeTeam();
  }, [initializeTeam]);

  
  useEffect(() => {
    if (team) {
      const unsubTeam = listenToTeam(team.id, async (updatedTeam) => {
        // console.log('Team updated:', updatedTeam);
        setTeam(updatedTeam);
        
        // Load current question using team ID and current question index
        const currentQuestionIndex = updatedTeam.currentQuestionIndex || 0;
        
        // console.log('Current question index:', currentQuestionIndex);
        
        // Always load the current question when team updates
        if (!updatedTeam.gameCompleted) {
          await loadCurrentQuestion(updatedTeam.id, currentQuestionIndex);
        } else {
          // Clear current question when game is completed
          setCurrentQuestion(null);
        }
        
        // Update question state
        if (updatedTeam.questionStarted) {
          setQuestionStarted(true);
        } else {
          setQuestionStarted(false);
        }
        
        // Update hints used for current question (now using question index)
        const hintsUsedObj = updatedTeam.hintsUsed || {};
        const currentHints = hintsUsedObj[currentQuestionIndex] || 0;
        setHintsUsed(currentHints);
      });

      const unsubScanned = listenTeamScanned(team.id, (scanned) => {
        setIsScanned(scanned);
      });

      return () => {
        unsubTeam && unsubTeam();
        unsubScanned && unsubScanned();
      };
    }
  }, [team?.id, team]);

  useEffect(() => {
    if (team) {
      generateQRCode();
    }
  }, [team, generateQRCode]);

  const handleStartQuestion = async () => {
    if (!team) return;
    try {
      const currentQuestionIndex = team.currentQuestionIndex || 0;
      
      await startTeamQuestion(team.id, currentQuestionIndex);
      // Question state will sync via Firestore
    } catch (e) {
      console.error('Error starting question:', e);
    }
  };

  const handleSkipQuestion = async () => {
    if (!team || !currentQuestion) return;
    
    if (window.confirm('Are you sure you want to skip this question? You will lose 50 points.')) {
      try {
        const currentQuestionIndex = team.currentQuestionIndex || 0;
        
        await skipTeamQuestion(team.id, currentQuestionIndex);
        // Team state will update via Firestore listener
        setRevealedHints([]);
      } catch (error) {
        console.error('Error skipping question:', error);
        setError('Failed to skip question.');
      }
    }
  };

  const handleGiveHint = async () => {
    if (!team || !currentQuestion) return;
    
    const currentQuestionIndex = team.currentQuestionIndex || 0;
    
    // Get current hints used for this question (now using question index)
    const hintsUsedObj = team.hintsUsed || {};
    const questionHints = hintsUsedObj[currentQuestionIndex] || 0;
    
    if (questionHints >= 2) {
      setError('Maximum hints already used for this question');
      return;
    }
    
    const pointsToDeduct = questionHints === 0 ? 25 : 50;
    const hintKey = questionHints === 0 ? "hint1" : "hint2";
    
    if (window.confirm(`Are you sure you want a hint? You will lose ${pointsToDeduct} points.`)) {
      try {
        await giveTeamHint(team.id, currentQuestionIndex);
        setRevealedHints(prev => [...prev, currentQuestion[hintKey]]);
      } catch (error) {
        console.error('Error getting hint:', error);
        setError('Failed to get hint.');
      }
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your team...</h2>
        </div>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-tedx-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <h1 className="text-lg md:text-2xl font-bold"><img src={logo} alt="TEDxIITGandhinagar" className="h-8" /></h1>
              <span className="bg-red-600 px-2 py-1 rounded-full text-xs md:text-sm font-semibold">TEDxPEDITION</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {team && <span className="text-xs md:text-sm font-semibold hidden sm:block">Team {team.name} </span>}
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-2 py-1 md:px-4 md:py-2 rounded-lg transition duration-200 text-xs md:text-sm"><i className="fas fa-sign-out-alt mr-1 md:mr-2"></i>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-md mb-4 md:mb-6 text-sm">{error}</div>}

        {team && (
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
            {/* Check if game is completed */}
            {team.gameCompleted ? (
              <div className="text-center">
                <div className="mb-6">
                  <i className="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations, Team {team.name}!</h2>
                  <p className="text-xl text-gray-600 mb-4">You have completed all 5 questions in the TEDxPEDITION!</p>
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                    <p className="text-sm">Thank you for participating in the TEDx IIT Gandhinagar orientation TEDxPEDITION!</p>
                  </div>
                </div>
                
                {/* Progress Component */}
                {/* <Progress teamId={team.id} /> */}
              </div>
            ) : (
              <div>
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome, Team {team.name}!</h2>
                  <p className="text-gray-600 mb-4 text-sm md:text-base">Question {(team.currentQuestionIndex || 0) + 1} of 5</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(((team.currentQuestionIndex || 0) + 1) / 5) * 100}%` }}></div>
                  </div>
                </div>

                {currentQuestion ? (
                  <div className="text-center">
                    <div className="mb-4 md:mb-6">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">{currentQuestion.title}</h3>
                      <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base">{currentQuestion.description}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Show this QR code to the admin at this location:</h4>
                      <div className="bg-white p-4 rounded-lg inline-block">
                        {qrCodeUrl ? (
                          <img src={qrCodeUrl} alt="Team QR Code" className="w-32 h-32 md:w-48 md:h-48" />
                        ) : (
                          <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-200 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm md:text-base font-semibold text-blue-600 mt-4">📍 Location: {currentQuestion.location}</p>
                      <p className="text-xs text-gray-500 mt-2">Team: {team.name} | Email: {team.email}</p>
                      <p className="text-xs text-gray-400 mt-1">This QR code is unique to your team and won't change</p>
                    </div>

                    {!questionStarted && (
                      <div className="text-center mb-6">
                        <button onClick={handleStartQuestion} disabled={!isScanned} className={`px-6 py-3 md:px-8 md:py-4 rounded-lg transition duration-200 text-sm md:text-base ${!isScanned ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          <i className="fas fa-play mr-2"></i>Start Question
                        </button>
                        {!isScanned && (
                          <p className="text-xs text-gray-500 mt-2">Waiting for admin to scan your QR…</p>
                        )}
                      </div>
                    )}

                    {questionStarted && (
                      <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                        <h4 className="text-base md:text-lg font-semibold text-blue-900 mb-4">Current Question</h4>
                        
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Question:</h5>
                          <p className="text-gray-700 text-sm md:text-base">{currentQuestion.question}</p>
                          <p className="text-xs text-gray-500 mt-2">Tell your answer to the admin.</p>
                        </div>

                        {/* Skip and Hint buttons */}
                        <div className="flex flex-col gap-3 justify-center">
                          <div className='flex flex-row justify-between'>
                          <button 
                            onClick={handleGiveHint} 
                            disabled={hintsUsed >= 2}
                            className={`px-4 py-2 rounded-lg transition duration-200 text-sm ${
                              hintsUsed >= 2 
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            <i className="fas fa-lightbulb mr-2"></i>
                            Get Hint ({2 - hintsUsed} left) 
                            {hintsUsed === 0 ? ' (-25 pts)' : ' (-50 pts)'}
                          </button>
                          
                          <button 
                            onClick={handleSkipQuestion}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm"
                          >
                            <i className="fas fa-forward mr-2"></i>Skip Question (-50 pts)
                          </button>
                          </div>
                          <div>
                          {revealedHints.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                              <h5 className="font-semibold text-yellow-900 mb-2">Hints:</h5>
                              <ul className="list-disc pl-5 text-yellow-800">
                                {revealedHints.map((hint, idx) => (
                                  <li key={idx}>{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          </div>

                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">Instructions:</h4>
                      <ul className="text-blue-800 text-xs md:text-sm space-y-1">
                        <li>• Go to the location shown above</li>
                        <li>• Show your QR code to the senior team member</li>
                        <li>• Start the question when ready</li>
                        <li>• Use hints if needed (1st hint: -25 pts, 2nd hint: -50 pts)</li>
                        <li>• Tell your answer to the admin or skip if stuck (-50 pts)</li>
                        <li>• Correct answers give +100 points</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-gray-500 mb-4"><i className="fas fa-map-marker-alt text-4xl md:text-5xl"></i></div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Waiting for next question...</h3>
                    <p className="text-gray-600 text-sm md:text-base">Please wait for the admin to unlock your next question.</p>
                    {/* Show current question index for debugging */}
                    <p className="text-xs text-gray-400 mt-2">Current index: {team.currentQuestionIndex || 0}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Progress Component */}
        {team && <Progress teamId={team.id} />}
      </div>
    </div>
  );
};

export default Candidate;