import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function QuizLayout() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [quizInfo, setQuizInfo] = useState(null);
    const [isQuestionsListOpen, setIsQuestionsListOpen] = useState(true);
    const [attemptId, setAttemptId] = useState(null);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);
    const [previousScore, setPreviousScore] = useState(null);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("info"); // 'success' | 'error' | 'info'

    // Start quiz attempt when component mounts
    useEffect(() => {
        startQuizAttempt();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining <= 0 || alreadyCompleted) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitQuiz(true); // Skip confirmation on auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, alreadyCompleted]);

    const startQuizAttempt = async () => {
        try {
            const token = localStorage.getItem("token");

            // First, check/start attempt
            const attemptRes = await axios.post(
                "http://localhost:5000/api/quiz/start",
                { quizId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Attempt response:", attemptRes.data);

            // Check if quiz can be continued or just started
            if (attemptRes.data.status === "started" || attemptRes.data.status === "continue") {
                setAttemptId(attemptRes.data.attemptId);
                setTotalQuestions(attemptRes.data.totalQuestions);

                // Set remaining time (backend now returns seconds directly)
                const remainingSeconds = attemptRes.data.remainingTime;
                setTimeRemaining(remainingSeconds);
                setTotalTime(attemptRes.data.timeLimit * 60);

                // Restore previously attempted answers if continuing
                if (attemptRes.data.attemptedAnswers && attemptRes.data.attemptedAnswers.length > 0) {
                    const restoredAnswers = {};
                    attemptRes.data.attemptedAnswers.forEach(ans => {
                        // Handle both string and object questionId formats
                        const qId = typeof ans.questionId === 'object' ? ans.questionId.toString() : ans.questionId;
                        // Only restore if selectedOption is valid (not null/undefined)
                        if (ans.selectedOption !== null && ans.selectedOption !== undefined) {
                            restoredAnswers[qId] = ans.selectedOption;
                        }
                    });
                    setSelectedAnswers(restoredAnswers);
                    console.log("Restored answers:", restoredAnswers);
                }

                // Now fetch questions
                await fetchQuestions();
            }
        } catch (err) {
            console.error("Error starting quiz:", err);

            // Check if quiz was already completed
            if (err.response?.status === 400 && err.response?.data?.message?.includes("already completed")) {
                setAlreadyCompleted(true);
                setPreviousScore(err.response.data.score);
                setLoading(false);
            } else if (err.response?.status === 400 && err.response?.data?.message?.includes("Time expired")) {
                setAlreadyCompleted(true);
                setPreviousScore(err.response.data.score);
                setTotalQuestions(err.response.data.totalQuestions);
                setLoading(false);
            } else {
                setError(err.response?.data?.message || err.message || "Failed to start quiz");
                setLoading(false);
            }
        }
    };

    const fetchQuestions = async () => {
        try {
            // Fetch questions for this quiz
            const res = await axios.get(`http://localhost:5000/api/quiz/${quizId}/questions`);
            console.log("Questions response:", res.data);
            setQuestions(res.data.questions || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching questions:", err);
            setError(err.response?.data?.error || err.message || "Failed to load questions");
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = async (questionId, optionIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));

        // Save answer to backend
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/quiz/save-answer",
                { attemptId, questionId, selectedOption: optionIndex },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Error saving answer:", err);
        }
    };

    const handleRemoveResponse = async (questionId) => {
        setSelectedAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
        });

        // Save null answer to backend (remove)
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/quiz/save-answer",
                { attemptId, questionId, selectedOption: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Error removing answer:", err);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleQuestionNavClick = (index) => {
        setCurrentQuestionIndex(index);
    };

    const handleSubmitQuiz = async (skipConfirmation = false) => {
        if (isSubmitting) return;
        // In-app confirmation unless skipped (e.g., auto-submit on timer expiry)
        if (!skipConfirmation && !showConfirm) {
            setShowConfirm(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/api/quiz/submit",
                { attemptId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Quiz submitted:", res.data);
            setStatusType("success");
            setStatusMessage(`Quiz submitted! Score: ${res.data.score}/${res.data.totalQuestions}`);
            navigate("/home");
        } catch (err) {
            console.error("Error submitting quiz:", err);
            setStatusType("error");
            setStatusMessage(err.response?.data?.message || "Failed to submit quiz");
            navigate("/home");
        } finally {
            setIsSubmitting(false);
            setShowConfirm(false);
        }
    };

    const getQuestionStatus = (index) => {
        const question = questions[index];
        if (!question) return "unanswered";
        if (selectedAnswers[question.questionID] !== undefined) return "answered";
        return "unanswered";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    // Already completed state - user can only attempt once
    if (alreadyCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Quiz Already Completed</h2>
                    <p className="text-slate-400 mb-6">
                        You have already attempted this quiz. Each quiz can only be attempted once.
                    </p>
                    {previousScore !== null && (
                        <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-4 mb-6">
                            <p className="text-teal-400 text-sm mb-1">Your Previous Score</p>
                            <p className="text-3xl font-bold text-white">{previousScore}</p>
                        </div>
                    )}
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-2 rounded-xl transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-400 mb-4">No questions found for this quiz.</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white px-6 py-2 rounded-xl transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

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

                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white">QuizMaster</h1>
                    </div>

                    <div className="text-slate-400 text-sm">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Question Section */}
                    <div className="flex-1">
                        {/* Question Card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                            {/* Question Text */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white leading-relaxed">
                                    {currentQuestion.questionText}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswers[currentQuestion.questionID] === index;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionSelect(currentQuestion.questionID, index)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${isSelected
                                                ? 'bg-teal-500/20 border-teal-500 text-white'
                                                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${isSelected
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-slate-600/50 text-slate-400'
                                                }`}>
                                                {optionLabels[index]}
                                            </span>
                                            <span className="flex-1 font-medium">{option}</span>
                                            {isSelected && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
                                <button
                                    onClick={handlePrevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentQuestionIndex === 0
                                        ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-700/50 text-white hover:bg-slate-700'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                {/* Remove Response Button - Center */}
                                {selectedAnswers[currentQuestion.questionID] !== undefined ? (
                                    <button
                                        onClick={() => handleRemoveResponse(currentQuestion.questionID)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove Response
                                    </button>
                                ) : (
                                    <div className="w-40"></div>
                                )}

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
                                    >
                                        Next
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80">
                        {/* Timer Card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                            <div className="flex flex-col items-center">
                                {/* Circular Timer */}
                                <div className="relative w-32 h-32 mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-slate-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="none"
                                            stroke="url(#timerGradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 56}`}
                                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeRemaining / totalTime)}`}
                                            className="transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#14b8a6" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-3xl font-bold ${timeRemaining <= 60 ? 'text-red-400' : 'text-teal-400'}`}>
                                            {formatTime(timeRemaining)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm">Time Remaining</p>
                            </div>
                        </div>

                        {/* Questions Navigation */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
                            <button
                                onClick={() => setIsQuestionsListOpen(!isQuestionsListOpen)}
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-700/20 transition-colors rounded-2xl"
                            >
                                <h3 className="text-white font-semibold">Quiz Questions List</h3>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isQuestionsListOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isQuestionsListOpen && (
                                <div className="px-6 pb-6 space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
                                    {questions.map((question, index) => {
                                        const status = getQuestionStatus(index);
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={question.questionID}
                                                onClick={() => handleQuestionNavClick(index)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isCurrent
                                                    ? 'bg-blue-500/20 border border-blue-500/50'
                                                    : 'bg-slate-700/30 hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <span className={`text-sm font-medium ${isCurrent ? 'text-blue-400' : 'text-slate-300'}`}>
                                                    Question {index + 1}
                                                </span>
                                                <span className={`w-3 h-3 rounded-full ${status === 'answered'
                                                    ? 'bg-teal-500'
                                                    : isCurrent
                                                        ? 'bg-blue-500'
                                                        : 'bg-slate-600'
                                                    }`}></span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Progress Stats */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mt-6">
                            <h3 className="text-white font-semibold mb-4">Progress</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Answered</span>
                                    <span className="text-teal-400 font-medium">
                                        {Object.keys(selectedAnswers).length} / {questions.length}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-2">Submit Quiz?</h3>
                        <p className="text-slate-300 text-sm mb-4">
                            You have answered {Object.keys(selectedAnswers).length} of {questions.length} questions. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmitQuiz(true)}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isSubmitting ? "Submitting..." : "Confirm Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizLayout;