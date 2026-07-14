import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Users, 
  Eye, 
  Trophy, 
  TrendingUp, 
  ChevronLeft, 
  Clipboard, 
  Check, 
  Trash2, 
  Settings, 
  Calendar,
  AlertTriangle,
  Award
} from "lucide-react";
import { QuizStatsResponse, Attempt } from "../types";

interface DashboardProps {
  quizId: string;
  stats: QuizStatsResponse | null;
  onDeleteQuiz: () => Promise<void>;
  onEditQuiz: () => void;
  onBack: () => void;
}

export default function Dashboard({ quizId, stats, onDeleteQuiz, onEditQuiz, onBack }: DashboardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const quizUrl = `${window.location.origin}/#/quiz/${quizId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteQuiz();
    } catch (e) {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
    if (pct >= 70) return "text-purple-500 bg-purple-50 dark:bg-purple-950/20";
    if (pct >= 50) return "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
    return "text-rose-500 bg-rose-50 dark:bg-rose-950/20";
  };

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">Loading analytics dashboard...</p>
      </div>
    );
  }

  // Pre-configured custom palette for distribution bar charts
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#7C3AED", "#10B981"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Top Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer border border-slate-100 dark:border-slate-800/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Creator Room</span>
            <h3 className="text-xl font-bold font-display line-clamp-1">{stats.title}</h3>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEditQuiz}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Edit Quiz
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Delete Quiz
          </button>
        </div>
      </div>

      {/* Quick invite link card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm">Challenge Link</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">Copy and share this URL to receive more friend attempts!</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-xs font-mono text-slate-500 select-all flex items-center truncate">
            {quizUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Analytics Metric boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors", value: stats.totalVisitors, icon: Eye, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
          { label: "Completed Plays", value: stats.totalAttempts, icon: Users, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" },
          { label: "Average Score", value: `${stats.averageScore}%`, icon: TrendingUp, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/20" },
          { label: "Highest Score", value: `${stats.highestScore}%`, icon: Trophy, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" }
        ].map((met, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-2xl ${met.color}`}>
              <met.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{met.value}</div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-slate-500">{met.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Player Records Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score distribution graph */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h4 className="font-bold text-base font-display">Score Percentile Distribution</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">How well your friends are performing overall.</p>
          </div>

          <div className="h-64 w-full">
            {stats.totalAttempts === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <span className="text-3xl">📊</span>
                <p className="text-xs">No graph data. Share your quiz to view player ratings!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(124, 58, 237, 0.05)" }}
                    contentStyle={{ borderRadius: "16px", border: "1px solid #f1f5f9", fontSize: "12px", fontFamily: "sans-serif" }}
                  />
                  <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]}>
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Attempts logs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6 max-h-[380px] overflow-y-auto">
          <div className="space-y-1">
            <h4 className="font-bold text-base font-display">Recent Attempts</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live feed of friends' scores.</p>
          </div>

          {stats.recentAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <span className="text-3xl">⏳</span>
              <p className="text-xs">Waiting for your first player...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAttempts.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/40">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{att.friendName}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(att.takenAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-display ${getPercentageColor(att.percentage)}`}>
                    {att.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Delete Confirmation */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full inline-block">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-bold">Are you absolutely sure?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This action is 100% irreversible. Deleting this quiz will wipe its question cards and remove all friend attempt leaderboard logs forever.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete It"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
