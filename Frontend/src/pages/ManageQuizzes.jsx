import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManageQuizzes() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null")?.role || "";
        } catch {
            return "";
        }
    });
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [publishing, setPublishing] = useState(null);

    const isInstructor = userRole === "instructor";
    const dashboardPath = isInstructor ? "/instructor" : "/admin";
    const createQuizPath = isInstructor ? "/instructor/create-quiz" : "/admin/create-quiz";
    const addQuestionsBasePath = isInstructor ? "/instructor/add-questions" : "/admin/add-questions";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (!["admin", "instructor"].includes(parsed.role)) {
            navigate("/home", { replace: true });
            return;
        }
        setUserRole(parsed.role);
        fetchQuizzes();
    }, [navigate]);

    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/quiz/admin/quizzes", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(res.data.quizzes);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
            setError(err.response?.data?.error || "Failed to fetch quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (quizId) => {
        setPublishing(quizId);
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `http://localhost:5000/api/quiz/${quizId}/publish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh quizzes list
            fetchQuizzes();
        } catch (err) {
            console.error("Error publishing quiz:", err);
            setError(err.response?.data?.error || "Failed to publish quiz");
        } finally {
            setPublishing(null);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(dashboardPath)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Manage Quizzes</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">All Quizzes</h2>
                            <p className="text-slate-400">
                                {isInstructor ? "Manage your quizzes, add questions, and publish" : "View all quizzes and publishing status"}
                            </p>
                        </div>
                    </div>
                    {isInstructor && (
                        <button
                            onClick={() => navigate(createQuizPath)}
                            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Quiz
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
                        <p className="text-slate-400 mb-6">
                            {isInstructor ? "Create your first quiz to get started" : "No quizzes have been created yet"}
                        </p>
                        {isInstructor && (
                            <button
                                onClick={() => navigate(createQuizPath)}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200"
                            >
                                Create Quiz
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz._id}
                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white line-clamp-2">{quiz.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${quiz.isPublished
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                        {quiz.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>

                                {quiz.description && (
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{quiz.timeLimit} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{quiz.questionCount} questions</span>
                                    </div>
                                </div>

                                {quiz.isPublished ? (
                                    <div className="w-full flex items-center justify-center gap-2 bg-slate-700/50 text-slate-400 font-medium py-2.5 px-4 rounded-xl cursor-not-allowed">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Already Published
                                    </div>
                                ) : isInstructor ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigate(`${addQuestionsBasePath}/${quiz._id}`, { state: { quizTitle: quiz.title } })}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Questions
                                        </button>
                                        <button
                                            onClick={() => handlePublish(quiz._id)}
                                            disabled={publishing === quiz._id}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
                                        >
                                            {publishing === quiz._id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Publish Quiz
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full flex items-center justify-center bg-slate-700/50 text-slate-400 font-medium py-2.5 px-4 rounded-xl">
                                        Draft (Admin View Only)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ManageQuizzes;

