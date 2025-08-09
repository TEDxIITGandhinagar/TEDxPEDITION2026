import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Admin from './pages/Admin';
import Candidate from './pages/Candidate';
import NotCandidate from './pages/NotCandidate';
import Loading from './components/Loading';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="fixed bottom-4 right-4 z-50 bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 rounded-full shadow-lg p-3 hover:scale-105 active:scale-95 transition"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
    </button>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'superadmin') {
      return <Navigate to="/superadmin" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'candidate') {
      return <Navigate to="/candidate" replace />;
    } else {
      return <Navigate to="/not-candidate" replace />;
    }
  }

  return children;
};

const AppContent = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 dark:bg-neutral-900 dark:text-neutral-100">
        <Routes>
          <Route path="/login" element={
            user ? (
              userRole === 'superadmin' ? <Navigate to="/superadmin" replace /> :
              userRole === 'admin' ? <Navigate to="/admin" replace /> :
              userRole === 'candidate' ? <Navigate to="/candidate" replace /> :
              <Navigate to="/not-candidate" replace />
            ) : <Login />
          } />
          <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdmin /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="/candidate" element={<ProtectedRoute allowedRoles={['candidate']}><Candidate /></ProtectedRoute>} />
          <Route path="/not-candidate" element={<ProtectedRoute allowedRoles={['not-candidate']}><NotCandidate /></ProtectedRoute>} />
          <Route path="/" element={
            user ? (
              userRole === 'superadmin' ? <Navigate to="/superadmin" replace /> :
              userRole === 'admin' ? <Navigate to="/admin" replace /> :
              userRole === 'candidate' ? <Navigate to="/candidate" replace /> :
              <Navigate to="/not-candidate" replace />
            ) : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ThemeToggle />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
