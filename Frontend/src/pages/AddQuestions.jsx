import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

function AddQuestions() {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const location = useLocation();
    const quizTitle = location.state?.quizTitle || "Quiz";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [questions, setQuestions] = useState([
        { questionText: "", options: ["", "", "", ""], correctOption: 0 }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login", { replace: true });
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "instructor") {
            navigate(parsed.role === "admin" ? "/admin" : "/home", { replace: true });
        }
    }, [navigate]);

    const handleQuestionChange = (index, value) => {
        const updated = [...questions];
        updated[index].questionText = value;
        setQuestions(updated);
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updated = [...questions];
        updated[questionIndex].options[optionIndex] = value;
        setQuestions(updated);
    };

    const handleCorrectOptionChange = (questionIndex, optionIndex) => {
        const updated = [...questions];
        updated[questionIndex].correctOption = optionIndex;
        setQuestions(updated);
    };

    const addMoreQuestions = () => {
        setQuestions([
            ...questions,
            { questionText: "", options: ["", "", "", ""], correctOption: 0 }
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const validateQuestions = () => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                return `Question ${i + 1} text is required`;
            }
            const filledOptions = q.options.filter(opt => opt.trim() !== "");
            if (filledOptions.length < 2) {
                return `Question ${i + 1} must have at least 2 options`;
            }
            if (!q.options[q.correctOption]?.trim()) {
                return `Question ${i + 1} correct answer must be filled`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateQuestions();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");

            // Submit each question
            for (const question of questions) {
                // Filter out empty options
                const filteredOptions = question.options.filter(opt => opt.trim() !== "");

                await axios.post(
                    "http://localhost:5000/api/quiz/addquestion",
                    {
                        quizId,
                        questionText: question.questionText,
                        options: filteredOptions,
                        correctOption: question.correctOption
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setSuccess(`Successfully added ${questions.length} question(s)!`);
            // Reset form with one empty question
            setQuestions([{ questionText: "", options: ["", "", "", ""], correctOption: 0 }]);

        } catch (err) {
            console.error("Error adding questions:", err);
            setError(err.response?.data?.error || "Failed to add questions");
        } finally {
            setLoading(false);
        }
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
                    <h1 className="text-xl font-bold text-white">Add Questions</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Add Questions</h2>
                            <p className="text-teal-400">{quizTitle}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6">
                        <p className="text-green-400 text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {questions.map((question, qIndex) => (
                            <div
                                key={qIndex}
                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Question {qIndex + 1}
                                    </h3>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-400 hover:text-red-300 transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Question Text */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Question Text <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={question.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                        placeholder="Enter your question here..."
                                        rows={2}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                                    />
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-300">
                                        Options <span className="text-slate-500">(select the correct answer)</span>
                                    </label>
                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${question.correctOption === oIndex
                                                        ? "border-green-500 bg-green-500"
                                                        : "border-slate-500 hover:border-slate-400"
                                                    }`}
                                            >
                                                {question.correctOption === oIndex && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add More Button */}
                    <button
                        type="button"
                        onClick={addMoreQuestions}
                        className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add More Questions
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving Questions...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save {questions.length} Question{questions.length > 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default AddQuestions;
