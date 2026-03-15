import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/manage-quizzes" element={<ManageQuizzes />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/analytics/:quizId" element={<QuizAnalytics />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/manage-instructors" element={<ManageUsers />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/instructor" element={<InstructorHome />} />
          <Route path="/instructor/create-quiz" element={<CreateQuiz />} />
          <Route path="/instructor/manage-quizzes" element={<ManageQuizzes />} />
          <Route path="/instructor/add-questions/:quizId" element={<AddQuestions />} />
          <Route path="/instructor/analytics" element={<Analytics />} />
          <Route path="/instructor/analytics/:quizId" element={<QuizAnalytics />} />
          <Route path="/instructor/settings" element={<Settings />} />
          <Route path="/quiz/:quizId" element={<QuizLayout />} />
          <Route path="/result/:quizId" element={<StudentResult />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;


