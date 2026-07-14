import { useState } from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Flame, 
  Coins, 
  Sparkles, 
  Edit3, 
  Globe, 
  Check, 
  User as UserIcon,
  Crown,
  Lock
} from "lucide-react";
import { User } from "../types";

interface ProfileProps {
  user: User;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
  onClaimDailyReward: () => Promise<void>;
}

const AVATAR_POOL = ["🦊", "🦁", "🐼", "🐻", "🐨", "🐯", "🐵", "🐙", "🧙‍♂️", "🦄", "👾", "👽", "🤖"];

const ALL_ACHIEVEMENTS = [
  { id: "newbie", title: "Newbie Legend", desc: "Successfully joined FriendQuiz. Welcome! 🎉", icon: "🌱", color: "from-emerald-400 to-teal-500" },
  { id: "quiz_creator", title: "Quiz Architect", desc: "Designed and published your first custom quiz.", icon: "✏️", color: "from-blue-400 to-indigo-500" },
  { id: "perfect_score", title: "Flawless Bond", desc: "Scored 100% on a friend's quiz. Mindreader status! 🧠", icon: "👑", color: "from-amber-400 to-yellow-500" },
  { id: "social_star", title: "Viral Legend", desc: "Logged 5+ player attempts on your quizzes.", icon: "🌟", color: "from-pink-400 to-rose-500" },
  { id: "rising_star", title: "Rising Genius", desc: "Gained enough creator XP to reach Level 2.", icon: "🚀", color: "from-violet-400 to-purple-500" },
  { id: "quiz_master", title: "Quiz Champion", desc: "Gained epic respect by reaching Level 5.", icon: "🧙‍♂️", color: "from-red-400 to-pink-600" },
  { id: "streak_seeker", title: "Flame Seeker", desc: "Maintained a 3-day quiz-taking streak.", icon: "🔥", color: "from-orange-400 to-amber-500" },
  { id: "coin_collector", title: "Gold Miner", desc: "Amassed more than 500 total FriendQuiz coins.", icon: "💰", color: "from-yellow-400 to-amber-600" }
];

export default function Profile({ user, onUpdateProfile, onClaimDailyReward }: ProfileProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>(user.nickname);
  const [bio, setBio] = useState<string>(user.bio);
  const [country, setCountry] = useState<string>(user.country);
  const [avatar, setAvatar] = useState<string>(user.avatar);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile({ nickname, bio, country, avatar });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      await onClaimDailyReward();
      setRewardClaimed(true);
    } catch (e) {
      console.error(e);
    }
  };

  // XP Progress Calculation
  const currentXp = user.xp;
  const nextLevelThreshold = user.level * 500;
  const previousLevelThreshold = (user.level - 1) * 500;
  const xpInLevel = currentXp - previousLevelThreshold;
  const xpNeededForLevel = nextLevelThreshold - previousLevelThreshold;
  const xpPercentage = Math.min(Math.round((xpInLevel / xpNeededForLevel) * 100), 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Top Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 dark:from-purple-950/20 to-transparent rounded-bl-full -z-10"></div>
        
        {isEditing ? (
          /* Profile Edit Mode */
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display">Edit Profile</h3>
            
            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Avatar Emoji</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_POOL.map((em) => (
                  <button
                    key={em}
                    onClick={() => setAvatar(em)}
                    className={`text-2xl p-2.5 rounded-xl transition-all ${avatar === em ? "bg-purple-100 dark:bg-purple-950/40 ring-2 ring-purple-500 scale-110" : "bg-slate-50 dark:bg-slate-950/30 hover:bg-slate-100"}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Display Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Custom Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        ) : (
          /* Profile Viewer Mode */
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <span className="text-6xl p-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100/30 rounded-3xl">
              {user.avatar || "🦊"}
            </span>
            <div className="space-y-3 flex-1">
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-2xl font-bold font-display flex items-center gap-2 justify-center sm:justify-start">
                    {user.nickname}
                    <span className="text-xs font-mono font-medium text-slate-400">(@{user.username})</span>
                  </h4>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer self-center text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic max-w-lg">
                  "{user.bio}"
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-600 dark:text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-purple-500" /> {user.country || "Earth"}
                </span>
                <span className="font-mono">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level, Coins, Streak & Rewards Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* XP Progress Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500">Level Progression</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-sm flex items-center gap-1.5 font-display">
              <Crown className="w-4 h-4 fill-purple-600/10" /> Level {user.level}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>XP: {user.xp} / {nextLevelThreshold}</span>
              <span>{xpPercentage}%</span>
            </div>
            {/* Progress slot */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
              ✨ Earn creator XP by making quizzes (150 XP) and playing friend challenges (50+ XP).
            </p>
          </div>
        </div>

        {/* Coins, Streaks, Daily Reward Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>{user.coins} Coins</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{user.streak} Streak</span>
            </div>
          </div>

          {rewardClaimed ? (
            <div className="py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Daily Reward claimed today!
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Claim Daily Gift (+20 Coins, +50 XP)
            </button>
          )}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-bold font-display">Trophies & Badges</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Unlock special achievements as you build and take quizzes!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = user.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border relative overflow-hidden flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isUnlocked
                    ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-950/10 border-dashed border-slate-200 dark:border-slate-900 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {isUnlocked ? (
                      <span className={`text-2xl p-2.5 rounded-2xl bg-gradient-to-r ${ach.color} text-white shadow-sm inline-block`}>
                        {ach.icon}
                      </span>
                    ) : (
                      <span className="text-xs p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 inline-block">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}

                    {isUnlocked ? (
                      <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-full uppercase">
                        Locked
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{ach.title}</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{ach.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
