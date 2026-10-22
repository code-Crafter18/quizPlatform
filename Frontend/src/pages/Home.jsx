import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import QuizCard from "../components/QuizCard";

function Home() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      // Single optimized batch endpoint returns all quizzes enriched with attempt status
      const res = await api.get("/api/quiz/quizzes");
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  // Categorize quizzes for filtering
  const getQuizCategory = (quiz) => {
    if (quiz.attempt?.isSubmitted) return "attempted";
    if (!quiz.isExpired) return "live";
    return "missed";
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesFilter = activeFilter === "all" || getQuizCategory(quiz) === activeFilter;
    const matchesSearch =
      !searchQuery ||
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: quizzes.length,
    live: quizzes.filter((q) => !q.isExpired && !q.attempt?.isSubmitted).length,
    attempted: quizzes.filter((q) => q.attempt?.isSubmitted).length,
    missed: quizzes.filter((q) => q.isExpired && !q.attempt?.isSubmitted).length,
  };

  return (
    <div className="min-h-screen">
      <Navbar subtitle="Student Learning Portal" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Hello, <span className="text-blue-400">{user?.name || "Student"}</span> 👋
          </h2>
          <p className="text-slate-400 mt-1">
            Track your performance and take your assigned quizzes.
          </p>
        </div>

        {/* Student Stats Bar */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Assigned Quizzes"
              value={stats.total}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              gradient="bg-blue-500/15 text-blue-400"
            />
            <StatCard
              title="Live & Available"
              value={stats.live}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              gradient="bg-green-500/15 text-green-400"
            />
            <StatCard
              title="Completed"
              value={stats.attempted}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              gradient="bg-purple-500/15 text-purple-400"
            />
            <StatCard
              title="Expired / Missed"
              value={stats.missed}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              gradient="bg-slate-700/50 text-slate-400"
            />
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", count: stats.total },
              { key: "live", label: "Live Now", count: stats.live },
              { key: "attempted", label: "Completed", count: stats.attempted },
              { key: "missed", label: "Expired", count: stats.missed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeFilter === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-700/70 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading your quizzes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchQuizzes}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-xl text-sm transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && quizzes.length === 0 && (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Quizzes Available Yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              You haven&apos;t received any quiz invitations yet, or your invitations are pending acceptance.
            </p>
            <a
              href="/invitations"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-500/25"
            >
              Check Invitations
            </a>
          </div>
        )}

        {/* Quiz Grid */}
        {!loading && !error && quizzes.length > 0 && (
          <>
            {filteredQuizzes.length === 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 text-center">
                <p className="text-slate-300 font-medium">No quizzes match your search or filter</p>
                <p className="text-slate-500 text-sm mt-1">Try resetting the filter or clearing the search box</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard key={quiz._id} quiz={quiz} />
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
