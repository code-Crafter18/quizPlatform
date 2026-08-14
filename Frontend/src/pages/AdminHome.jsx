import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminHome() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalQuizzes: "--", totalUsers: "--", attemptsToday: "--", avgScore: null });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role !== "admin") {
                navigate("/home", { replace: true });
            } else {
                fetchStats();
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/stats`, {
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
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-sm text-teal-400">QuizMaster Control Panel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-slate-300 hidden sm:block">
                                <span className="text-teal-400 font-medium">{user.name || user.email}</span>
                                <span className="ml-2 bg-teal-500/20 text-teal-400 text-xs px-2 py-1 rounded-full">Admin</span>
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
                <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-8 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || "Admin"}!</h2>
                    <p className="text-slate-300">Manage users, instructors, and monitor platform activity from here.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button onClick={() => navigate("/admin/manage-users")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">Manage Users</h4>
                            <p className="text-slate-400 text-sm">View and manage registered user accounts</p>
                        </button>

                        <button onClick={() => navigate("/admin/manage-instructors")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">Manage Instructors</h4>
                            <p className="text-slate-400 text-sm">Promote users and manage instructor roles</p>
                        </button>

                        <button onClick={() => navigate("/admin/manage-quizzes")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">View All Quizzes</h4>
                            <p className="text-slate-400 text-sm">Browse and monitor all quizzes</p>
                        </button>

                        <button onClick={() => navigate("/admin/settings")} className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">System Settings</h4>
                            <p className="text-slate-400 text-sm">Configure application settings</p>
                        </button>
                    </div>
            </main>
        </div>
    );
}

export default AdminHome;
