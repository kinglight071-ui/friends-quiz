import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash, 
  Sparkles, 
  Settings, 
  HelpCircle,
  Check,
  Save,
  Smile
} from "lucide-react";
import { User, Question, QuizSettings } from "../types";

interface CreateQuizProps {
  currentUser: User | null;
  onSaveQuiz: (quizData: {
    title: string;
    welcomeMessage: string;
    questions: Omit<Question, "id">[];
    settings: QuizSettings;
  }) => Promise<void>;
  onCancel: () => void;
}

const TEMPLATE_QUESTIONS = [
  {
    text: "What is my absolute favorite food?",
    options: ["Pepperoni Pizza", "Burgers & Fries", "Sushi / Sashimi", "Creamy Pasta"],
    category: "food"
  },
  {
    text: "Where is my absolute dream holiday destination?",
    options: ["Japan (Kyoto & Tokyo)", "Iceland (Northern Lights)", "Maldives (Beach Villa)", "Switzerland (Alps)"],
    category: "dream country"
  },
  {
    text: "What is my absolute favorite color?",
    options: ["Royal Blue", "Crimson Red", "Forest Green", "Midnight Black"],
    category: "color"
  },
  {
    text: "What animal would I love to have as a pet?",
    options: ["A red fox", "A lazy cat", "A Golden Retriever", "An exotic sugar glider"],
    category: "pet"
  },
  {
    text: "What is my absolute favorite hobby/weekend activity?",
    options: ["Binge-watching anime/series", "Hiking & outdoor adventure", "Coding cool side-projects", "Cooking elaborate meals"],
    category: "hobby"
  },
  {
    text: "If I could only watch one movie genre forever, what is it?",
    options: ["Sci-Fi & Fantasy", "Horror & Thriller", "Comedy & Sitcoms", "Anime / Animation"],
    category: "movie"
  },
  {
    text: "What is my biggest pet peeve in daily life?",
    options: ["Slow internet connection", "Chewing loudly", "Late replies to messages", "People walking too slowly"],
    category: "hobby"
  },
  {
    text: "How do I deal with an incredibly stressful day?",
    options: ["Sleeping for 12 hours", "Listening to lo-fi / gaming", "Going for a run / workout", "Eating comfort food"],
    category: "music"
  },
  {
    text: "What is my favorite sport to play or follow?",
    options: ["Football / Soccer", "Basketball", "Formula 1", "Tennis"],
    category: "sport"
  },
  {
    text: "If I won a million dollars today, what's the first buy?",
    options: ["A luxurious modern house", "An electric supercar", "Traveling the entire world", "Investing / Saving it all"],
    category: "hobby"
  }
];

export default function CreateQuiz({ currentUser, onSaveQuiz, onCancel }: CreateQuizProps) {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [welcomeMessage, setWelcomeMessage] = useState<string>("Let's see if you are my real best friend or just an imposter! No cheating! 👀");
  
  // Initialize with 10 templates as standard, or let user create custom ones
  const [questions, setQuestions] = useState<Omit<Question, "id">[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [settings, setSettings] = useState<QuizSettings>({
    timeLimit: 15,
    randomizeOrder: false,
    randomizeOptions: true,
    allowRetry: true,
    showCorrectAnswers: true,
    isPublic: true,
    theme: "gradient"
  });

  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load from local storage for autosave
  useEffect(() => {
    const saved = localStorage.getItem("friendquiz_draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || "");
        setWelcomeMessage(draft.welcomeMessage || "");
        setQuestions(draft.questions || []);
        setSettings(draft.settings || settings);
      } catch (e) {
        console.error("Autosave draft corrupt:", e);
      }
    } else {
      // Load standard templates
      const initialQs = TEMPLATE_QUESTIONS.map((q) => ({
        text: q.text,
        options: [...q.options],
        correctAnswerIndex: 0,
        category: q.category
      }));
      setQuestions(initialQs);
    }
  }, []);

  // Autosave when data changes
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem(
        "friendquiz_draft",
        JSON.stringify({ title, welcomeMessage, questions, settings })
      );
    }
  }, [title, welcomeMessage, questions, settings]);

  const handleApplyTemplates = () => {
    const initialQs = TEMPLATE_QUESTIONS.map((q) => ({
      text: q.text,
      options: [...q.options],
      correctAnswerIndex: 0,
      category: q.category
    }));
    setQuestions(initialQs);
    setActiveQuestionIndex(0);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 30) {
      setError("Maximum question count is 30!");
      return;
    }
    const newQ: Omit<Question, "id"> = {
      text: "New Custom Question?",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswerIndex: 0,
      category: "custom"
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
    setError("");
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 3) {
      setError("Your quiz must contain at least 3 questions!");
      return;
    }
    const filtered = questions.filter((_, i) => i !== idx);
    setQuestions(filtered);
    if (activeQuestionIndex >= filtered.length) {
      setActiveQuestionIndex(filtered.length - 1);
    }
    setError("");
  };

  const handleUpdateQuestionText = (val: string) => {
    const updated = [...questions];
    updated[activeQuestionIndex].text = val;
    setQuestions(updated);
  };

  const handleUpdateOptionText = (optIdx: number, val: string) => {
    const updated = [...questions];
    updated[activeQuestionIndex].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleSelectCorrectAnswer = (optIdx: number) => {
    const updated = [...questions];
    updated[activeQuestionIndex].correctAnswerIndex = optIdx;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please give your quiz a title!");
      setStep(1);
      return;
    }
    if (questions.length < 3) {
      setError("Please add at least 3 questions to your quiz!");
      setStep(2);
      return;
    }

    // Verify all questions have an option selected
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correctAnswerIndex === -1) {
        setError(`Please mark a correct answer for Question #${i + 1}`);
        setActiveQuestionIndex(i);
        setStep(2);
        return;
      }
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSaveQuiz({
        title: title.trim(),
        welcomeMessage: welcomeMessage.trim(),
        questions,
        settings
      });
      // Clear draft
      localStorage.removeItem("friendquiz_draft");
    } catch (e: any) {
      setError(e.message || "Failed to create quiz");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Cancel Draft
        </button>
        <div className="text-xs font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/30">
          Autosaved Draft
        </div>
      </div>

      {/* Progress Wizard */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-1/2 -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>

          {[
            { num: 1, label: "Creator Profile" },
            { num: 2, label: "Craft Questions" },
            { num: 3, label: "Quiz Settings" }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || (s.num === 2 && title) || s.num === 3) {
                  setStep(s.num);
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                  step >= s.num
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === s.num
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step Contents */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display">Let's set up your Quiz</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Introduce your quiz with a title and personalized welcome invite.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Quiz Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. How Well Do You Know Sarah?"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Welcome Invitation Message</label>
                  <textarea
                    rows={3}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="e.g. Real friends get 10/10! Take the challenge!"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    if (!title.trim()) {
                      setError("Quiz title is required!");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-2xl cursor-pointer"
                >
                  Continue to Questions <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Sidebar Info */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Smile className="w-6 h-6 text-pink-400" />
                  <span className="font-semibold text-pink-400 font-display">FriendQuiz Studio</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold font-display">Creating as:</h4>
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                    <span className="text-3xl">{currentUser?.avatar || "🦊"}</span>
                    <div>
                      <div className="font-bold">{currentUser?.nickname || "Anonymous"}</div>
                      <div className="text-xs text-purple-300 font-mono">Level {currentUser?.level || 1} Creator</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-purple-200/80 leading-relaxed">
                  Quizzes built while logged in earn you <strong>150 XP</strong> and <strong>30 coins</strong>. Your friends' submissions will also boost your stats on your dashboard!
                </p>
              </div>

              <div className="pt-6 text-xs text-purple-300 font-mono border-t border-white/10">
                10 questions pre-loaded for fast setup!
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Questions Navigator sidebar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                  Questions ({questions.length})
                </span>
                <button
                  onClick={handleApplyTemplates}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Reset to 10 template questions"
                >
                  <Sparkles className="w-3 h-3" /> Reset Templates
                </button>
              </div>

              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      idx === activeQuestionIndex
                        ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold"
                        : "bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <button
                      onClick={() => setActiveQuestionIndex(idx)}
                      className="flex-1 text-left text-sm truncate cursor-pointer"
                    >
                      {idx + 1}. {q.text}
                    </button>
                    {questions.length > 3 && (
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full py-3 bg-purple-50 dark:bg-purple-950/20 border border-dashed border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Custom Question
              </button>
            </div>

            {/* Question Editor */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-display">Editing Question {activeQuestionIndex + 1}</h4>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase">
                  Category: {questions[activeQuestionIndex]?.category}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Question Text</label>
                  <input
                    type="text"
                    value={questions[activeQuestionIndex]?.text || ""}
                    onChange={(e) => handleUpdateQuestionText(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Options & Correct Answer (Select the radio to mark the correct choice!)
                  </label>
                  {questions[activeQuestionIndex]?.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${
                        questions[activeQuestionIndex].correctAnswerIndex === optIdx
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/80"
                      }`}
                    >
                      <button
                        onClick={() => handleSelectCorrectAnswer(optIdx)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                          questions[activeQuestionIndex].correctAnswerIndex === optIdx
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-purple-400"
                        }`}
                      >
                        {questions[activeQuestionIndex].correctAnswerIndex === optIdx && (
                          <Check className="w-4 h-4 stroke-[3px]" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOptionText(optIdx, e.target.value)}
                        className="flex-1 bg-transparent border-none p-2 focus:outline-none focus:ring-0 text-sm font-semibold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-50 dark:border-slate-800/60">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Profile
                </button>

                <div className="flex gap-2">
                  {activeQuestionIndex > 0 && (
                    <button
                      onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer"
                    >
                      Previous Q
                    </button>
                  )}
                  {activeQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm cursor-pointer"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setError("");
                        setStep(3);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg text-white font-semibold px-6 py-3 rounded-2xl cursor-pointer"
                    >
                      Review Settings <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8"
          >
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500 animate-spin-slow" />
                Customize Quiz Rules & Settings
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Fine-tune the gaming experience for your friend group.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Left Column Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Question Timer</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Time limit per question (0 for off).</p>
                  </div>
                  <select
                    value={settings.timeLimit}
                    onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) })}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    <option value={0}>No Limit ♾️</option>
                    <option value={5}>5 seconds ⚡</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Randomize Question Order</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Shuffles questions for each friend.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, randomizeOrder: !settings.randomizeOrder })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${settings.randomizeOrder ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.randomizeOrder ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Randomize Options</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Shuffles answer choices randomly.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, randomizeOptions: !settings.randomizeOptions })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${settings.randomizeOptions ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.randomizeOptions ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>
              </div>

              {/* Right Column Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Allow Retry</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Can friends retake quiz to improve score?</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, allowRetry: !settings.allowRetry })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${settings.allowRetry ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.allowRetry ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Show Correct Answers</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reveal actual answers after completion.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, showCorrectAnswers: !settings.showCorrectAnswers })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${settings.showCorrectAnswers ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.showCorrectAnswers ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-100">Community Visibility</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Show on the Public Quizzes page.</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, isPublic: !settings.isPublic })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${settings.isPublic ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-800"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.isPublic ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual theme select */}
            <div className="space-y-4">
              <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quiz Styling Preset (Theme)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: "light", label: "Clean Slate", classes: "bg-white border-slate-200 text-slate-900" },
                  { id: "dark", label: "Cosmic Charcoal", classes: "bg-slate-900 border-slate-800 text-white" },
                  { id: "gradient", label: "Sunset Glow", classes: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
                  { id: "neon", label: "Cyber Neon", classes: "bg-slate-950 border-purple-500/50 text-emerald-400 font-mono" }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSettings({ ...settings, theme: th.id as any })}
                    className={`p-4 rounded-2xl border-2 text-center text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer ${th.classes} ${
                      settings.theme === th.id ? "ring-4 ring-purple-500/50 scale-[1.02]" : "opacity-80"
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Editor
              </button>

              <button
                id="btn-publish-quiz"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5 animate-pulse" />
                {isSubmitting ? "Publishing Quiz..." : "Publish & Generate Link!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
