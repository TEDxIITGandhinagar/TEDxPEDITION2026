import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  addAdminEmail,
  getLeaderboard,
  getAdminsList
} from '../services/gameService';
import logo from '../assets/images/TEDx_Logo_Short.png';

const SuperAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    initializeSuperAdmin();
  }, []);

  const initializeSuperAdmin = async () => {
    try {
      setLoading(true);
      
      // Load leaderboard
      const leaderboardData = await getLeaderboard();
      setLeaderboard(leaderboardData);
      
      // Load admins list
      const adminsData = await getAdminsList();
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error initializing super admin:', error);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      await addAdminEmail(newAdminEmail.trim());
      setSuccess('Admin email added successfully!');
      setNewAdminEmail('');
      
      // Refresh admins list
      const adminsData = await getAdminsList();
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin email.');
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
          <h2 className="text-xl font-semibold text-gray-700">Loading super admin panel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-tedx-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold"><img src={logo} alt="TEDxIITGandhinagar" className="h-8" /></h1>
              <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                Super Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold">Super Admin: {user.email}</span>
              {/* <a 
                href="/leaderboard" 
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-200"
              >
                <i className="fas fa-trophy mr-2"></i>Leaderboard
              </a> */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Admin Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add Admin Email
            </h2>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Enter admin email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                <i className="fas fa-plus mr-2"></i>Add Admin
              </button>
            </form>

            {/* Current Admins List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Admins ({admins.length})
              </h3>
              {admins.length === 0 ? (
                <p className="text-gray-500 text-sm">No admins added yet.</p>
              ) : (
                <div className="space-y-2">
                  {admins.map((admin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{admin.email}</span>
                      <span className="text-xs text-gray-500">Admin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Leaderboard
            </h2>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <i className="fas fa-trophy text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No teams yet
                </h3>
                <p className="text-gray-600">
                  Teams will appear here as they complete questions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((team, index) => (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Team {team.name}</h3>
                        <p className="text-sm text-gray-600">
                          Question {team.currentQuestion || 0} of 5
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {team.score || 0} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {team.completionTime ? `${team.completionTime}s` : 'In Progress'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
