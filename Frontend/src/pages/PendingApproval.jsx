import { useNavigate } from "react-router-dom";

function PendingApproval() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                    Pending Approval
                </h1>

                <p className="text-slate-400 mb-6 leading-relaxed">
                    Your instructor account has been created successfully! An admin needs to review and approve your account before you can access the instructor dashboard.
                </p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-amber-400/80 text-sm text-left">
                            You'll be able to log in once an administrator approves your request. This usually takes a short time.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"
                    >
                        Back to Login
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500">Awaiting admin review</span>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                </div>
            </div>
        </div>
    );
}

export default PendingApproval;
