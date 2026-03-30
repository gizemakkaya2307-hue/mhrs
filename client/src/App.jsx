import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import DoctorLogin from './pages/DoctorLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import DoctorSchedule from './pages/DoctorSchedule';
import Dependents from './pages/Dependents';
import HealthHistory from './pages/HealthHistory';
import HealthProfile from './pages/HealthProfile';
import NotificationCenter from './pages/NotificationCenter';
import Home from './pages/Home';
import DoctorPanel from './pages/DoctorPanel';
import NotFound from './pages/NotFound';
import SocketListener from './components/SocketListener';
import ErrorBoundary from './components/ErrorBoundary';
import AccessibilityManager from './components/AccessibilityManager';
import LanguageSwitcher from './components/LanguageSwitcher';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <SocketListener />
      {children}
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/dependents" element={<PrivateRoute><Dependents /></PrivateRoute>} />
      <Route path="/health-history" element={<PrivateRoute><HealthHistory /></PrivateRoute>} />
      <Route path="/health-profile" element={<PrivateRoute><HealthProfile /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationCenter /></PrivateRoute>} />
      <Route path="/doctor-panel" element={<PrivateRoute roles={['DOCTOR', 'ADMIN']}><DoctorPanel /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><Admin /></PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute roles={['DOCTOR', 'ADMIN']}><DoctorSchedule /></PrivateRoute>} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <div className="fixed top-4 right-4 z-[100]">
                <LanguageSwitcher />
            </div>
            <Toaster position="top-right" reverseOrder={false} />
            <AccessibilityManager />
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

