import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ManageUsers() {
    const navigate = useNavigate();
    const location = useLocation();
    const isInstructorMode = location.pathname.includes("manage-instructors");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null); // userId to confirm delete
    const [activeTab, setActiveTab] = useState("all"); // "all", "pending"

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser || JSON.parse(storedUser).role !== "admin") {
            navigate("/login", { replace: true });
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteConfirm(null);
            setActionMsg("User deleted successfully");
            setTimeout(() => setActionMsg(""), 3000);
            fetchUsers();
        } catch (err) {
            setDeleteConfirm(null);
            setError(err.response?.data?.error || "Failed to delete user");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${userId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActionMsg("Instructor approved successfully!");
            setTimeout(() => setActionMsg(""), 3000);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to approve instructor");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleReject = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users/${userId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActionMsg("Instructor rejected and account removed.");
            setTimeout(() => setActionMsg(""), 3000);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reject instructor");
            setTimeout(() => setError(""), 3000);
        }
    };

    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

    const baseUsers = users.filter(u => isInstructorMode ? u.role === "instructor" : u.role === "user");
    const pendingInstructors = baseUsers.filter(u => u.role === "instructor" && !u.isApproved);
    const filteredUsers = activeTab === "pending" && isInstructorMode
        ? pendingInstructors 
        : baseUsers;

    const getRoleBadge = (user) => {
        if (user.role === "admin") return "bg-purple-500/20 text-purple-400";
        if (user.role === "instructor" && !user.isApproved) return "bg-amber-500/20 text-amber-400";
        if (user.role === "instructor") return "bg-indigo-500/20 text-indigo-400";
        return "bg-blue-500/20 text-blue-400";
    };

    const getRoleLabel = (user) => {
        if (user.role === "instructor" && !user.isApproved) return "Pending Instructor";
        return user.role;
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/admin")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">{isInstructorMode ? "Manage Instructors" : "Manage Users"}</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{isInstructorMode ? "Instructor Management" : "User Management"}</h2>
                        <p className="text-slate-400">{isInstructorMode ? "View and manage instructors and approvals" : "View and manage all registered student accounts"}</p>
                    </div>
                </div>

                {/* Tab Filters - Only for instructors */}
                {isInstructorMode && (
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeTab === "all"
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-slate-800/70 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                            }`}
                        >
                            All Instructors
                            <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs rounded-full px-1.5 ${
                                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-700/70 text-slate-400"
                            }`}>{baseUsers.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeTab === "pending"
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                    : "bg-slate-800/70 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                            }`}
                        >
                            Pending Approvals
                            {pendingInstructors.length > 0 && (
                                <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs rounded-full px-1.5 ${
                                    activeTab === "pending" ? "bg-white/20 text-white" : "bg-amber-500/30 text-amber-400"
                                }`}>{pendingInstructors.length}</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Pending Instructors Alert */}
                {isInstructorMode && activeTab === "all" && pendingInstructors.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-amber-400 text-sm">
                            <strong>{pendingInstructors.length}</strong> instructor{pendingInstructors.length !== 1 ? "s" : ""} awaiting approval.{" "}
                            <button onClick={() => setActiveTab("pending")} className="underline hover:text-amber-300 transition">View pending requests</button>
                        </p>
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

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-700/30 text-slate-400 text-sm font-medium border-b border-slate-700/50">
                            <div className="col-span-3">User</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2 text-center">Role</div>
                            <div className="col-span-1 text-center">Attempts</div>
                            <div className="col-span-3 text-center">Actions</div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                {activeTab === "pending" ? "No pending instructor approvals." : "No users found."}
                            </div>
                        ) : (
                            filteredUsers.map((u, idx) => (
                                <div
                                    key={u._id}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center ${idx !== filteredUsers.length - 1 ? "border-b border-slate-700/30" : ""} hover:bg-slate-700/20 transition`}
                                >
                                    {/* Name */}
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                                            u.role === "instructor" && !u.isApproved 
                                                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                : u.role === "instructor"
                                                ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                                                : "bg-gradient-to-br from-teal-500 to-cyan-600"
                                        }`}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-white font-medium truncate">
                                            {u.name}
                                            {u._id === currentUserId && (
                                                <span className="ml-2 text-xs text-teal-400">(you)</span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-3 text-slate-400 text-sm truncate">{u.email}</div>

                                    {/* Role badge */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadge(u)}`}>
                                            {getRoleLabel(u)}
                                        </span>
                                    </div>

                                    {/* Quiz attempts */}
                                    <div className="col-span-1 text-center text-slate-300 text-sm">
                                        {u.role === "user" ? u.attemptCount : "—"}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 flex items-center justify-center gap-2">
                                        {/* Approve/Reject for pending instructors */}
                                        {u.role === "instructor" && !u.isApproved && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(u._id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition font-medium"
                                                    title="Approve instructor"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(u._id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition font-medium"
                                                    title="Reject instructor"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {/* Delete for other users */}
                                        {u._id !== currentUserId && (u.role !== "instructor" || u.isApproved) && (
                                            <button
                                                onClick={() => setDeleteConfirm(u._id)}
                                                className="text-xs px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                                                title="Delete user"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Summary */}
                {!loading && filteredUsers.length > 0 && (
                    <p className="text-slate-500 text-sm mt-4 text-right">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} {activeTab === "pending" ? "pending" : "total"}
                    </p>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-white mb-2">Delete User?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            This will permanently delete the account. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
