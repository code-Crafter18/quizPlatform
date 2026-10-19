import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Invitations() {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [responding, setResponding] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "user") {
            navigate(parsed.role === "admin" ? "/admin" : "/instructor", { replace: true });
            return;
        }
        fetchInvitations();
    }, [navigate]);

    const fetchInvitations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/my-invitations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitations(res.data.invitations || []);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load invitations");
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (invitationId, action) => {
        setResponding(invitationId);
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/invitations/${invitationId}/respond`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActionMsg(action === "accept" ? "Invitation accepted! Quiz added to your dashboard." : "Invitation declined.");
            setTimeout(() => setActionMsg(""), 4000);
            fetchInvitations();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${action} invitation`);
            setTimeout(() => setError(""), 4000);
        } finally {
            setResponding(null);
        }
    };

    const filteredInvitations = invitations.filter(inv => {
        if (activeFilter === "all") return true;
        return inv.status === activeFilter;
    });

    const filterCounts = {
        all: invitations.length,
        pending: invitations.filter(i => i.status === "pending").length,
        accepted: invitations.filter(i => i.status === "accepted").length,
        declined: invitations.filter(i => i.status === "declined").length,
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "accepted": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "declined": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-slate-500/20 text-slate-400";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Home</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Quiz Invitations</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Your Invitations</h2>
                        <p className="text-slate-400">Accept or decline quiz invitations from instructors</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                {!loading && invitations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[
                            { key: "all", label: "All", color: "blue" },
                            { key: "pending", label: "Pending", color: "amber" },
                            { key: "accepted", label: "Accepted", color: "green" },
                            { key: "declined", label: "Declined", color: "red" },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeFilter === filter.key
                                        ? filter.key === "all" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : filter.key === "pending" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                        : filter.key === "accepted" ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                        : "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                        : "bg-slate-800/70 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                                }`}
                            >
                                {filter.label}
                                <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs rounded-full px-1.5 ${
                                    activeFilter === filter.key ? "bg-white/20 text-white" : "bg-slate-700/70 text-slate-400"
                                }`}>{filterCounts[filter.key]}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Messages */}
                {actionMsg && (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6">
                        <p className="text-green-400 text-sm">{actionMsg}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">Loading invitations...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && invitations.length === 0 && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
                        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">No Invitations Yet</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            You'll see quiz invitations here when an instructor invites you to attempt a quiz.
                        </p>
                    </div>
                )}

                {/* Invitations List */}
                {!loading && filteredInvitations.length > 0 && (
                    <div className="space-y-4">
                        {filteredInvitations.map((inv) => (
                            <div
                                key={inv._id}
                                className={`bg-slate-800/50 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:bg-slate-800/70 ${
                                    inv.status === "pending" ? "border-amber-500/30" : "border-slate-700/50"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{inv.quiz?.title || "Quiz"}</h3>
                                                <p className="text-xs text-slate-500">
                                                    Invited by <span className="text-slate-400">{inv.invitedBy?.name || "Instructor"}</span> · {formatDate(inv.invitedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {inv.quiz?.description && (
                                            <p className="text-slate-400 text-sm ml-13 mb-2">{inv.quiz.description}</p>
                                        )}

                                        <div className="flex items-center gap-4 ml-13 text-xs text-slate-500">
                                            {inv.quiz?.timeLimit && (
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {inv.quiz.timeLimit} min
                                                </span>
                                            )}
                                            {inv.quiz?.isPublished !== undefined && (
                                                <span className={`flex items-center gap-1 ${inv.quiz.isPublished ? "text-green-400" : "text-slate-500"}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${inv.quiz.isPublished ? "bg-green-400" : "bg-slate-500"}`}></div>
                                                    {inv.quiz.isPublished ? "Published" : "Not yet published"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                        {/* Status Badge */}
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusBadge(inv.status)}`}>
                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>

                                        {/* Action Buttons */}
                                        {inv.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRespond(inv._id, "accept")}
                                                    disabled={responding === inv._id}
                                                    className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(inv._id, "decline")}
                                                    disabled={responding === inv._id}
                                                    className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty filter state */}
                {!loading && invitations.length > 0 && filteredInvitations.length === 0 && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
                        <p className="text-slate-400">No invitations in this category.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Invitations;
