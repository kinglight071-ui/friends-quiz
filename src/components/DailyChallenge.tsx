import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Clock, 
  HelpCircle, 
  Play, 
  Check, 
  X, 
  ArrowRight,
  Flame,
  Award,
  Users,
  Sparkles
} from "lucide-react";
import { DailyChallenge as DCType, DailyChallengeScore, User } from "../types";

interface DailyChallengeProps {
  currentUser: User | null;
  challenge: DCType | null;
  leaderboard: DailyChallengeScore[];
  onPlayChallenge: (username: string, score: number, timeTaken: number) => Promise<void>;
  onBack: () => void;
}

export default function DailyChallenge({
  currentUser,
  challenge,
  leaderboard,
  onPlayChallenge,
  onBack
}: DailyChallengeProps) {
  const [username, setUsername] = useState<string>("");
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Time-taken stopwatch
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.nickname);
    }
  }, [currentUser]);

  useEffect(() => {
    if (started && !finished) {
      stopwatchRef.current = setInterval(() => {
        setTimeTaken((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [started, finished]);

  if (!challenge) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">Entering the Trivia Arena...</p>
      </div>
    );
  }

  const handleStart = () => {
    if (!username.trim()) return;
    setStarted(true);
    setTimeTaken(0);
  };

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optIdx);
    setIsAnswered(true);

    // Hardcode answer checks based on static questions
    const answersKey = [1, 0, 3, 2, 1]; // matching correctAnswerIndex in server.ts staticDailyQuestions
    const correctIdx = answersKey[currentQIndex];
    const isCorrect = optIdx === correctIdx;

    setTimeout(() => {
      const updatedAnswers = [...answers, optIdx];
      setAnswers(updatedAnswers);

      if (currentQIndex < challenge.questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setFinished(true);
        if (stopwatchRef.current) clearInterval(stopwatchRef.current);
        
        // Calculate score
        let score = 0;
        updatedAnswers.forEach((ans, idx) => {
          if (ans === answersKey[idx]) score++;
        });

        onPlayChallenge(username.trim(), score, timeTaken);
      }
    }, 1500);
  };

  const currentQuestion = challenge.questions[currentQIndex];
  const progressPercent = Math.round(((currentQIndex + (isAnswered ? 1 : 0)) / challenge.questions.length) * 100);

  const getLeaderboardBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {!started && !finished ? (
        /* Daily Challenge Onboarding */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6 text-center"
        >
          <div className="space-y-2">
            <span className="text-4xl p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white inline-block shadow-md">
              🎯
            </span>
            <h3 className="text-2xl font-bold font-display">Daily Friendship Trivia</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
              {challenge.date}
            </p>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Welcome to the daily arena! Answer 5 rapid-fire questions testing your friendship psychology, history, and pop culture knowledge. Fast speeds rank higher!
          </p>

          <div className="pt-4 space-y-4 border-t border-slate-50 dark:border-slate-800/60 text-left">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Enter Challenger Name</label>
              <input
                type="text"
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Name to display on leaderboard..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-purple-500 font-semibold text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!username.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" /> Enter Trivia Arena
          </button>
        </motion.div>
      ) : started && !finished ? (
        /* Gameplay Mode */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider text-slate-500">
              Daily Trivia Q {currentQIndex + 1} of {challenge.questions.length}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>{timeTaken}s elapsed</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6"
              >
                <div className="space-y-2">
                  <span className="inline-block text-[9px] font-bold tracking-widest font-mono uppercase bg-purple-50 dark:bg-purple-950/20 text-purple-600 px-2.5 py-1 rounded-full">
                    Category: {currentQuestion.category}
                  </span>
                  <h4 className="text-lg md:text-xl font-bold font-display leading-snug text-slate-800 dark:text-slate-100">
                    {currentQuestion.text}
                  </h4>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    // Verify answer key
                    const answersKey = [1, 0, 3, 2, 1];
                    const correctIdx = answersKey[currentQIndex];
                    const isCorrect = oIdx === correctIdx;

                    let btnStyle = "bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100/70";
                    let iconNode = null;

                    if (isAnswered) {
                      if (isSelected) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500 border-emerald-500 text-white shadow-md";
                          iconNode = <Check className="w-4 h-4" />;
                        } else {
                          btnStyle = "bg-rose-500 border-rose-500 text-white shadow-md";
                          iconNode = <X className="w-4 h-4" />;
                        }
                      } else if (isCorrect) {
                        btnStyle = "bg-emerald-500 border-emerald-500 text-white";
                        iconNode = <Check className="w-4 h-4" />;
                      } else {
                        btnStyle = "opacity-40 scale-95 pointer-events-none";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between font-semibold text-sm transition-all cursor-pointer ${btnStyle}`}
                      >
                        <span className="flex-1 line-clamp-2">{opt}</span>
                        {iconNode}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Results and Daily Leaderboard */
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl p-8 text-white text-center shadow-lg space-y-4"
          >
            <span className="text-4xl">🏆</span>
            <h3 className="text-2xl font-bold font-display">Daily Challenge Submitted!</h3>
            <p className="text-sm text-pink-100 max-w-sm mx-auto">
              You answered correctly in <strong>{timeTaken} seconds</strong>. Check your rank on today's leaderboard below!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-white text-purple-700 font-bold rounded-xl text-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              Back to Home <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Daily Leaderboard Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-800">
              <Trophy className="w-4 h-4 text-yellow-500" /> Today's Daily Standings
            </h4>

            {leaderboard.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No scores posted yet. Be the pioneer!</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/40 dark:border-slate-800/30">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                        {getLeaderboardBadge(index + 1)}
                      </span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{item.username}</span>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold font-display">{item.score} / 5 Qs</div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{item.timeTaken}s elapsed</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
