import { motion } from "motion/react";
import { 
  Plus, 
  Play, 
  Zap, 
  Share2, 
  Trophy, 
  Laugh, 
  Smartphone, 
  TrendingUp, 
  ChevronRight, 
  Award, 
  Sparkles,
  Users
} from "lucide-react";

interface HomeProps {
  onCreateQuiz: () => void;
  onTryDemo: () => void;
  onViewQuiz: (id: string) => void;
  onNavigateToDaily: () => void;
  publicQuizzes: any[];
}

export default function Home({ 
  onCreateQuiz, 
  onTryDemo, 
  onViewQuiz, 
  onNavigateToDaily,
  publicQuizzes 
}: HomeProps) {
  
  const stats = [
    { label: "Quizzes Created", value: "100K+", icon: Sparkles, color: "text-purple-500" },
    { label: "Friends Challenged", value: "1M+", icon: Users, color: "text-pink-500" },
    { label: "Always Free", value: "100%", icon: Award, color: "text-blue-500" }
  ];

  const features = [
    {
      title: "Create Unlimited Quizzes",
      description: "Ask anything! Mix custom questions with our curated template library.",
      icon: Plus,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Share Instantly",
      description: "One-click share link or custom QR code for WhatsApp, Instagram, or Twitter.",
      icon: Share2,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Live Scoreboards",
      description: "See your friends' scores instantly on a beautiful, real-time leaderboard.",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500"
    },
    {
      title: "Funny Results & Badges",
      description: "Get customized hilarious status alerts and unlock unique collectible badges.",
      icon: Laugh,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "100% Mobile Responsive",
      description: "Crafted layout specifically optimized for pristine smartphone tapping experience.",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Interactive Analytics",
      description: "Deep dive into question charts, visitor counts, and player performance lists.",
      icon: TrendingUp,
      color: "from-violet-500 to-fuchsia-500"
    }
  ];

  return (
    <div id="home-view" className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-8 md:pt-12 space-y-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 blur-3xl">
          <div className="w-[300px] h-[300px] rounded-full bg-purple-400"></div>
          <div className="w-[200px] h-[200px] rounded-full bg-pink-400 -ml-16"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full text-purple-600 dark:text-purple-300 text-sm font-medium border border-purple-200 dark:border-purple-800/30 cursor-pointer"
          onClick={onNavigateToDaily}
        >
          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
          <span>New: Daily Trivia Challenge is live!</span>
          <ChevronRight className="w-3 h-3" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-extrabold tracking-tight"
        >
          How Well Do Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500">
            Friends Really Know You?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed"
        >
          Create your personalized friendship quiz in under a minute, share the custom invite link, and challenge your friends to top the leaderboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <button
            id="btn-hero-create"
            onClick={onCreateQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create Your Quiz
          </button>
          
          <button
            id="btn-hero-demo"
            onClick={onTryDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 text-pink-500 fill-pink-500" />
            Try Demo Quiz
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto"
        >
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-sm"
            >
              <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Popular Public Quizzes Section */}
      {publicQuizzes.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                Featured Public Quizzes
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Play live quizzes created by members of our community!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicQuizzes.map((quiz) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={quiz.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md p-6 flex flex-col justify-between transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-purple-50 dark:bg-purple-900/20">{quiz.creatorAvatar || "🦊"}</span>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{quiz.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">By @{quiz.creatorNickname}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    "{quiz.welcomeMessage}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    {quiz.questionCount} Qs • {quiz.attempts} plays
                  </span>
                  <button
                    onClick={() => onViewQuiz(quiz.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                  >
                    Play Quiz <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-display font-bold">Loaded With Social Fun</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to create viral quizzes and challenge your friend groups with high responsiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 dark:from-purple-950/20 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center shadow-md mb-6`}>
                <feature.icon className="w-5 h-5" />
              </div>
              
              <h3 className="text-xl font-bold font-display mb-2 text-slate-800 dark:text-slate-100">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
