import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InstructorHome() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalQuizzes: "--", attemptsToday: "--", avgScore: null });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "instructor") {
            navigate(parsed.role === "admin" ? "/admin" : "/home", { replace: true });
            return;
        }
        setUser(parsed);
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/admin/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Instructor Dashboard</h1>
                            <p className="text-sm text-purple-400">QuizMaster Instructor Panel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-slate-300 hidden sm:block">
                                <span className="text-purple-400 font-medium">{user.name || user.email}</span>
                                <span className="ml-2 bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">Instructor</span>
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || "Instructor"}!</h2>
                    <p className="text-slate-300">Create and manage quizzes, run live sessions, and track student performance.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Quizzes</p>
                                <p className="text-2xl font-bold text-white">{stats.totalQuizzes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Attempts Today</p>
                                <p className="text-2xl font-bold text-white">{stats.attemptsToday}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Avg. Score</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats.avgScore !== null && stats.avgScore !== "--" ? `${stats.avgScore}%` : "--%"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Quizzes */}
                    <button onClick={() => navigate("/instructor/create-quiz")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">Create Quizzes</h4>
                        <p className="text-slate-400 text-sm">Build new quizzes with custom questions</p>
                    </button>

                    {/* Conduct Quizzes */}
                    <button onClick={() => navigate("/instructor/manage-quizzes")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Conduct Quizzes</h4>
                        <p className="text-slate-400 text-sm">Publish, manage and run live quizzes</p>
                    </button>

                    {/* View Results */}
                    <button onClick={() => navigate("/instructor/analytics")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors">View Results</h4>
                        <p className="text-slate-400 text-sm">Analyse quiz performance and student scores</p>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default InstructorHome;
