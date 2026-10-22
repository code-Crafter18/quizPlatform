import { useState, useEffect } from "react";
import api from "../api/axios";

function LeaderboardModal({ quizId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && quizId) {
      fetchLeaderboard();
    }
  }, [isOpen, quizId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/api/quiz/leaderboard/${quizId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
              <p className="text-xs text-slate-400">{data?.quizTitle || "Top performers"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading rankings...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && data?.leaderboard && (
            <>
              {data.leaderboard.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No submissions yet on this quiz.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.leaderboard.map((item) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <div
                        key={item.studentId || item.rank}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          item.isCurrentUser
                            ? "bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10"
                            : isTop1
                            ? "bg-amber-500/10 border-amber-500/30"
                            : isTop2
                            ? "bg-slate-300/10 border-slate-400/30"
                            : isTop3
                            ? "bg-orange-500/10 border-orange-500/30"
                            : "bg-slate-800/40 border-slate-700/40"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Rank badge */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTop1
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                                : isTop2
                                ? "bg-slate-300 text-slate-950"
                                : isTop3
                                ? "bg-orange-500 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : item.rank}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              {item.studentName}
                              {item.isCurrentUser && (
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
                                  You
                                </span>
                              )}
                            </p>
                            {item.timeTakenSeconds > 0 && (
                              <p className="text-[11px] text-slate-400">
                                Finished in {Math.floor(item.timeTakenSeconds / 60)}m {item.timeTakenSeconds % 60}s
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Score & Percentage */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {item.score} <span className="text-xs text-slate-400 font-normal">/ {item.totalMarks}</span>
                          </p>
                          <p className={`text-xs font-semibold ${
                            item.percentage >= 80
                              ? "text-emerald-400"
                              : item.percentage >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}>
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
