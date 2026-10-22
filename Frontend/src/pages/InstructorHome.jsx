import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function InstructorHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalQuizzes: "--", attemptsToday: "--", avgScore: null });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/admin/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar subtitle="Instructor Administration Portal" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 mb-8 shadow-xl">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Welcome back, <span className="text-purple-400">{user?.name || "Instructor"}</span>! 🎓
                    </h2>
                    <p className="text-slate-300 mt-2 max-w-2xl leading-relaxed">
                        Create AI-powered or manual assessments, publish live quizzes, distribute invitations, and monitor student metrics in real-time.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Quizzes"
                        value={stats.totalQuizzes}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                        gradient="bg-blue-500/20 text-blue-400"
                    />

                    <StatCard
                        title="Attempts Today"
                        value={stats.attemptsToday}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        }
                        gradient="bg-amber-500/20 text-amber-400"
                    />

                    <StatCard
                        title="Average Score"
                        value={stats.avgScore !== null && stats.avgScore !== "--" ? `${stats.avgScore}%` : "--%"}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        }
                        gradient="bg-teal-500/20 text-teal-400"
                    />
                </div>

                {/* Quick Actions */}
                <h3 className="text-xl font-bold text-white mb-5">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Create Manual Quiz */}
                    <button
                        onClick={() => navigate("/instructor/create-quiz", { state: { mode: "manual" } })}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-teal-500/5"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">Create Quiz</h4>
                        <p className="text-slate-400 text-sm">Build quizzes with your own custom questions and choices</p>
                    </button>

                    {/* AI Quiz Generation */}
                    <button
                        onClick={() => navigate("/instructor/create-quiz", { state: { mode: "ai" } })}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-purple-500/5"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Generate with AI</h4>
                        <p className="text-slate-400 text-sm">Use Gemini AI to instantly generate high-quality questions</p>
                    </button>

                    {/* Manage & Conduct Quizzes */}
                    <button
                        onClick={() => navigate("/instructor/manage-quizzes")}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-blue-500/5"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Manage & Publish</h4>
                        <p className="text-slate-400 text-sm">Publish quizzes, invite candidates, and review drafts</p>
                    </button>

                    {/* View Analytics & Results */}
                    <button
                        onClick={() => navigate("/instructor/analytics")}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-amber-500/5"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">Analytics & Scores</h4>
                        <p className="text-slate-400 text-sm">View student results, submission times, and release scores</p>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default InstructorHome;
