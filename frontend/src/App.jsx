import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ReviewPage from "./pages/ReviewPage";
import UploadAnswersPage from "./pages/UploadAnswersPage";
import EvaluationResultsPage from "./pages/EvaluationResultsPage";
import NewLoginPage from "./pages/NewLoginPage";
import DashboardPage from "./pages/DashboardPage";
import { EvaluationProvider } from "./context/EvaluationContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <EvaluationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<NewLoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute><UploadPage /></ProtectedRoute>
            } />
            <Route path="/review" element={
              <ProtectedRoute><ReviewPage /></ProtectedRoute>
            } />
            <Route path="/evaluation/upload" element={
              <ProtectedRoute><UploadAnswersPage /></ProtectedRoute>
            } />
            <Route path="/evaluation/results" element={
              <ProtectedRoute><EvaluationResultsPage /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </EvaluationProvider>
    </AuthProvider>
  );
}

export default App;
