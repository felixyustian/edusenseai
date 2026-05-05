import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage   from './pages/CoursesPage';
import TutorPage     from './pages/TutorPage';
import QuizPage      from './pages/QuizPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProgressPage  from './pages/ProgressPage';
import SettingsPage  from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0F1117' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>🎓</div>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#6C63FF', borderTopColor: 'transparent' }} />
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"  element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/courses"    element={<ProtectedRoute><AppLayout><CoursesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/tutor"      element={<ProtectedRoute><AppLayout><TutorPage /></AppLayout></ProtectedRoute>} />
      <Route path="/quiz"       element={<ProtectedRoute><AppLayout><QuizPage /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics"  element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/progress"   element={<ProtectedRoute><AppLayout><ProgressPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings"   element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
