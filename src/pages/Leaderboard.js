import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/gameService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import logo from '../assets/images/TEDx_Logo_Short.png';

const Leaderboard = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [useRealTime, setUseRealTime] = useState(true);

  // Real-time listener for immediate updates
  useEffect(() => {
    if (useRealTime) {
      const teamsRef = collection(db, 'teams');
      
      const unsubscribe = onSnapshot(teamsRef, (snapshot) => {
        try {
          const teamsList = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Ensure score exists and calculate additional stats
            const score = data.score || 200;
            const currentQuestionIndex = data.currentQuestionIndex || 0;
            const questionsCompleted = Object.keys(data.questionStatuses || {}).length;
            const gameCompleted = data.gameCompleted || false;
            
            // Calculate completion time if game is completed
            let completionTime = null;
            if (gameCompleted && data.gameCompletedAt && data.createdAt) {
              const startTime = data.createdAt.toDate();
              const endTime = data.gameCompletedAt.toDate();
              completionTime = Math.floor((endTime - startTime) / 1000); // in seconds
            }
            
            teamsList.push({
              id: doc.id,
              ...data,
              score,
              currentQuestionIndex,
              questionsCompleted,
              gameCompleted,
              completionTime,
              status: getTeamStatus(data)
            });
          });

          // Enhanced sorting logic
          teamsList.sort((a, b) => {
            // First sort by score (highest first)
            if (b.score !== a.score) {
              return b.score - a.score;
            }
            
            // If scores are equal, prioritize completed games
            if (a.gameCompleted && !b.gameCompleted) return -1;
            if (!a.gameCompleted && b.gameCompleted) return 1;
            
            // If both completed, sort by completion time (faster wins)
            if (a.gameCompleted && b.gameCompleted && a.completionTime && b.completionTime) {
              return a.completionTime - b.completionTime;
            }
            
            // If both incomplete, sort by questions completed
            if (b.questionsCompleted !== a.questionsCompleted) {
              return b.questionsCompleted - a.questionsCompleted;
            }
            
            // Finally, sort by current question index
            return b.currentQuestionIndex - a.currentQuestionIndex;
          });

          setLeaderboard(teamsList);
          setLastUpdated(new Date());
          setError('');
          setLoading(false);
        } catch (err) {
          console.error('Error updating leaderboard:', err);
          setError('Failed to update leaderboard');
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      // Fallback to polling method
      loadLeaderboard();
      const interval = setInterval(loadLeaderboard, 5000);
      return () => clearInterval(interval);
    }
  }, [useRealTime]);

  const getTeamStatus = (data) => {
    if (data.gameCompleted) return 'Completed';
    if (data.answerStarted || data.questionStarted) return 'Answering';
    return 'In Progress';
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      
      // Add additional calculated fields
      const enhancedData = data.map(team => {
        const questionsCompleted = Object.keys(team.questionStatuses || {}).length;
        let completionTime = null;
        
        if (team.gameCompleted && team.gameCompletedAt && team.createdAt) {
          const startTime = team.createdAt.toDate();
          const endTime = team.gameCompletedAt.toDate();
          completionTime = Math.floor((endTime - startTime) / 1000);
        }
        
        return {
          ...team,
          questionsCompleted,
          completionTime,
          status: getTeamStatus(team)
        };
      });
      
      setLeaderboard(enhancedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
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

  const handleReturn = () => {
    const path = userRole === 'superadmin' ? '/superadmin' : userRole === 'admin' ? '/admin' : '/candidate';
    navigate(path);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProgressWidth = (currentQuestionIndex) => {
    return Math.min(((currentQuestionIndex || 0) / 5) * 100, 100);
  };

  const getProgressColor = (currentQuestionIndex, gameCompleted) => {
    if (gameCompleted) return 'bg-green-500';
    const progress = (currentQuestionIndex || 0) / 5;
    if (progress >= 0.8) return 'bg-blue-500';
    if (progress >= 0.6) return 'bg-yellow-500';
    if (progress >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRankBadge = (index, score) => {
    const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4";
    switch (index) {
      case 0:
        return `${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`;
      case 1:
        return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg`;
      case 2:
        return `${baseClasses} bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg`;
      default:
        return `${baseClasses} bg-gradient-to-br from-red-500 to-red-700`;
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return index + 1;
    }
  };

  const returnLabel = userRole === 'superadmin' ? 'Super Admin Panel' : userRole === 'admin' ? 'Admin Panel' : 'Return to Game';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-tedx-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold"><img src={logo} alt="TEDxIITGandhinagar" className="h-8" /></h1>
              <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                Live Leaderboard
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-300">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm font-semibold">
                  {user.email}
                </span>
              )}
              <button
                onClick={() => setUseRealTime(!useRealTime)}
                className={`px-3 py-1 rounded text-xs ${useRealTime ? 'bg-green-600' : 'bg-gray-600'}`}
                title={useRealTime ? 'Real-time ON' : 'Real-time OFF'}
              >
                {useRealTime ? '🔴 LIVE' : '⏸️ POLL'}
              </button>
              <button
                onClick={handleReturn}
                className="bg-white text-tedx-black px-3 py-2 rounded-lg transition duration-200 hover:bg-gray-100"
              >
                <i className="fas fa-arrow-left mr-2"></i>{returnLabel}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-200"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-tedx-black mb-4">
            Live Leaderboard
          </h1>
          <p className="text-xl text-gray-600">
            Real-time rankings and scores of all teams
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading leaderboard...</h2>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-trophy text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No teams yet
            </h2>
            <p className="text-gray-600">
              Teams will appear here as they complete questions and earn points
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Rankings ({leaderboard.length} teams)
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🏁 Completed: {leaderboard.filter(t => t.gameCompleted).length}</span>
                  <span>🎮 In Progress: {leaderboard.filter(t => !t.gameCompleted).length}</span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboard.map((team, index) => (
                <div key={team.id} className={`px-6 py-4 hover:bg-gray-50 transition duration-200 ${team.gameCompleted ? 'bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={getRankBadge(index, team.score)}>
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Team {team.name}
                            {team.gameCompleted && <span className="ml-2 text-green-600">✅</span>}
                          </h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {team.score || 0}
                            </div>
                            <div className="text-sm text-gray-500">points</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress: {team.questionsCompleted}/5 questions</span>
                            <span className={`font-semibold ${
                              team.status === 'Completed' ? 'text-green-600' :
                              team.status === 'Answering' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {team.status}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(team.currentQuestionIndex, team.gameCompleted)}`}
                              style={{ width: `${getProgressWidth(team.currentQuestionIndex)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div className="flex space-x-4">
                            <span>Current: Q{(team.currentQuestionIndex || 0) + 1}</span>
                            {team.completionTime && (
                              <span className="text-green-600 font-semibold">
                                ⏱️ {formatTime(team.completionTime)}
                              </span>
                            )}
                            {team.memberEmails && team.memberEmails.length > 1 && (
                              <span>👥 {team.memberEmails.length} members</span>
                            )}
                          </div>
                          <div>
                            {team.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              <i className="fas fa-trophy mr-2"></i>Scoring System
            </h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• <strong>Correct Answer:</strong> 50-100 points (time-based)</li>
              <li>• <strong>Wrong Answer:</strong> 0 points</li>
              <li>• <strong>Skip Question:</strong> -100 points</li>
              <li>• <strong>Use Hint:</strong> -50 points</li>
              <li>• <strong>Starting Score:</strong> 200 points</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              <i className="fas fa-info-circle mr-2"></i>Leaderboard Info
            </h3>
            <ul className="text-green-800 text-sm space-y-2">
              <li>• <strong>Real-time updates</strong> every few seconds</li>
              <li>• <strong>Ranked by:</strong> Score → Completion Time → Progress</li>
              <li>• <strong>🥇🥈🥉</strong> Top 3 teams highlighted</li>
              <li>• <strong>✅</strong> Completed games marked</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;