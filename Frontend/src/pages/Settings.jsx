import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Name form
    const [name, setName] = useState("");
    const [nameMsg, setNameMsg] = useState({ type: "", text: "" });
    const [nameLoading, setNameLoading] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "admin" && parsed.role !== "instructor") {
            navigate("/home", { replace: true });
            return;
        }
        setUser(parsed);
        setName(parsed.name || "");
    }, [navigate]);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setNameMsg({ type: "error", text: "Name cannot be empty." });
            return;
        }
        setNameLoading(true);
        setNameMsg({ type: "", text: "" });
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                "http://localhost:5000/api/user/profile",
                { name: name.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update localStorage
            const updated = { ...user, name: res.data.user.name };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
            setNameMsg({ type: "success", text: "Name updated successfully." });
        } catch (err) {
            setNameMsg({ type: "error", text: err.response?.data?.error || "Failed to update name." });
        } finally {
            setNameLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: "error", text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 4) {
            setPasswordMsg({ type: "error", text: "New password must be at least 4 characters." });
            return;
        }
        setPasswordLoading(true);
        setPasswordMsg({ type: "", text: "" });
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                "http://localhost:5000/api/user/profile",
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMsg({ type: "success", text: "Password changed successfully." });
        } catch (err) {
            setPasswordMsg({ type: "error", text: err.response?.data?.error || "Failed to change password." });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(user?.role === "instructor" ? "/instructor" : "/admin")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Page Title */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                        <p className="text-slate-400">Update your profile and security settings</p>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">{user?.name}</p>
                            <p className="text-slate-400 text-sm">{user?.email}</p>
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full capitalize">{user?.role || "admin"}</span>
                        </div>
                    </div>
                </div>

                {/* Update Name */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Update Display Name</h3>
                    <form onSubmit={handleNameUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                                placeholder="Your display name"
                            />
                        </div>
                        {nameMsg.text && (
                            <p className={`text-sm ${nameMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                                {nameMsg.text}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={nameLoading}
                            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl transition font-medium"
                        >
                            {nameLoading ? "Saving..." : "Save Name"}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                                placeholder="Repeat new password"
                            />
                        </div>
                        {passwordMsg.text && (
                            <p className={`text-sm ${passwordMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                                {passwordMsg.text}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl transition font-medium"
                        >
                            {passwordLoading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Settings;
