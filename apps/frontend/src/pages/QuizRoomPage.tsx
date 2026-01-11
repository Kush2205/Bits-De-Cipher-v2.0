import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveLeaderboard from "../components/LiveLeaderboard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import {
  joinQuizRoom,
  submitAnswer as submitAnswerThunk,
  useHint as useHintThunk,
  clearLastSubmitResult,
  clearHintLockMessage,
} from "../store/slices/quizSlice";
import {
  refreshLeaderboard,
  requestAllLeaderboard,
} from "../store/slices/leaderboardSlice";

const QuizRoomPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketState = useAppSelector((state) => state.socket);
  const quiz = useAppSelector((state) => state.quiz);
  const leaderboardState = useAppSelector((state) => state.leaderboard);
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [shake, setShake] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false); // New Zoom State
  const [flashMessage, setFlashMessage] = useState<{title: string;message: string;} | null>(null);

  // --- LOGIC: UNCHANGED ---
  const formatInIST = (date: Date) => {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    return `${formatted} IST`;
  };

  useEffect(() => {
    if (socketState.isConnected && !quiz.isJoined && !quiz.isJoining) {
      dispatch(joinQuizRoom());
    }
  }, [dispatch, socketState.isConnected, quiz.isJoined, quiz.isJoining]);

  useEffect(() => {
    if (quiz.currentQuestion) {
      setAnswer("");
      dispatch(clearLastSubmitResult());
      dispatch(refreshLeaderboard({ userId: user?.id }));
    }
  }, [dispatch, quiz.currentQuestion?.id, user?.id]);

  useEffect(() => {
    if (quiz.lastSubmitResult && !quiz.lastSubmitResult.isCorrect) {
      const timer = setTimeout(() => {
        dispatch(clearLastSubmitResult());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [quiz.lastSubmitResult, dispatch]);

  useEffect(() => {
    if (quiz.lastSubmitResult && !quiz.lastSubmitResult.isCorrect) {
      setShake(true);
      const timer = setTimeout(() => {
        setShake(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [quiz.lastSubmitResult]);

  const handleSubmitAnswer = async () => {
    if (!quiz.currentQuestion || !answer.trim() || quiz.isSubmitting) {
      return;
    }
    const result = await dispatch(
      submitAnswerThunk({
        questionId: quiz.currentQuestion.id,
        answer: answer.trim(),
      })
    ).unwrap();

    if (result?.isCorrect && !result.alreadyCompleted) {
      if (result.nextQuestion) {
        setAnswer("");
      }
    }
  };

  const handleUseHint = async (hintNumber: 1 | 2) => {
    if (!quiz.currentQuestion) return;
    const result = await dispatch(
      useHintThunk({ questionId: quiz.currentQuestion.id, hintNumber })
    ).unwrap();

    if ("locked" in result && result.locked) {
      const unlockDate = result.unlocksAt
        ? new Date(result.unlocksAt)
        : typeof result.remainingMs === "number"
          ? new Date(Date.now() + result.remainingMs)
          : null;

      const message = unlockDate
        ? `Hints will be unlocked at ${formatInIST(unlockDate)}`
        : result.message;

      setFlashMessage({
        title: "Hint Locked",
        message,
      });

      dispatch(clearHintLockMessage());

      setTimeout(() => {
        setFlashMessage(null);
      }, 3000);
    }


  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const handleViewFullLeaderboard = () => {
    dispatch(requestAllLeaderboard());
    setShowFullLeaderboard(true);
  };

  const combinedError = leaderboardState.error || socketState.error;

  // --- UI COMPONENTS ---

  if (!socketState.isConnected || (!quiz.isJoined && !combinedError)) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
          </div>
          <p className="text-white text-sm font-medium animate-pulse">
            Initializing System...
          </p>
        </div>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-red-950/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="text-red-500 text-lg font-bold mb-2">Error</h2>
          <p className="text-gray-400 text-xs mb-6">{combinedError}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz.currentQuestion) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#0d0e12] border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Quiz Complete!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Great job completing the quiz!
          </p>
          <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5">
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold mb-1">
              Final Score
            </p>
            <p className="text-5xl font-black text-emerald-400">
              {quiz.userStats?.totalPoints || 0}
            </p>
            {leaderboardState.currentUserRank && (
              <p className="text-sm text-gray-300 mt-4 pt-4 border-t border-white/5">
                Rank:{" "}
                <span className="text-emerald-400 font-bold">
                  #{leaderboardState.currentUserRank}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              Leaderboard
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const basePoints = quiz.currentQuestion.points;
  const minPoints = Math.floor(quiz.currentQuestion.maxPoints * 0.5);
  let adjustedPoints = basePoints;
  if (quiz.usedHints.hint1) adjustedPoints -= 0.15 * adjustedPoints;
  if (quiz.usedHints.hint2) adjustedPoints -= 0.3 * adjustedPoints;
  const displayPoints = Math.max(minPoints, Math.floor(adjustedPoints));
  const isWrong = quiz.lastSubmitResult && !quiz.lastSubmitResult.isCorrect;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#05060a] text-gray-300">
      {/* Flash Message */}
      {flashMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="relative max-w-sm rounded-2xl border border-red-500/30 bg-[#0d0e12]/95 backdrop-blur-xl shadow-2xl shadow-red-900/30 p-4">
            
            {/* Close Button */}
            <button
              onClick={() => setFlashMessage(null)}
              className="absolute top-2 right-2 rounded-md p-1 text-gray-500 hover:text-white hover:bg-white/5 transition"
            >
              ✕
            </button>

            <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">
              {flashMessage.title}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed pr-4">
              {flashMessage.message}
            </p>
          </div>
        </div>
      )}

      {/* Zoomed Overlay */}
      {isZoomed && quiz.currentQuestion.imageUrl && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={quiz.currentQuestion.imageUrl}
            alt="Zoomed Question"
            className="max-w-[85%] max-h-[85%] object-contain shadow-2xl transition-transform duration-300"
          />
        </div>
      )}

      {/*Navbar */}
      <nav className="shrink-0 border-b border-white/5 bg-[#0d0e12]/80 backdrop-blur-md">
        <div className="mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white tracking-tight italic">
                Bits De Cipher
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold leading-none">
                  Player
                </p>
                <p className="text-xs font-semibold text-emerald-400">
                  {user?.name || user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-400 transition-all hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden px-6 py-4">
        {/* Main Workspace */}
        <div className="col-span-12 flex min-h-0 flex-col gap-4 lg:col-span-9">
          {/* Question Display */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0d0e12] shadow-xl">
            {quiz.currentQuestion.imageUrl && (
              <div className="relative group flex items-center justify-center h-full w-full">
                <img
                  src={quiz.currentQuestion.imageUrl}
                  alt="Question"
                  className="max-h-full max-w-full w-auto h-auto object-contain p-4 cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
                  onClick={() => setIsZoomed(true)}
                />

                <div className="absolute bottom-6 right-6 text-[9px] uppercase font-bold text-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Click Image to Zoom
                </div>
              </div>
            )}

            
            <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-xl pointer-events-none z-10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5 leading-none">
                Points
              </p>
              <p className="text-xl font-black text-emerald-400 leading-none">
                {displayPoints}
              </p>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-white/5 bg-[#0d0e12] p-5 shadow-lg">
            {/* Hint Toggles */}
            <div className="flex gap-3">
              {[0, 1].map((idx) => {
                const hintKey = `hint${idx + 1}` as "hint1" | "hint2";
                const hasHint =
                  quiz.currentQuestion?.hints &&
                  quiz.currentQuestion.hints[idx];
                if (!hasHint) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => handleUseHint((idx + 1) as 1 | 2)}
                    disabled={quiz.usedHints[hintKey]}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border ${
                      quiz.usedHints[hintKey]
                        ? "border-white/5 bg-white/5 text-gray-600"
                        : idx === 0
                          ? "border-amber-500/20 bg-amber-500/5 text-amber-500 hover:border-amber-500"
                          : "border-orange-500/20 bg-orange-500/5 text-orange-500 hover:border-orange-500"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {quiz.usedHints[hintKey]
                      ? `Hint ${idx + 1} used`
                      : `Use Hint ${idx + 1}`}
                  </button>
                );
              })}
            </div>

            {/* RESERVED HINT SPACE - Stable Height */}
            <div
              className={`h-14 flex flex-col justify-center rounded-xl px-4 py-2 transition-all border ${quiz.usedHints.hint1 || quiz.usedHints.hint2 ? "border-white/5 bg-white/5" : "border-dashed border-white/5 bg-transparent"}`}
            >
              {quiz.usedHints.hint1 && quiz.currentQuestion.hints?.[0] && (
                <p className="text-[11px] text-amber-200/70 italic line-clamp-1">
                  <span className="text-amber-500 font-bold mr-1">H1:</span>{" "}
                  {quiz.currentQuestion.hints[0].hintText}
                </p>
              )}
              {quiz.usedHints.hint2 && quiz.currentQuestion.hints?.[1] && (
                <p
                  className={`text-[11px] text-orange-200/70 italic line-clamp-1 ${quiz.usedHints.hint1 ? "mt-1 pt-1 border-t border-white/5" : ""}`}
                >
                  <span className="text-orange-500 font-bold mr-1">H2:</span>{" "}
                  {quiz.currentQuestion.hints[1].hintText}
                </p>
              )}
              {!quiz.usedHints.hint1 && !quiz.usedHints.hint2 && (
                <p className="text-center tracking-widest text-[9px] uppercase font-bold opacity-30">
                  System Idle: Hints Locked
                </p>
              )}
            </div>

            {/* Answer Field - Slimmer */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                className={`flex-1 rounded-xl bg-black/40 px-4 py-3 text-sm text-white font-medium outline-none transition-all border
                  ${isWrong ? "border-red-500/50" : "border-white/10 focus:border-emerald-500/40"}
                  ${shake ? "animate-shake" : ""}
                `}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || quiz.isSubmitting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 text-xs font-black uppercase tracking-widest text-black transition-all disabled:opacity-30"
              >
                {quiz.isSubmitting ? "..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Compact */}
        <div className="col-span-12 flex min-h-0 flex-col lg:col-span-3">
          <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-[#0d0e12] shadow-xl">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Leaderboard
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <LiveLeaderboard
                participants={leaderboardState.entries}
                currentUserId={user?.id || ""}
                limit={10}
              />
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
              <button
                onClick={handleViewFullLeaderboard}
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2 text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
              >
                View Full LeaderBoard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard*/}
      {showFullLeaderboard && (
        <div className="fixed inset-0 bg-[#05060a]/95 backdrop-blur-md flex items-center justify-center p-4 z-110">
          <div className="bg-[#0d0e12] rounded-2xl border border-white/10 max-w-md w-full max-h-[70vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Full Leaderboard
              </h2>
              <button
                onClick={() => setShowFullLeaderboard(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <LiveLeaderboard
                participants={leaderboardState.entries}
                currentUserId={user?.id || ""}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default QuizRoomPage;
