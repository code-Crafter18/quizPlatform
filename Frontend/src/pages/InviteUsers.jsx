import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function InviteUsers() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");

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
        fetchQuizDetails();
        fetchInvitations();
    }, [navigate, quizId]);

    const fetchQuizDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/admin/quizzes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const found = (res.data.quizzes || []).find(q => q._id === quizId);
            setQuiz(found);
        } catch (err) {
            console.error("Error fetching quiz:", err);
        }
    };

    const fetchInvitations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/${quizId}/invitations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitations(res.data.invitations || []);
        } catch (err) {
            console.error("Error fetching invitations:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/search-users?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter out already invited users
            const invitedIds = invitations.map(inv => inv.user?._id);
            const filtered = (res.data.users || []).filter(u => !invitedIds.includes(u._id));
            setSearchResults(filtered);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setSearching(false);
        }
    };

    const toggleUser = (user) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u._id === user._id);
            if (exists) {
                return prev.filter(u => u._id !== user._id);
            }
            return [...prev, user];
        });
    };

    const isSelected = (userId) => selectedUsers.some(u => u._id === userId);

    const handleSendInvitations = async () => {
        if (selectedUsers.length === 0) return;

        setSending(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/${quizId}/invite`,
                { userIds: selectedUsers.map(u => u._id) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActionMsg(`${res.data.invited} invitation(s) sent successfully!`);
            setTimeout(() => setActionMsg(""), 4000);
            setSelectedUsers([]);
            setSearchQuery("");
            setSearchResults([]);
            fetchInvitations();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send invitations");
            setTimeout(() => setError(""), 4000);
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return "bg-amber-500/20 text-amber-400";
            case "accepted": return "bg-green-500/20 text-green-400";
            case "declined": return "bg-red-500/20 text-red-400";
            default: return "bg-slate-500/20 text-slate-400";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const statusCounts = {
        total: invitations.length,
        pending: invitations.filter(i => i.status === "pending").length,
        accepted: invitations.filter(i => i.status === "accepted").length,
        declined: invitations.filter(i => i.status === "declined").length,
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/instructor/manage-quizzes")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Quizzes</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Invite Users</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quiz Info */}
                {quiz && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-1">{quiz.title}</h2>
                        {quiz.description && <p className="text-slate-400 text-sm">{quiz.description}</p>}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span>{quiz.questionCount || 0} questions</span>
                            <span>{quiz.timeLimit} min time limit</span>
                            <span className={quiz.isPublished ? "text-green-400" : "text-amber-400"}>
                                {quiz.isPublished ? "Published" : "Not published"}
                            </span>
                        </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Search & Invite Section */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Search Students
                        </h3>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                                {searchResults.map(user => (
                                    <button
                                        key={user._id}
                                        onClick={() => toggleUser(user)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                                            isSelected(user._id)
                                                ? "bg-blue-500/20 border border-blue-500/50"
                                                : "bg-slate-700/30 border border-transparent hover:bg-slate-700/50"
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-slate-500 text-xs truncate">{user.email}</p>
                                        </div>
                                        {isSelected(user._id) && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">No students found matching "{searchQuery}"</p>
                        )}

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="border-t border-slate-700/50 pt-4 mt-4">
                                <p className="text-sm text-slate-400 mb-3">
                                    <span className="text-blue-400 font-medium">{selectedUsers.length}</span> student{selectedUsers.length !== 1 ? "s" : ""} selected
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedUsers.map(user => (
                                        <span
                                            key={user._id}
                                            className="flex items-center gap-1 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-full"
                                        >
                                            {user.name}
                                            <button
                                                onClick={() => toggleUser(user)}
                                                className="hover:text-white transition ml-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSendInvitations}
                                    disabled={sending}
                                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Send Invitations
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Current Invitations */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Sent Invitations
                        </h3>

                        {/* Status Summary */}
                        {invitations.length > 0 && (
                            <div className="flex gap-3 mb-4 text-xs">
                                <span className="bg-slate-700/50 text-slate-400 px-2 py-1 rounded-lg">Total: {statusCounts.total}</span>
                                <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg">Pending: {statusCounts.pending}</span>
                                <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-lg">Accepted: {statusCounts.accepted}</span>
                                <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg">Declined: {statusCounts.declined}</span>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-slate-500 text-sm">No invitations sent yet. Search for students to invite.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {invitations.map(inv => (
                                    <div
                                        key={inv._id}
                                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                {inv.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{inv.user?.name || "User"}</p>
                                                <p className="text-slate-500 text-xs">{inv.user?.email || ""}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InviteUsers;
