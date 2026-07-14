/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Sparkles, 
  Award, 
  Flame, 
  Coins, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Menu, 
  X,
  Volume2
} from "lucide-react";

// Sub-components
import Home from "./components/Home";
import CreateQuiz from "./components/CreateQuiz";
import TakeQuiz from "./components/TakeQuiz";
import Results from "./components/Results";
import ShareQuiz from "./components/ShareQuiz";
import Leaderboard from "./components/Leaderboard";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import DailyChallenge from "./components/DailyChallenge";
import AdminPanel from "./components/AdminPanel";
import Confetti from "./components/Confetti";

// Types & Client API
import { User, Quiz, Attempt, LeaderboardResponse, QuizStatsResponse, DailyChallenge as DCType, DailyChallengeScore, AdminStatsResponse } from "./types";
import { api } from "./lib/api";

export default function App() {
  // Routing State
  const [currentPath, setCurrentPath] = useState<string>("");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Core Data State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publicQuizzes, setPublicQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [activeFunnyMessage, setActiveFunnyMessage] = useState<string>("");
  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [activeStats, setActiveStats] = useState<QuizStatsResponse | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DCType | null>(null);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyChallengeScore[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStatsResponse | null>(null);

  // UI State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [nicknameInput, setNicknameInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Parse window hash for robust routing
  const parseHash = () => {
    const hash = window.location.hash || "#/";
    setCurrentPath(hash);

    // Regex matchers for arguments
    const quizMatch = hash.match(/^#\/quiz\/([A-Z0-9]+)$/i);
    const shareMatch = hash.match(/^#\/share\/([A-Z0-9]+)$/i);
    const leaderboardMatch = hash.match(/^#\/leaderboard\/([A-Z0-9]+)$/i);
    const dashboardMatch = hash.match(/^#\/dashboard\/([A-Z0-9]+)$/i);

    if (quizMatch) {
      const qId = quizMatch[1];
      setActiveQuizId(qId);
      loadTakeQuiz(qId);
    } else if (shareMatch) {
      const qId = shareMatch[1];
      setActiveQuizId(qId);
      loadShareQuiz(qId);
    } else if (leaderboardMatch) {
      const qId = leaderboardMatch[1];
      setActiveQuizId(qId);
      loadLeaderboard(qId);
    } else if (dashboardMatch) {
      const qId = dashboardMatch[1];
      setActiveQuizId(qId);
      loadDashboard(qId);
    } else {
      setActiveQuizId(null);
      if (hash === "#/profile" && !currentUser) {
        // Redirect home if profile accessed while logged out
        window.location.hash = "#/";
      }
    }
  };

  // Sync route hash change listeners
  useEffect(() => {
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, [currentUser]);

  // Sync profile and list on mount
  useEffect(() => {
    // 1. Theme sync
    const savedTheme = localStorage.getItem("friendquiz_theme");
    const matchedTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(matchedTheme);
    if (matchedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // 2. Auth sync
    const savedUserId = localStorage.getItem("friendquiz_userid");
    if (savedUserId) {
      api.getUser(savedUserId)
        .then((user) => setCurrentUser(user))
        .catch(() => localStorage.removeItem("friendquiz_userid"));
    }

    // 3. Load public quizzes
    fetchPublicQuizzes();
    
    // 4. Load daily challenge
    api.getDailyChallenge().then(setDailyChallenge).catch(console.error);
    api.getDailyLeaderboard().then(setDailyLeaderboard).catch(console.error);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("friendquiz_theme", nextTheme);
    if (nextTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const fetchPublicQuizzes = async () => {
    try {
      const list = await api.getPublicQuizzes();
      setPublicQuizzes(list);
    } catch (e) {
      console.error("Public quizzes fetch error:", e);
    }
  };

  const loadTakeQuiz = async (id: string) => {
    try {
      const quiz = await api.getQuiz(id, true);
      setActiveQuiz(quiz);
    } catch (e) {
      console.error(e);
      window.location.hash = "#/";
    }
  };

  const loadShareQuiz = async (id: string) => {
    try {
      const quiz = await api.getQuiz(id);
      setActiveQuiz(quiz);
    } catch (e) {
      console.error(e);
      window.location.hash = "#/";
    }
  };

  const loadLeaderboard = async (id: string) => {
    try {
      const response = await api.getLeaderboard(id);
      setActiveLeaderboard(response);
    } catch (e) {
      console.error(e);
      window.location.hash = "#/";
    }
  };

  const loadDashboard = async (id: string) => {
    try {
      const stats = await api.getStats(id);
      setActiveStats(stats);
    } catch (e) {
      console.error(e);
      window.location.hash = "#/";
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setAuthError("Username is required");
      return;
    }

    setAuthError("");
    try {
      if (authTab === "register") {
        const res = await api.register(usernameInput.trim(), nicknameInput.trim() || usernameInput.trim());
        setCurrentUser(res.user);
        localStorage.setItem("friendquiz_userid", res.user.id);
      } else {
        const res = await api.login(usernameInput.trim());
        setCurrentUser(res.user);
        localStorage.setItem("friendquiz_userid", res.user.id);
      }
      setShowAuthModal(false);
      setUsernameInput("");
      setNicknameInput("");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("friendquiz_userid");
    setCurrentUser(null);
    window.location.hash = "#/";
  };

  // Save Quiz (Wizard Complete)
  const handleSaveQuiz = async (quizData: any) => {
    try {
      const res = await api.createQuiz({
        creatorId: currentUser?.id,
        ...quizData
      });
      setActiveQuiz(res);
      // Update public feeds
      fetchPublicQuizzes();
      // Redirect to share screen
      window.location.hash = `#/share/${res.id}`;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Submit Answer sheet
  const handleSubmitAttempt = async (friendName: string, answers: number[]) => {
    if (!activeQuiz) return;
    try {
      const res = await api.submitAttempt(activeQuiz.id, {
        friendName,
        answers,
        playerId: currentUser?.id
      });
      setActiveAttempt(res.attempt);
      setActiveFunnyMessage(res.funnyMessage);
      
      // Trigger confetti celebrate
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Profile Update
  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const updated = await api.updateUser(currentUser.id, data);
      setCurrentUser(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimDailyReward = async () => {
    if (!currentUser) return;
    try {
      const res = await api.claimDailyReward(currentUser.id);
      if (res.success) {
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Daily Challenge submission
  const handlePlayChallenge = async (username: string, score: number, timeTaken: number) => {
    try {
      const res = await api.submitDailyChallenge({ username, score, timeTaken });
      setDailyLeaderboard(res.leaderboard);
      
      // Update local user streak/coins if logged in!
      if (currentUser) {
        const synced = await api.getUser(currentUser.id);
        setCurrentUser(synced);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (qId: string) => {
    try {
      await api.deleteQuiz(qId);
      fetchPublicQuizzes();
      window.location.hash = "#/";
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Load moderator details
  const handleLoadAdmin = async () => {
    try {
      const stats = await api.getAdminStats();
      setAdminStats(stats);
      window.location.hash = "#/admin";
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation Links Checker
  const isPathActive = (p: string) => currentPath === p;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Confetti celebrate overlay */}
      {showConfetti && <Confetti />}

      {/* Modern High-contrast Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a
            href="#/"
            className="flex items-center gap-2 text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            <span className="text-2xl">🔮</span>
            <span>Friend<span className="text-purple-600 dark:text-purple-400">Quiz</span></span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#/"
              className={`text-sm font-semibold transition-colors ${isPathActive("#/") ? "text-purple-600 dark:text-purple-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
            >
              Explore
            </a>
            <a
              href="#/daily"
              className={`text-sm font-semibold transition-colors ${isPathActive("#/daily") ? "text-purple-600 dark:text-purple-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
            >
              Daily Challenge
            </a>
            {currentUser && (
              <a
                href="#/profile"
                className={`text-sm font-semibold transition-colors ${isPathActive("#/profile") ? "text-purple-600 dark:text-purple-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
              >
                Profile Center
              </a>
            )}
          </nav>

          {/* User Controls and Toggles */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Admin Bypass */}
            {currentUser && (currentUser.username === "alex" || currentUser.username === "admin") && (
              <button
                onClick={handleLoadAdmin}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 cursor-pointer"
                title="Open Moderator Panel"
              >
                <ShieldAlert className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Profile widget or Login link */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <a
                  href="#/profile"
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 p-1.5 pr-3 rounded-full border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <span className="text-xl p-1 bg-white dark:bg-slate-950 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                    {currentUser.avatar || "🦊"}
                  </span>
                  <div>
                    <div className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 line-clamp-1">
                      {currentUser.nickname}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                      <span>Streak {currentUser.streak}</span>
                    </div>
                  </div>
                </a>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-rose-500 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthTab("register");
                  setShowAuthModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 hover:shadow-md transition-all cursor-pointer"
              >
                Sign In / Join
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <a
                href="#/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold"
              >
                Explore
              </a>
              <a
                href="#/daily"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold"
              >
                Daily Challenge
              </a>
              {currentUser && (
                <a
                  href="#/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold"
                >
                  Profile Center
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-slate-800">
                    {currentUser.avatar} {currentUser.nickname}
                  </span>
                  <button onClick={handleLogout} className="text-xs font-semibold text-rose-500">
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthTab("register");
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
                >
                  Sign In / Join
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME VIEW */}
          {(currentPath === "" || currentPath === "#/") && (
            <Home
              onCreateQuiz={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                  return;
                }
                window.location.hash = "#/create";
              }}
              onTryDemo={() => {
                window.location.hash = "#/quiz/DEMO123";
              }}
              onViewQuiz={(id) => {
                window.location.hash = `#/quiz/${id}`;
              }}
              onNavigateToDaily={() => {
                window.location.hash = "#/daily";
              }}
              publicQuizzes={publicQuizzes}
            />
          )}

          {/* 2. CREATE QUIZ VIEW */}
          {currentPath === "#/create" && (
            <CreateQuiz
              currentUser={currentUser}
              onSaveQuiz={handleSaveQuiz}
              onCancel={() => {
                window.location.hash = "#/";
              }}
            />
          )}

          {/* 3. TAKE QUIZ VIEW */}
          {currentPath.startsWith("#/quiz/") && activeQuiz && !activeAttempt && (
            <TakeQuiz
              quiz={activeQuiz}
              onSubmit={handleSubmitAttempt}
              onCancel={() => {
                window.location.hash = "#/";
              }}
            />
          )}

          {/* 4. RESULTS VIEW */}
          {currentPath.startsWith("#/quiz/") && activeQuiz && activeAttempt && (
            <Results
              quiz={activeQuiz}
              attempt={activeAttempt}
              funnyMessage={activeFunnyMessage}
              onRetry={() => {
                setActiveAttempt(null);
              }}
              onViewLeaderboard={() => {
                window.location.hash = `#/leaderboard/${activeQuiz.id}`;
                setActiveAttempt(null);
              }}
              onCreateOwnQuiz={() => {
                setActiveAttempt(null);
                if (!currentUser) {
                  setShowAuthModal(true);
                  return;
                }
                window.location.hash = "#/create";
              }}
            />
          )}

          {/* 5. SHARE VIEW */}
          {currentPath.startsWith("#/share/") && activeQuiz && (
            <ShareQuiz
              quiz={activeQuiz}
              onViewDashboard={() => {
                window.location.hash = `#/dashboard/${activeQuiz.id}`;
              }}
              onViewLeaderboard={() => {
                window.location.hash = `#/leaderboard/${activeQuiz.id}`;
              }}
            />
          )}

          {/* 6. LEADERBOARD VIEW */}
          {currentPath.startsWith("#/leaderboard/") && activeLeaderboard && (
            <Leaderboard
              quizId={activeQuizId || ""}
              quizTitle={activeLeaderboard.quizTitle}
              creatorNickname={activeLeaderboard.creatorNickname}
              creatorAvatar={activeLeaderboard.creatorAvatar}
              leaders={activeLeaderboard.leaders}
              totalAttempts={activeLeaderboard.totalAttempts}
              onPlayQuiz={() => {
                window.location.hash = `#/quiz/${activeQuizId}`;
              }}
              onCreateOwnQuiz={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                  return;
                }
                window.location.hash = "#/create";
              }}
              onBack={() => {
                window.location.hash = "#/";
              }}
            />
          )}

          {/* 7. DASHBOARD VIEW */}
          {currentPath.startsWith("#/dashboard/") && activeStats && (
            <Dashboard
              quizId={activeQuizId || ""}
              stats={activeStats}
              onDeleteQuiz={() => handleDeleteQuiz(activeQuizId || "")}
              onEditQuiz={() => {
                // Pre-populate creation from active stats questions
                window.location.hash = "#/create";
              }}
              onBack={() => {
                window.location.hash = "#/profile";
              }}
            />
          )}

          {/* 8. PROFILE VIEW */}
          {currentPath === "#/profile" && currentUser && (
            <Profile
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onClaimDailyReward={handleClaimDailyReward}
            />
          )}

          {/* 9. DAILY CHALLENGE VIEW */}
          {currentPath === "#/daily" && (
            <DailyChallenge
              currentUser={currentUser}
              challenge={dailyChallenge}
              leaderboard={dailyLeaderboard}
              onPlayChallenge={handlePlayChallenge}
              onBack={() => {
                window.location.hash = "#/";
              }}
            />
          )}

          {/* 10. ADMIN VIEW */}
          {currentPath === "#/admin" && currentUser && (
            <AdminPanel
              stats={adminStats}
              onDeleteQuiz={async (id) => {
                await api.deleteQuiz(id);
                const stats = await api.getAdminStats();
                setAdminStats(stats);
              }}
              onBack={() => {
                window.location.hash = "#/";
              }}
            />
          )}

        </AnimatePresence>
      </main>

      {/* Modal - Authentication (Login/Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 max-w-sm w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2 justify-center">
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`pb-2 font-display font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  authTab === "register" 
                    ? "border-purple-600 text-purple-600 dark:text-purple-400" 
                    : "border-transparent text-slate-400"
                }`}
              >
                Sign Up / Create Account
              </button>
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`pb-2 font-display font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  authTab === "login" 
                    ? "border-purple-600 text-purple-600 dark:text-purple-400" 
                    : "border-transparent text-slate-400"
                }`}
              >
                Log In
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-semibold">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="e.g. sarah_99 (letters/numbers only)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-850 focus:outline-none focus:border-purple-500 font-semibold text-sm"
                />
              </div>

              {authTab === "register" && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Nickname / Display Name</label>
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="e.g. Sarah the Genius"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-850 focus:outline-none focus:border-purple-500 font-semibold text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 shadow-md cursor-pointer transition-all"
              >
                {authTab === "register" ? "Create Account & Sync" : "Log In Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Clean elegant footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
        <p>© 2026 FriendQuiz. Handcrafted with modern design, gamification levels, and retro sound FX.</p>
      </footer>
    </div>
  );
}
