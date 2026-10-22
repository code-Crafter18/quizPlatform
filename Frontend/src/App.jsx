import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import InstructorHome from './pages/InstructorHome';
import QuizLayout from './pages/QuizLayout';
import CreateQuiz from './pages/CreateQuiz';
import ManageQuizzes from './pages/ManageQuizzes';
import AddQuestions from './pages/AddQuestions';
import Analytics from './pages/Analytics';
import QuizAnalytics from './pages/QuizAnalytics';
import StudentResult from './pages/StudentResult';
import ManageUsers from './pages/ManageUsers';
import Settings from './pages/Settings';

import PendingApproval from './pages/PendingApproval';
import Invitations from './pages/Invitations';
import InviteUsers from './pages/InviteUsers';

function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  let bgClass = "bg-gradient-to-b from-slate-900 to-slate-950"; // Default Dark Slate

  if (path.startsWith("/admin")) {
    bgClass = "bg-gradient-to-b from-slate-900 to-teal-950";
  } else if (path.startsWith("/instructor")) {
    bgClass = "bg-gradient-to-b from-slate-900 to-indigo-950";
  }

  return (
    <div className="min-h-screen relative">
      <div className={`fixed inset-0 -z-10 ${bgClass}`} />
      {children}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Student Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "instructor"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invitations"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Invitations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:quizId"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <QuizLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result/:quizId"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "instructor"]}>
                  <StudentResult />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-quizzes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/:quizId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <QuizAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-instructors"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Instructor Protected Routes */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <InstructorHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/create-quiz"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/manage-quizzes"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <ManageQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/add-questions/:quizId"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <AddQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/analytics"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/analytics/:quizId"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <QuizAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/settings"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/invite/:quizId"
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <InviteUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
