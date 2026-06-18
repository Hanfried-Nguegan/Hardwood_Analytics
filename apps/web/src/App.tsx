import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { LandingPage } from "./pages/LandingPage";
import { AuthCallback } from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Protected routes — redirect to / if not logged in */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
