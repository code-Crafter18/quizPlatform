import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Analytics() {
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
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/analytics/quizzes`, {
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

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(userRole === "instructor" ? "/instructor" : "/admin")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Quiz Analytics</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">View Reports</h2>
                        <p className="text-slate-400">Analyze quiz performance and publish results</p>
                    </div>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Published Quizzes</h3>
                        <p className="text-slate-400">Publish some quizzes to see their analytics</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <button
                                key={quiz._id}
                                onClick={() => navigate(`/${userRole === "instructor" ? "instructor" : "admin"}/analytics/${quiz._id}`)}
                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                                        {quiz.title}
                                    </h3>
                                    <div className="flex flex-col items-end gap-1">
                                        {quiz.resultsPublished ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                                Results Out
                                            </span>
                                        ) : quiz.isExpired ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                                                Ended
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                                Live
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold text-white">{quiz.totalMarks}</p>
                                        <p className="text-xs text-slate-400">Total Marks</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold text-white">{quiz.attemptCount}</p>
                                        <p className="text-xs text-slate-400">Attempts</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold text-teal-400">
                                            {quiz.avgScore !== null ? `${quiz.avgScore}%` : "—"}
                                        </p>
                                        <p className="text-xs text-slate-400">Avg Score</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <span>Click to view details</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Analytics;
