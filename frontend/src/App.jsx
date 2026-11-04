import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Member";
import History from "./pages/History";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AttendanceProvider } from "./context/AttendanceContext.jsx";
import { useAuth } from "./context/useAuth";

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-gray-600">Loading your account…</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route
              element={
                <AttendanceProvider>
                  <Layout />
                </AttendanceProvider>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
