import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  getScannedTeams,
  submitTeamAnswer,
  skipTeamQuestion,
  giveTeamHint,
  getCurrentQuestion,
  getTeamData,
  saveScannedTeam,
  removeScannedTeam,
  listenToTeam
} from '../services/gameService';
import logo from '../assets/images/TEDx_Logo_Short.png'

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scannedTeams, setScannedTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamLive, setSelectedTeamLive] = useState(null); // live snapshot for timer
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQR, setScannedQR] = useState('');
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [teamAnswer, setTeamAnswer] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [answerRemaining, setAnswerRemaining] = useState(0);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    loadScannedTeams();
  }, []);

  useEffect(() => {
    if (showQRScanner && !scanner) {
      setTimeout(() => {
        initializeScanner();
      }, 100);
    } else if (!showQRScanner && scanner) {
      stopScanner();
    }
  }, [showQRScanner]);

  useEffect(() => {
    if (selectedTeam) {
      // Subscribe to the selected team's live updates for timer
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = listenToTeam(selectedTeam.id, (live) => {
        setSelectedTeamLive(live);
      });
      return () => {
        if (unsubscribeRef.current) unsubscribeRef.current();
      };
    }
  }, [selectedTeam]);

  useEffect(() => {
    let interval = null;
    if (selectedTeamLive?.answerStarted) {
      const start = selectedTeamLive.answerStartTime?.toDate?.().getTime?.() || 0;
      if (start > 0) {
        const compute = () => {
          const elapsed = Math.floor((Date.now() - start) / 1000);
          const remaining = Math.max(0, 120 - elapsed);
          setAnswerRemaining(remaining);
        };
        compute();
        interval = setInterval(compute, 1000);
      }
    } else {
      setAnswerRemaining(0);
    }
    return () => interval && clearInterval(interval);
  }, [selectedTeamLive]);

  const initializeScanner = async () => {
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      setScanner(html5Qrcode);
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        await html5Qrcode.start(
          { deviceId: cameras[0].id },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
        setIsScanning(true);
      } else {
        setError('No cameras found. Please check camera permissions.');
      }
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setError('Failed to initialize camera scanner. Please check camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scanner && isScanning) {
      try {
        await scanner.stop();
        setIsScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanner(null);
  };

  const onScanSuccess = async (decodedText) => {
    setScannedQR(decodedText);
    setShowQRScanner(false);
    
    console.log('Scanned QR code:', decodedText);
    
    try {
      const teamData = JSON.parse(decodedText);
      console.log('Parsed team data:', teamData);
      
      if (!teamData.email) {
        setError('Invalid QR code format - missing email field');
        return;
      }
      
      console.log('Looking up team for email:', teamData.email);
      
      const fullTeamData = await getTeamData(teamData.email);
      console.log('Found team data:', fullTeamData);
      
      if (fullTeamData) {
        // Validate and provide fallback values for required fields
        const teamToSave = {
          ...fullTeamData,
          name: fullTeamData.name || fullTeamData.teamName || `Team ${fullTeamData.id}`,
          email: fullTeamData.email || teamData.email,
          currentQuestion: fullTeamData.currentQuestion || fullTeamData.assignedQuestions[0],
          score: fullTeamData.score || 200
        };
        
        console.log('Team data to save:', teamToSave);
        
        await saveScannedTeam(user.email, teamToSave);
        
        const newTeam = {
          id: teamToSave.id,
          name: teamToSave.name,
          currentQuestion: teamToSave.currentQuestion,
          status: 'active',
          questionStarted: teamToSave.questionStarted || false,
          email: teamToSave.email
        };
        
        setScannedTeams((prev) => {
          const exists = prev.some((t) => t.id === newTeam.id);
          return exists ? prev : [...prev, newTeam];
        });
        setSelectedTeam(newTeam);
      } else {
        setError(`Team not found for email: ${teamData.email}. Please check if this team is properly registered.`);
      }
    } catch (parseError) {
      console.error('QR Parse Error:', parseError);
      console.error('Raw QR text:', decodedText);
      setError(`Invalid QR code format. Expected JSON with email field. Error: ${parseError.message}`);
    }
  };

  const onScanFailure = (error) => {
    console.log('QR scan failed:', error);
  };

  const loadScannedTeams = async () => {
    try {
      setLoading(true);
      const teams = await getScannedTeams(user.email);
      setScannedTeams(teams);
    } catch (error) {
      console.error('Error loading scanned teams:', error);
      setError('Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    setTeamAnswer('');
    setShowCorrectAnswer(false);
    if (team.currentQuestion) {
      try {
        const question = await getCurrentQuestion(team.currentQuestion);
        setCurrentQuestion(question);
      } catch (error) {
        console.error('Error loading question:', error);
        setError('Failed to load question.');
      }
    }
  };

  const finalizeAndRemove = async (teamId) => {
    try {
      await removeScannedTeam(user.email, teamId);
      setSelectedTeam(null);
      setSelectedTeamLive(null);
      setCurrentQuestion(null);
      setTeamAnswer('');
      setShowCorrectAnswer(false);
      setScannedTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (e) {
      await loadScannedTeams();
    }
  };

  const handleSubmitAnswer = async (isCorrect) => {
    if (!selectedTeam) return;
    try {
      await submitTeamAnswer(selectedTeam.id, selectedTeam.currentQuestion, isCorrect, teamAnswer);
      await finalizeAndRemove(selectedTeam.id);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer.');
    }
  };

  const handleSkipQuestion = async () => {
    if (!selectedTeam) return;
    try {
      await skipTeamQuestion(selectedTeam.id, selectedTeam.currentQuestion);
      await finalizeAndRemove(selectedTeam.id);
    } catch (error) {
      console.error('Error skipping question:', error);
      setError('Failed to skip question.');
    }
  };

  const handleGiveHint = async () => {
    if (!selectedTeam) return;
    try {
      await giveTeamHint(selectedTeam.id, selectedTeam.currentQuestion);
    } catch (error) {
      console.error('Error giving hint:', error);
      setError('Failed to give hint.');
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

  const renderTimer = () => {
    if (!selectedTeamLive?.answerStarted) {
      return (
        <div className="bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600 mb-4">
          Waiting for candidate to start their 2-minute answer...
        </div>
      );
    }
    return (
      <div className="text-center mb-4">
        <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">{`${Math.floor(answerRemaining / 60)}:${(answerRemaining % 60).toString().padStart(2, '0')}`}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${(answerRemaining / 120) * 100}%` }}></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading admin panel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-tedx-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl md:text-2xl font-bold"><img src={logo} alt="TEDxIITGandhinagar" className="h-8" /></h1>
              <span className="bg-red-600 px-2 py-1 rounded-full text-xs md:text-sm font-semibold">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-xs md:text-sm font-semibold hidden md:block">Admin: {user.email}</span>
              {/* Leaderboard link removed for non-superadmin users */}
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-2 py-1 md:px-4 md:py-2 rounded-lg transition duration-200 text-xs md:text-sm"><i className="fas fa-sign-out-alt mr-1 md:mr-2"></i>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-md mb-4 md:mb-6 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">QR Scanner</h2>
            <button onClick={() => setShowQRScanner(!showQRScanner)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"><i className="fas fa-qrcode mr-2"></i>{showQRScanner ? 'Close Scanner' : 'Open Scanner'}</button>
          </div>
          {showQRScanner && (
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-center">
                <div className="mb-4"><div id="qr-reader" className="mx-auto"></div></div>
                <p className="text-sm text-gray-600 mb-4">Point camera at team QR codes to scan</p>
                <p className="text-xs text-gray-500">Scan the QR code displayed on the candidate's phone screen</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Scanned Teams ({scannedTeams.length})</h2>
            {scannedTeams.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4"><i className="fas fa-qrcode text-4xl"></i></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams scanned yet</h3>
                <p className="text-gray-600 text-sm">Scan team QR codes to manage their progress</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scannedTeams.map((team) => (
                  <div key={team.id} className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedTeam?.id === team.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleTeamSelect(team)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{team.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600">Question {team.currentQuestion || 1} of 5</p>
                        {team.email && <p className="text-xs text-gray-500">{team.email}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${team.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{team.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTeam && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Manage {selectedTeam.name}</h2>
              {currentQuestion ? (
                <div>
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Question {selectedTeam.currentQuestion}</h3>
                    <p className="text-gray-700 mb-4 text-sm md:text-base">{currentQuestion.description}</p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                      <p className="text-gray-700 text-sm md:text-base">{currentQuestion.question}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Team's Answer:</h4>
                      <textarea value={teamAnswer} onChange={(e) => setTeamAnswer(e.target.value)} placeholder="Enter the team's answer here..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" />
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-yellow-900">Correct Answer:</h4>
                        <button onClick={() => setShowCorrectAnswer(!showCorrectAnswer)} className="text-yellow-700 hover:text-yellow-900 text-sm font-medium">{showCorrectAnswer ? 'Hide Answer' : 'Show Answer'}</button>
                      </div>
                      {showCorrectAnswer && <p className="text-yellow-800 font-semibold">{currentQuestion.answer}</p>}
                      <p className="text-yellow-700 text-xs mt-2">Click "Show Answer" to verify the team's response</p>
                    </div>
                    {renderTimer()}
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <button onClick={() => handleSubmitAnswer(true)} disabled={!selectedTeamLive?.answerStarted} className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg transition duration-200 text-sm ${!selectedTeamLive?.answerStarted ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                      <i className="fas fa-check mr-2"></i>Submit Correct Answer
                    </button>
                    <button onClick={() => handleSubmitAnswer(false)} disabled={!selectedTeamLive?.answerStarted} className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg transition duration-200 text-sm ${!selectedTeamLive?.answerStarted ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                      <i className="fas fa-times mr-2"></i>Submit Wrong Answer
                    </button>
                    <button onClick={handleGiveHint} disabled={!selectedTeamLive?.answerStarted} className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg transition duration-200 text-sm ${!selectedTeamLive?.answerStarted ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      <i className="fas fa-lightbulb mr-2"></i>Give Hint
                    </button>
                    <button onClick={handleSkipQuestion} disabled={!selectedTeamLive?.answerStarted} className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg transition duration-200 text-sm ${!selectedTeamLive?.answerStarted ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>
                      <i className="fas fa-forward mr-2"></i>Skip Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4"><i className="fas fa-info-circle text-4xl"></i></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active question</h3>
                  <p className="text-gray-600 text-sm">This team has completed all questions or is waiting for the next one.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;