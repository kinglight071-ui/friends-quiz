import { motion } from "motion/react";
import { 
  Users, 
  Settings, 
  Trash2, 
  BarChart3, 
  Clock, 
  Sparkles, 
  ShieldAlert,
  ChevronLeft,
  Calendar
} from "lucide-react";
import { AdminStatsResponse } from "../types";

interface AdminPanelProps {
  stats: AdminStatsResponse | null;
  onDeleteQuiz: (id: string) => Promise<void>;
  onBack: () => void;
}

export default function AdminPanel({ stats, onDeleteQuiz, onBack }: AdminPanelProps) {
  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-mono">Verifying credentials & fetching site metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer border border-slate-100 dark:border-slate-800/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 animate-pulse" /> Moderator Control Center
          </span>
          <h3 className="text-xl font-bold font-display">Admin Dashboard</h3>
        </div>
      </div>

      {/* Global Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Members", value: stats.totalUsers, icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
          { label: "Total Quizzes", value: stats.totalQuizzes, icon: Settings, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" },
          { label: "Completed Plays", value: stats.totalAttempts, icon: BarChart3, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/20" }
        ].map((met, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className={`p-4 rounded-2xl ${met.color}`}>
              <met.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display">{met.value}</div>
              <div className="text-xs uppercase font-mono font-bold text-slate-400 dark:text-slate-500">{met.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Quizzes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider font-mono">Site Quizzes ({stats.quizzes.length})</h4>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {stats.quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850/40 text-xs">
                <div className="space-y-1 pr-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{quiz.title}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
                    <span>Creator: @{quiz.creatorName}</span>
                    <span>•</span>
                    <span>Plays: {quiz.attempts}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer transition-colors"
                  title="Remove Quiz"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider font-mono">Registered Creators ({stats.users.length})</h4>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {stats.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850/40 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {u.nickname} <span className="font-mono text-[10px] text-slate-400">(@{u.username})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-2">
                    <span>Level {u.level}</span>
                    <span>•</span>
                    <span>XP: {u.xp}</span>
                    <span>•</span>
                    <span>Coins: {u.coins}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
