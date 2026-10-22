import { useNavigate } from "react-router-dom";

function QuizCard({ quiz }) {
  const navigate = useNavigate();

  const isAttempted = !!quiz.attempt?.isSubmitted;
  const isResultsPublished = !!quiz.resultsPublished;
  const isExpired = !!quiz.isExpired;

  return (
    <div className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-blue-500/5">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isAttempted ? (
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                Completed
              </span>
            ) : isExpired ? (
              <span className="bg-slate-700/50 text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                Ended
              </span>
            ) : (
              <span className="bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            )}

            {!isExpired && !isAttempted && quiz.remainingMinutes > 0 && (
              <span className="text-[11px] text-amber-400/90 font-medium">
                {quiz.remainingMinutes}m left
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
          {quiz.title || "Untitled Quiz"}
        </h3>

        <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">
          {quiz.description || "Test your knowledge and challenge yourself with this quiz."}
        </p>
      </div>

      <div>
        {/* Meta badges: Questions & Time Limit */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-5 py-3 border-y border-slate-700/40">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {quiz.totalQuestions || 0} Questions
          </span>

          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {quiz.timeLimit || 15} Mins
          </span>

          {isAttempted && isResultsPublished && quiz.attempt?.score !== null && (
            <span className="ml-auto text-emerald-400 font-semibold">
              Score: {quiz.attempt.score} / {quiz.totalQuestions}
            </span>
          )}
        </div>

        {/* Action Button */}
        {isAttempted ? (
          isResultsPublished ? (
            <button
              onClick={() => navigate(`/result/${quiz._id}`)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-medium py-2.5 rounded-xl text-sm transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Detailed Result
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400/90 py-2.5 rounded-xl text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Evaluation Pending
            </div>
          )
        ) : isExpired ? (
          <div className="w-full flex items-center justify-center gap-2 bg-slate-800/80 border border-slate-700 text-slate-500 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Quiz Ended
          </div>
        ) : (
          <button
            onClick={() => navigate(`/quiz/${quiz._id}`)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            Start Quiz
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizCard;
