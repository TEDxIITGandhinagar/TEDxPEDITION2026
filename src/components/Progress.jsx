import React, { useState, useEffect, useCallback } from 'react';
import { getTeamProgress, getProgressStats, listenToTeam } from '../services/gameService';

const Progress = ({ teamId }) => {
  const [progressData, setProgressData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeamProgress(teamId);
      setProgressData(data);
      setStats(getProgressStats(data.progress));
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      loadProgress();
      
      // Set up real-time listener for team updates
      const unsubscribe = listenToTeam(teamId, (updatedTeam) => {
        // Reload progress when team data changes
        loadProgress();
      });

      return () => unsubscribe();
    }
  }, [teamId, loadProgress]);

  const getStatusIcon = (status, isCurrent) => {
    if (isCurrent) {
      return <i className="fas fa-play text-blue-600 text-lg"></i>;
    }
    
    switch (status) {
      case 'correct':
        return <i className="fas fa-check-circle text-green-600 text-lg"></i>;
      case 'incorrect':
        return <i className="fas fa-times-circle text-red-600 text-lg"></i>;
      case 'skipped':
        return <i className="fas fa-forward text-orange-600 text-lg"></i>;
      case 'upcoming':
        return <i className="fas fa-circle text-gray-300 text-lg"></i>;
      default:
        return <i className="fas fa-question-circle text-gray-400 text-lg"></i>;
    }
  };

  const getStatusColor = (status, isCurrent) => {
    if (isCurrent) {
      return 'bg-blue-50 border-blue-200';
    }
    
    switch (status) {
      case 'correct':
        return 'bg-green-50 border-green-200';
      case 'incorrect':
        return 'bg-red-50 border-red-200';
      case 'skipped':
        return 'bg-orange-50 border-orange-200';
      case 'upcoming':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };



  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          <i className="fas fa-chart-line mr-2 text-blue-600"></i>
          Your Progress
        </h3>
        <div className="text-sm text-gray-600">
          {/* Score: <span className="font-semibold text-lg text-green-600">{progressData?.score || 0}</span> */}
        </div>
      </div>

      {/* Progress Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
            <div className="text-xs text-gray-600">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.skipped}</div>
            <div className="text-xs text-gray-600">Skipped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.remaining}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {stats?.completed || 0} / {stats?.totalQuestions || 0}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((stats?.completed || 0) / (stats?.totalQuestions || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-5 gap-3">
        {progressData?.progress.map((question, index) => (
          <div
            key={index}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md
              ${getStatusColor(question.status, question.isCurrent)}
              ${question.isCurrent ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
            `}
            title={`
              Q${question.questionIndex}
              Status: ${question.status}
            `}
          >
            <div className="flex flex-col items-center">
              {getStatusIcon(question.status, question.isCurrent)}
              <div className="text-xs font-semibold mt-1 text-gray-700">
                {question.questionIndex}
              </div>
            </div>
            {question.isCurrent && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-600 mr-1"></i>
            <span>Correct</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-times-circle text-red-600 mr-1"></i>
            <span>Incorrect</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-forward text-orange-600 mr-1"></i>
            <span>Skipped</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-play text-blue-600 mr-1"></i>
            <span>Current</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-circle text-gray-300 mr-1"></i>
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
