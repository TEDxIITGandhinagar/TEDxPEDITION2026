import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const Leaderboard = () => {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'superadmin') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  if (userRole !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-tedx-black mb-4">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-600">
              View participant rankings and scores
            </p>
          </div>

          {/* Placeholder for leaderboard components */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600">Leaderboard functionalities will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
