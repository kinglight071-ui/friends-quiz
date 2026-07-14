import { useState } from "react";
import { motion } from "motion/react";
import { 
  Clipboard, 
  Check, 
  QrCode, 
  Send, 
  ArrowRight, 
  Award,
  BarChart3,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { Quiz } from "../types";

interface ShareQuizProps {
  quiz: Quiz;
  onViewDashboard: () => void;
  onViewLeaderboard: () => void;
}

export default function ShareQuiz({ quiz, onViewDashboard, onViewLeaderboard }: ShareQuizProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const quizUrl = `${window.location.origin}/#/quiz/${quiz.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Social Sharing Links
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `👋 Let's see how well you REALLY know me! Take my Friendship Quiz and try to top the leaderboard! 🏆\n${quizUrl}`
    )}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(quizUrl)}&text=${encodeURIComponent(
      `Let's see how well you REALLY know me! Take my Friendship Quiz! 🏆`
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `How well do my friends actually know me? Take my Friendship Quiz and test your score! 🍕👀\n${quizUrl}`
    )}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizUrl)}`
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Top Congratulatory Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30"
        >
          <span>🎉 Quiz Successfully Published!</span>
        </motion.div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight">Your Quiz is Live!</h2>
        <p className="text-slate-500 dark:text-slate-400">Share your link or QR code with friends to start receiving submissions.</p>
      </div>

      {/* Share Actions Center */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8 relative overflow-hidden">
        
        {/* Link Input card */}
        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Quiz Link</label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 font-mono text-sm text-slate-600 dark:text-slate-300 break-all flex items-center select-all">
              {quizUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="sm:px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code and Social Sharing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50 dark:border-slate-800/60">
          
          {/* Mock QR Code Card */}
          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scan to Play</span>
            
            {/* Visual SVG QR Code Mock */}
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <svg width="140" height="140" viewBox="0 0 100 100" className="text-slate-800">
                {/* Outer corners */}
                <rect x="5" y="5" width="25" height="25" fill="currentColor" rx="4" />
                <rect x="9" y="9" width="17" height="17" fill="white" rx="2" />
                <rect x="13" y="13" width="9" height="9" fill="currentColor" rx="1" />

                <rect x="70" y="5" width="25" height="25" fill="currentColor" rx="4" />
                <rect x="74" y="9" width="17" height="17" fill="white" rx="2" />
                <rect x="78" y="13" width="9" height="9" fill="currentColor" rx="1" />

                <rect x="5" y="70" width="25" height="25" fill="currentColor" rx="4" />
                <rect x="9" y="74" width="17" height="17" fill="white" rx="2" />
                <rect x="13" y="78" width="9" height="9" fill="currentColor" rx="1" />

                {/* Random QR code pixels block */}
                <rect x="40" y="10" width="6" height="6" fill="currentColor" rx="1" />
                <rect x="50" y="20" width="12" height="6" fill="currentColor" rx="1" />
                <rect x="45" y="30" width="6" height="12" fill="currentColor" rx="1" />
                <rect x="60" y="40" width="6" height="6" fill="currentColor" rx="1" />
                <rect x="40" y="50" width="12" height="6" fill="currentColor" rx="1" />
                <rect x="10" y="40" width="6" height="12" fill="currentColor" rx="1" />
                <rect x="25" y="50" width="6" height="6" fill="currentColor" rx="1" />
                <rect x="75" y="45" width="12" height="6" fill="currentColor" rx="1" />
                <rect x="70" y="60" width="6" height="12" fill="currentColor" rx="1" />
                <rect x="45" y="70" width="6" height="6" fill="currentColor" rx="1" />
                <rect x="60" y="80" width="12" height="6" fill="currentColor" rx="1" />
                <rect x="80" y="80" width="6" height="12" fill="currentColor" rx="1" />
                <rect x="40" y="85" width="6" height="6" fill="currentColor" rx="1" />
                <rect x="90" y="45" width="5" height="5" fill="currentColor" rx="1" />

                {/* Central Brand dot */}
                <circle cx="50" cy="50" r="12" fill="#7C3AED" />
                <circle cx="50" cy="50" r="8" fill="#EC4899" />
                <circle cx="50" cy="50" r="4" fill="white" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Screenshot to share on Instagram Stories!</p>
          </div>

          {/* Social Quick Launch List */}
          <div className="flex flex-col justify-between space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fast Share</span>
            
            <div className="grid grid-cols-2 gap-3">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/50 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-emerald-700 text-emerald-50" /> WhatsApp
              </a>

              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100/50 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Send className="w-4.5 h-4.5 fill-sky-700 text-sky-50" /> Telegram
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 dark:text-slate-100 border border-slate-200/50 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <span className="font-extrabold font-display">X</span> Twitter / X
              </a>

              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100/50 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4.5 h-4.5" /> Facebook
              </a>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-xs text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
              💡 <strong>Tip:</strong> Pin this quiz to your social bios so anyone who visits can test their knowledge!
            </div>
          </div>
        </div>
      </div>

      {/* Creator Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onViewLeaderboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Award className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Live Leaderboard
        </button>

        <button
          onClick={onViewDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 hover:shadow-md transition-all cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" /> Go to Creator Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
