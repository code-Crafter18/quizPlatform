import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function StudentResult() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchResult();
    }, [quizId]);

    const fetchResult = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/result/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
        } catch (err) {
            console.error("Error fetching result:", err);
            setError(err.response?.data?.error || "Failed to fetch result");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{error}</h3>
                    <button
                        onClick={() => navigate("/home")}
                        className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-xl font-bold text-white">Your Result</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {result && (
                    <>
                        {/* Score Card - Compact & New Color */}
                        <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{result.quiz.title}</h2>
                                <p className="text-slate-400 text-sm">Quiz Result</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-violet-400">
                                        {result.score} <span className="text-lg text-slate-500 font-normal">/ {result.totalQuestions}</span>
                                    </p>
                                    <p className="text-xs text-slate-400">Score</p>
                                </div>
                                <div className="h-10 w-px bg-slate-700/50"></div>
                                <div className="text-right">
                                    <span className={`text-3xl font-bold ${result.percentage >= 80
                                        ? "text-emerald-400"
                                        : result.percentage >= 50
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                        }`}>
                                        {result.percentage}%
                                    </span>
                                    <p className="text-xs text-slate-400">Percentage</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <h3 className="text-lg font-semibold text-white mb-4">Question Analysis</h3>
                        <div className="space-y-4">
                            {result.results.map((item, index) => (
                                <div
                                    key={item.questionId}
                                    className={`bg-slate-800/50 backdrop-blur-xl border rounded-2xl p-6 ${item.isCorrect
                                            ? "border-green-500/30"
                                            : "border-red-500/30" // Red for both wrong and unattempted
                                        }`}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.isCorrect
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{item.questionText}</p>
                                        </div>
                                        {item.isCorrect ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                                Correct
                                            </span>
                                        ) : item.isAttempted ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                                Wrong
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                Not Attempted
                                            </span>
                                        )}
                                    </div>

                                    <div className="ml-12 space-y-2">
                                        {item.options.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`flex items-center gap-3 p-3 rounded-xl ${optIndex === item.correctOption
                                                    ? "bg-green-500/10 border border-green-500/30"
                                                    : optIndex === item.selectedOption && !item.isCorrect
                                                        ? "bg-red-500/10 border border-red-500/30"
                                                        : "bg-slate-700/30"
                                                    }`}
                                            >
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${optIndex === item.correctOption
                                                    ? "bg-green-500 text-white"
                                                    : optIndex === item.selectedOption && !item.isCorrect
                                                        ? "bg-red-500 text-white"
                                                        : "bg-slate-600 text-slate-300"
                                                    }`}>
                                                    {String.fromCharCode(65 + optIndex)}
                                                </span>
                                                <span className={`${optIndex === item.correctOption
                                                    ? "text-green-400"
                                                    : optIndex === item.selectedOption && !item.isCorrect
                                                        ? "text-red-400"
                                                        : "text-slate-300"
                                                    }`}>
                                                    {option}
                                                </span>
                                                {optIndex === item.correctOption && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {optIndex === item.selectedOption && !item.isCorrect && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default StudentResult;
