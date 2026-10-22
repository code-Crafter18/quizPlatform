import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

function AdminHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalQuizzes: "--", totalUsers: "--", attemptsToday: "--", avgScore: null });
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
            console.error("Failed to fetch admin stats:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar subtitle="System Administration Panel" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-teal-900/30 via-cyan-900/30 to-slate-900/60 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-8 mb-8 shadow-xl">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Welcome back, <span className="text-teal-400">{user?.name || "Admin"}</span>! 🛡️
                    </h2>
                    <p className="text-slate-300 mt-2 max-w-2xl leading-relaxed">
                        Full system oversight: manage registered users and instructor approvals, monitor platform quiz activity, and view global performance analytics.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
                        title="Registered Users"
                        value={stats.totalUsers}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                        gradient="bg-emerald-500/20 text-emerald-400"
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
                <h3 className="text-xl font-bold text-white mb-5">Administration Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => navigate("/admin/manage-users")}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-emerald-500/5"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-emerald-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Manage Users</h4>
                        <p className="text-slate-400 text-sm">View student accounts, edit access, or manage permissions</p>
                    </button>

                    <button
                        onClick={() => navigate("/admin/manage-instructors")}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-purple-500/5"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-purple-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Instructor Approvals</h4>
                        <p className="text-slate-400 text-sm">Review pending instructor registrations and promote accounts</p>
                    </button>

                    <button
                        onClick={() => navigate("/admin/settings")}
                        className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left shadow-lg hover:shadow-cyan-500/5"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-cyan-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">System Settings</h4>
                        <p className="text-slate-400 text-sm">Configure security settings and profile details</p>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default AdminHome;
