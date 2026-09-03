import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AccountSettingsPage from "./pages/AccountSettingsPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminPanelPage from "./pages/AdminPanelPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/admin"
        element={
          <AppShell>
            <ProtectedRoute requireAdmin>
              <AdminPanelPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route
        path="/account"
        element={
          <AppShell>
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          </AppShell>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
