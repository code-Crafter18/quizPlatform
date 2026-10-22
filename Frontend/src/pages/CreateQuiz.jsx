import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [aiError, setAiError] = useState("");
    const [aiSuccess, setAiSuccess] = useState("");
    const [aiTopic, setAiTopic] = useState("");
    const [aiCategory, setAiCategory] = useState("General");
    const [aiDescription, setAiDescription] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiTimeLimit, setAiTimeLimit] = useState(10);
    const [aiAvailableFor, setAiAvailableFor] = useState(60);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "General",
        timeLimit: 10,
        availableFor: 60
    });

    const defaultMode = location.state?.mode === "ai" ? "ai" : "manual";
    const [mode, setMode] = useState(defaultMode);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "timeLimit" || name === "availableFor" ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/quiz/addquiz", formData);
            navigate(`/instructor/add-questions/${res.data.quiz._id}`, { state: { quizTitle: res.data.quiz.title } });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setAiError("");
        setAiSuccess("");

        try {
            const prompt = [
                `Topic: ${aiTopic}`,
                `Category: ${aiCategory}`,
                aiDescription ? `Description: ${aiDescription}` : null,
                `Instructor prompt: ${aiPrompt}`,
                "Create a quiz with exactly 4 options per question, valid JSON only, and clear correct answers."
            ]
                .filter(Boolean)
                .join("\n");

            const res = await api.post("/api/ai/generate", {
                prompt,
                timeLimit: aiTimeLimit,
                availableFor: aiAvailableFor,
                category: aiCategory
            });

            setAiSuccess(`Quiz "${res.data.quiz?.title || "generated quiz"}" created successfully.`);
            navigate("/instructor/manage-quizzes");
        } catch (err) {
            setAiError(err.response?.data?.error || "Failed to generate quiz");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen">
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate("/instructor")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">Create New Quiz</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setMode("manual")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                mode === "manual" ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25" : "bg-slate-700/50 text-slate-300 hover:text-white"
                            }`}
                        >
                            Manual Create
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("ai")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                mode === "ai" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25" : "bg-slate-700/50 text-slate-300 hover:text-white"
                            }`}
                        >
                            Generate with AI
                        </button>
                    </div>

                    {mode === "ai" ? (
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Generate Quiz with AI</h2>
                                    <p className="text-slate-400 text-sm">Provide your topic and instructions to automatically generate questions.</p>
                                </div>
                            </div>

                            {(aiError || aiSuccess) && (
                                <div className={`rounded-xl p-4 ${aiError ? "bg-red-500/10 border border-red-500/50" : "bg-green-500/10 border border-green-500/50"}`}>
                                    <p className={`text-sm ${aiError ? "text-red-400" : "text-green-400"}`}>{aiError || aiSuccess}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Topic <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    required
                                    placeholder="Example: JavaScript Async/Await & Promises"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category / Tag
                                </label>
                                <input
                                    type="text"
                                    value={aiCategory}
                                    onChange={(e) => setAiCategory(e.target.value)}
                                    placeholder="e.g. Web Development, Programming, Data Science"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description / Goal
                                </label>
                                <textarea
                                    value={aiDescription}
                                    onChange={(e) => setAiDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Example: Intermediate quiz for testing async programming knowledge"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Prompt / Instructions <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Example: Generate 5 multiple-choice questions testing error handling, Promise.all, and async/await."
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        value={aiTimeLimit}
                                        onChange={(e) => setAiTimeLimit(parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={180}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Available For (minutes)</label>
                                    <input
                                        type="number"
                                        value={aiAvailableFor}
                                        onChange={(e) => setAiAvailableFor(parseInt(e.target.value) || 0)}
                                        min={1}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Generating with Gemini AI...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Generate & Save Quiz</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Create Quiz</h2>
                                    <p className="text-slate-400 text-sm">Fill in the details to create a new quiz.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Quiz Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Data Structures & Algorithms Exam"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category / Tag
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Computer Science, Mathematics, English"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter quiz description (optional)"
                                    rows={3}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Time Limit (minutes) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        value={formData.timeLimit}
                                        onChange={handleChange}
                                        required
                                        min={1}
                                        max={180}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
                                    />
                                    <p className="text-slate-500 text-xs mt-1">Duration allowed per attempt</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Available For (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="availableFor"
                                        value={formData.availableFor}
                                        onChange={handleChange}
                                        min={1}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
                                    />
                                    <p className="text-slate-500 text-xs mt-1">Total window quiz stays open after publishing</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Creating Quiz...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Create Quiz & Add Questions</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CreateQuiz;
