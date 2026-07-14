import { motion } from "motion/react";
import { 
  Award, 
  Trophy, 
  Play, 
  ChevronLeft, 
  Clipboard, 
  Check, 
  Sparkles, 
  Calendar,
  Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Attempt } from "../types";

interface LeaderboardProps {
  quizId: string;
  quizTitle: string;
  creatorNickname: string;
  creatorAvatar: string;
  leaders: Attempt[];
  totalAttempts: number;
  onPlayQuiz: () => void;
  onCreateOwnQuiz: () => void;
  onBack: () => void;
}

export default function Leaderboard({
  quizId,
  quizTitle,
  creatorNickname,
  creatorAvatar,
  leaders,
  totalAttempts,
  onPlayQuiz,
  onCreateOwnQuiz,
  onBack
}: LeaderboardProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const quizUrl = `${window.location.origin}/#/quiz/${quizId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 flex items-center justify-center font-bold relative" title="Gold Medallist">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 flex items-center justify-center font-bold relative" title="Silver Medallist">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-50 shadow-sm text-amber-800 dark:bg-amber-900/10 dark:text-amber-500 border border-amber-200/30 flex items-center justify-center font-bold relative" title="Bronze Medallist">
          🥉
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center font-mono font-bold">
        #{rank}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header back button and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer border border-slate-100 dark:border-slate-800/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Scoreboard for:</span>
          <h3 className="text-xl font-bold font-display line-clamp-1">{quizTitle}</h3>
        </div>
      </div>

      {/* Creator card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-100 dark:border-purple-900/30 rounded-3xl p-5 flex items-center gap-4">
        <span className="text-4xl p-2 rounded-2xl bg-white dark:bg-slate-950 shadow-sm">{creatorAvatar || "🦁"}</span>
        <div>
          <div className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Quiz Owner</div>
          <div className="font-bold text-slate-800 dark:text-slate-100">@{creatorNickname}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total attempts recorded: {totalAttempts}</p>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/60">
          <span className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider">Top Friends</span>
          <span className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider">Rating Score</span>
        </div>

        {leaders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-4xl">🏜️</span>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">No attempts yet!</h5>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
              Be the very first to take this quiz, or share the link with your group to populate this board!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                key={leader.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  index < 3 
                    ? "bg-slate-50/60 dark:bg-slate-950/20 border-slate-100/60 dark:border-slate-800/40" 
                    : "bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(index + 1)}
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      {leader.friendName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(leader.takenAt)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-display text-base text-slate-800 dark:text-slate-200">
                    {leader.percentage}%
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {leader.score}/{leader.totalQuestions} Qs
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share / Take controls */}
      <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-6 text-center space-y-6">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Share This Scoreboard</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Invite more friends to test their ranking!</p>
        </div>

        <div className="flex gap-3 justify-center items-center">
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Copied link!
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4 text-purple-500" /> Copy Challenge Link
              </>
            )}
          </button>

          <button
            onClick={onPlayQuiz}
            className="px-5 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-purple-700"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Take Quiz Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
