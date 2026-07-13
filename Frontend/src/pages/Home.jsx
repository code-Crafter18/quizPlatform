import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [user, setUser] = useState(null);
	const [userAttempts, setUserAttempts] = useState({});
	const [quizResults, setQuizResults] = useState({});
	const [activeFilter, setActiveFilter] = useState("all");

	const navigate = useNavigate();

	useEffect(() => {
		// Get user from localStorage
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
		// Fetch quizzes and user attempts
		fetchQuizzes();
		fetchUserAttempts();
	}, []);

	const fetchQuizzes = async () => {
		try {
			const res = await axios.get("http://localhost:5000/api/quiz/quizzes");
			console.log("Quizzes response:", res.data);
			setQuizzes(res.data.quizzes || []);

			// Check results published status for each quiz
			const token = localStorage.getItem("token");
			if (token) {
				const resultsMap = {};
				for (const quiz of res.data.quizzes || []) {
					try {
						const resultRes = await axios.get(`http://localhost:5000/api/quiz/result/${quiz._id}`, {
							headers: { Authorization: `Bearer ${token}` }
						});
						resultsMap[quiz._id] = { published: true, score: resultRes.data.score, total: resultRes.data.totalQuestions };
					} catch (err) {
						// Result not available or not published
						resultsMap[quiz._id] = { published: false };
					}
				}
				setQuizResults(resultsMap);
			}

			setLoading(false);
		} catch (err) {
			console.error("Error fetching quizzes:", err);
			setError(err.response?.data?.error || err.message || "Failed to load quizzes");
			setLoading(false);
		}
	};

	const fetchUserAttempts = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const res = await axios.get("http://localhost:5000/api/quiz/my-attempts", {
				headers: { Authorization: `Bearer ${token}` }
			});

			// Create a map of quizId -> attempt for quick lookup
			const attemptsMap = {};
			(res.data.attempts || []).forEach(attempt => {
				attemptsMap[attempt.quizId] = attempt;
			});
			setUserAttempts(attemptsMap);
		} catch (err) {
			console.error("Error fetching user attempts:", err);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login", { replace: true });
	};

	const startQuiz = (quizId) => {
		navigate(`/quiz/${quizId}`)
	}

	const viewResult = (quizId) => {
		navigate(`/result/${quizId}`)
	}

	// Categorize quizzes for filtering
	const getQuizCategory = (quiz) => {
		const attempted = !!userAttempts[quiz._id];
		if (attempted) return "attempted";
		if (!quiz.isExpired) return "live";
		return "missed";
	};

	const filteredQuizzes = quizzes.filter((quiz) => {
		if (activeFilter === "all") return true;
		return getQuizCategory(quiz) === activeFilter;
	});

	const filterCounts = {
		all: quizzes.length,
		live: quizzes.filter(q => getQuizCategory(q) === "live").length,
		attempted: quizzes.filter(q => getQuizCategory(q) === "attempted").length,
		missed: quizzes.filter(q => getQuizCategory(q) === "missed").length,
	};

	return (
		<div className="min-h-screen">
			{/* Header */}
			<header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-white">QuizMaster</h1>
					</div>

					<div className="flex items-center gap-4">
						{user && (
							<span className="text-slate-300 hidden sm:block">
								Welcome, <span className="text-blue-400 font-medium">{user.name || user.email}</span>
							</span>
						)}
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition-all duration-200"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							<span className="hidden sm:inline">Logout</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-white mb-2">Available Quizzes</h2>
					<p className="text-slate-400 mb-6">Choose a quiz to test your knowledge</p>

					{/* Filter Tabs */}
					{!loading && !error && quizzes.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{[
								{ key: "all", label: "All Quizzes" },
								{ key: "live", label: "Live" },
								{ key: "attempted", label: "Attempted" },
								{ key: "missed", label: "Missed" },
							].map((filter) => (
								<button
									key={filter.key}
									onClick={() => setActiveFilter(filter.key)}
									className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
										activeFilter === filter.key
											? filter.key === "all" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
											: filter.key === "live" ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
											: filter.key === "attempted" ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25"
											: "bg-slate-500 text-white shadow-lg shadow-slate-500/25"
											: "bg-slate-800/70 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
									}`}
								>
									{filter.label}
									<span className={`min-w-[20px] h-5 flex items-center justify-center text-xs rounded-full px-1.5 ${
										activeFilter === filter.key
											? "bg-white/20 text-white"
											: "bg-slate-700/70 text-slate-400"
									}`}>
										{filterCounts[filter.key]}
									</span>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
						<p className="text-slate-400">Loading quizzes...</p>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-red-400">{error}</p>
						<button
							onClick={fetchQuizzes}
							className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition"
						>
							Try Again
						</button>
					</div>
				)}

				{/* Empty State */}
				{!loading && !error && quizzes.length === 0 && (
					<div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
						<div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
							</svg>
						</div>
						<h3 className="text-2xl font-semibold text-white mb-2">No Quizzes Available</h3>
						<p className="text-slate-400 max-w-md mx-auto">
							There are no quizzes available at the moment. Please check back later for new quizzes!
						</p>
					</div>
				)}

				{/* Quiz Grid */}
				{!loading && !error && quizzes.length > 0 && (
					<>
					{filteredQuizzes.length === 0 ? (
						<div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
							<div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-white mb-1">No quizzes in this category</h3>
							<p className="text-slate-400 text-sm">Try selecting a different filter above</p>
						</div>
					) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredQuizzes.map((quiz, index) => (
							<div
								key={quiz._id || index}
								className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									{quiz.category && (
										<span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-full">
											{quiz.category}
										</span>
									)}
								</div>

								<h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
									{quiz.title || quiz.name || "Untitled Quiz"}
								</h3>

								<p className="text-slate-400 text-sm mb-4 line-clamp-2">
									{quiz.description || "Test your knowledge with this quiz!"}
								</p>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-4 text-slate-500">
										{quiz.questions && (
											<span className="flex items-center gap-1">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{quiz.questions.length || quiz.questions} Questions
											</span>
										)}
										{quiz.duration && (
											<span className="flex items-center gap-1">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{quiz.duration} min
											</span>
										)}
									</div>

									{userAttempts[quiz._id] ? (
										quizResults[quiz._id]?.published ? (
											<button
												onClick={() => viewResult(quiz._id)}
												className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												View Result
											</button>
										) : (
											<div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Result Pending
											</div>
										)
									) : quiz.isExpired ? (
										<div className="flex items-center gap-2 bg-slate-700/50 text-slate-400 px-4 py-2 rounded-xl text-sm font-medium cursor-not-allowed">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											Quiz Ended
										</div>
									) : (
										<button onClick={() => startQuiz(quiz._id)} className="bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
											Start Quiz
										</button>
									)}
								</div>
							</div>
						))}
					</div>
					)}
					</>
				)}
			</main>
		</div>
	);
}

export default Home;

