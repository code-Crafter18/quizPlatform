import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import LeaderboardModal from "../components/LeaderboardModal";

function StudentResult() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    useEffect(() => {
        fetchResult();
    }, [quizId]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/quiz/result/${quizId}`);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch result");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center max-w-md shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
                    <p className="text-slate-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition shadow-lg shadow-blue-500/25 text-sm"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const isHighScorer = result?.percentage >= 80;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link
                        to="/home"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>

                    <h1 className="text-lg font-bold text-white">Quiz Evaluation</h1>

                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-xl text-sm font-medium transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Leaderboard</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {result && (
                    <>
                        {/* Score Banner */}
                        <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl ${
                            isHighScorer
                                ? "bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-indigo-950/40 border-emerald-500/30"
                                : "bg-gradient-to-r from-slate-900/60 to-indigo-950/40 border-indigo-500/30"
                        }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        Published Result
                                    </span>
                                    {isHighScorer && (
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            🌟 Outstanding
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                                    {result.quiz.title}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    {result.percentage >= 50 ? "Congratulations on finishing!" : "Keep practicing to improve your score."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 sm:gap-8 bg-slate-950/40 border border-slate-800/80 rounded-2xl px-6 py-4">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-indigo-400">
                                        {result.score}
                                        <span className="text-base text-slate-500 font-normal"> / {result.totalQuestions}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Score</p>
                                </div>

                                <div className="h-10 w-px bg-slate-800"></div>

                                <div className="text-center">
                                    <p className={`text-3xl font-black ${
                                        result.percentage >= 80
                                            ? "text-emerald-400"
                                            : result.percentage >= 50
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                    }`}>
                                        {result.percentage}%
                                    </p>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Accuracy</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Question Breakdown</h3>
                            <button
                                onClick={() => setShowLeaderboard(true)}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition"
                            >
                                View full leaderboard &rarr;
                            </button>
                        </div>

                        <div className="space-y-4">
                            {result.results.map((item, index) => (
                                <div
                                    key={item.questionId || index}
                                    className={`bg-slate-800/40 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                                        item.isCorrect
                                            ? "border-emerald-500/30"
                                            : "border-red-500/30"
                                    }`}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                            item.isCorrect
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-red-500/20 text-red-400"
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-base leading-snug">{item.questionText}</p>
                                        </div>
                                        {item.isCorrect ? (
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Correct
                                            </span>
                                        ) : item.isAttempted ? (
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                                Incorrect
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/50">
                                                Skipped
                                            </span>
                                        )}
                                    </div>

                                    <div className="ml-0 sm:ml-12 space-y-2.5">
                                        {item.options.map((option, optIndex) => {
                                            const isCorrectOption = optIndex === item.correctOption;
                                            const isSelectedByUser = optIndex === item.selectedOption;

                                            let optionClass = "bg-slate-800/50 border border-slate-700/50 text-slate-300";
                                            let badgeClass = "bg-slate-700 text-slate-300";

                                            if (isCorrectOption) {
                                                optionClass = "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-medium";
                                                badgeClass = "bg-emerald-500 text-slate-950 font-bold";
                                            } else if (isSelectedByUser && !item.isCorrect) {
                                                optionClass = "bg-red-500/15 border border-red-500/40 text-red-300";
                                                badgeClass = "bg-red-500 text-white font-bold";
                                            }

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${optionClass}`}
                                                >
                                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${badgeClass}`}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <span className="text-sm flex-1">{option}</span>

                                                    {isCorrectOption && (
                                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Correct Answer
                                                        </span>
                                                    )}

                                                    {isSelectedByUser && !item.isCorrect && (
                                                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Your Answer
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Leaderboard Modal */}
            <LeaderboardModal
                quizId={quizId}
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
            />
        </div>
    );
}

export default StudentResult;
