import { motion } from "motion/react";
import { 
  Trophy, 
  Share2, 
  RotateCcw, 
  ChevronRight, 
  Award, 
  Plus, 
  Sparkles,
  Clipboard,
  Check
} from "lucide-react";
import { useState } from "react";
import { Quiz, Attempt } from "../types";

interface ResultsProps {
  quiz: Quiz;
  attempt: Attempt;
  funnyMessage: string;
  onRetry: () => void;
  onViewLeaderboard: () => void;
  onCreateOwnQuiz: () => void;
}

export default function Results({ 
  quiz, 
  attempt, 
  funnyMessage, 
  onRetry, 
  onViewLeaderboard, 
  onCreateOwnQuiz 
}: ResultsProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyResult = () => {
    const shareText = `I just took ${quiz.creatorNickname}'s Friendship Quiz and scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)! Can you beat my score? Challenge yourself here: ${window.location.origin}/#/quiz/${quiz.id}`;
    
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50";
    if (pct >= 70) return "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200/50";
    if (pct >= 50) return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200/50";
    if (pct >= 30) return "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50";
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200/50";
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 mb-2"
        >
          <Trophy className="w-10 h-10 animate-bounce" />
        </motion.div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight">Quiz Finished!</h2>
        <p className="text-slate-500 dark:text-slate-400">Excellent effort! Let's see your friendship rating.</p>
      </div>

      {/* Visual Friendship Bond Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-8 text-white shadow-xl overflow-hidden text-center space-y-6"
      >
        {/* Abstract Background Blobs */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_50%)]"></div>
        
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase bg-white/15 px-3 py-1 rounded-full inline-block">
            Official Friendship Rating
          </span>
          <h3 className="text-xl font-bold font-display">Bond Certificate</h3>
        </div>

        {/* Center score indicator */}
        <div className="relative inline-flex items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-44 h-44 mx-auto">
          <div className="space-y-1">
            <span className="text-5xl font-extrabold font-display leading-none block">
              {attempt.percentage}%
            </span>
            <span className="text-xs font-mono font-medium text-pink-100 block">
              {attempt.score} / {attempt.totalQuestions} Right
            </span>
          </div>
        </div>

        {/* Dynamic relationship comment */}
        <div className="space-y-2 px-4">
          <p className="text-lg font-bold font-display italic">
            "{funnyMessage}"
          </p>
          <p className="text-xs text-pink-100 font-medium">
            Challenge completed by <span className="font-bold underline">{attempt.friendName}</span>
          </p>
        </div>

        {/* Creator credit info */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-pink-100">
          <span>Quiz ID: #{quiz.id}</span>
          <span className="flex items-center gap-1.5">
            Owner: {quiz.creatorAvatar} {quiz.creatorNickname}
          </span>
        </div>
      </motion.div>

      {/* Action Buttons list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCopyResult}
          className="py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-500" /> Coined copied!
            </>
          ) : (
            <>
              <Clipboard className="w-5 h-5 text-purple-500" /> Copy Score Link
            </>
          )}
        </button>

        <button
          onClick={onViewLeaderboard}
          className="py-4 px-6 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Award className="w-5 h-5" /> View Leaderboard
        </button>
      </div>

      {/* Mini stats tracker & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">Play Again or Take Turn</h4>
        
        <div className="space-y-3">
          {quiz.settings.allowRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-pink-500" /> Retake quiz to boost score?
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          <button
            onClick={onCreateOwnQuiz}
            className="w-full py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" /> Create your own friendship quiz!
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
