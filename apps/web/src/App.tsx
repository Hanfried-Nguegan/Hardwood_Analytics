import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { LandingPage } from "./pages/LandingPage";
import { AuthCallback } from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Teams from "./pages/dashboard/Teams";
import Simulations from "./pages/dashboard/Simulations";
import Comparisons from "./pages/dashboard/Comparisons";
import Games from "./pages/dashboard/Games";
import Analytics from "./pages/dashboard/Analytics";
import AIAssistant from "./pages/dashboard/AIAssistant";
import Settings from "./pages/dashboard/Settings";
import { Players } from "./pages/dashboard/Players";
import { IngestPanel } from "./components/IngestPanel";

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
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="players" element={<Players />} />
            <Route path="teams" element={<Teams />} />
            <Route path="simulations" element={<Simulations />} />
            <Route path="comparisons" element={<Comparisons />} />
            <Route path="games" element={<Games />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ingest" element={<IngestPanel/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
