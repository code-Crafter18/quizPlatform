import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function QuizAnalytics() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [userRole, setUserRole] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null")?.role || "";
        } catch {
            return "";
        }
    });
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (!["admin", "instructor"].includes(parsed.role)) {
            navigate("/home", { replace: true });
            return;
        }
        setUserRole(parsed.role);
        fetchAnalytics();
    }, [quizId, navigate]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const [analyticsRes, questionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/analytics/${quizId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/${quizId}/questions`)
            ]);

            setQuiz(analyticsRes.data.quiz);
            setAttempts(analyticsRes.data.attempts);
            setQuestions(questionsRes.data.questions || []);
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError(err.response?.data?.error || "Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    const handlePublishResults = async () => {
        setPublishing(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/quiz/publish-results/${quizId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh data
            fetchAnalytics();
        } catch (err) {
            console.error("Error publishing results:", err);
            setError(err.response?.data?.error || "Failed to publish results");
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
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
                            onClick={() => navigate(userRole === "instructor" ? "/instructor/analytics" : "/admin/analytics")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back to Analytics</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-white">Quiz Details</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {quiz && (
                    <>
                        {/* Quiz Info Card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-linear-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-teal-400 font-medium">Total Marks: {quiz.totalMarks}</span>
                                            {quiz.resultsPublished ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                                    Results Published
                                                </span>
                                            ) : quiz.isExpired ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                                                    Quiz Ended
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                                    Quiz Live
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!quiz.resultsPublished && userRole === "instructor" && (
                                    <button
                                        onClick={handlePublishResults}
                                        disabled={publishing || !quiz.isExpired}
                                        className={`flex items-center gap-2 font-medium py-3 px-6 rounded-xl transition-all duration-200 ${quiz.isExpired
                                                ? "bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                                : "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {publishing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {quiz.isExpired ? "Publish Results" : "Quiz Still Live"}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Attempts Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">
                                    Student Attempts ({attempts.length})
                                </h3>
                            </div>

                            {attempts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400">No one has attempted this quiz yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700/30">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">#</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">Student</th>
                                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">Email</th>
                                                <th className="text-center py-4 px-6 text-sm font-medium text-slate-300">Score</th>
                                                <th className="text-center py-4 px-6 text-sm font-medium text-slate-300">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {attempts.map((attempt, index) => (
                                                <tr key={attempt._id} className="hover:bg-slate-700/20 transition-colors">
                                                    <td className="py-4 px-6 text-slate-400">{index + 1}</td>
                                                    <td className="py-4 px-6 text-white font-medium">{attempt.studentName}</td>
                                                    <td className="py-4 px-6 text-slate-400">{attempt.studentEmail}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="text-white font-semibold">{attempt.score}</span>
                                                        <span className="text-slate-500">/{attempt.totalMarks}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${attempt.percentage >= 80
                                                                ? "bg-green-500/20 text-green-400"
                                                                : attempt.percentage >= 50
                                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                                    : "bg-red-500/20 text-red-400"
                                                            }`}>
                                                            {attempt.percentage}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Question Preview */}
                        <div className="mt-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">
                                    Quiz Questions & Options ({questions.length})
                                </h3>
                            </div>

                            {questions.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400">No questions found for this quiz</p>
                                </div>
                            ) : (
                                <div className="space-y-4 p-6">
                                    {questions.map((question, index) => (
                                        <div key={question.questionID || index} className="bg-slate-700/30 border border-slate-700/40 rounded-2xl p-5">
                                            <div className="flex items-start gap-3 mb-4">
                                                <span className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <p className="text-white font-medium leading-relaxed flex-1">
                                                    {question.questionText}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                                {question.options.map((option, optionIndex) => (
                                                    <div
                                                        key={optionIndex}
                                                        className="flex items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-800/40 px-4 py-3 text-slate-300"
                                                    >
                                                        <span className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </span>
                                                        <span className="flex-1">{option}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default QuizAnalytics;
