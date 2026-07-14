import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Clock, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Check, 
  X,
  AlertTriangle,
  Flame
} from "lucide-react";
import { Quiz, Question } from "../types";

interface TakeQuizProps {
  quiz: Quiz;
  onSubmit: (friendName: string, answers: number[]) => Promise<void>;
  onCancel: () => void;
}

const AVATAR_OPTIONS = ["😎", "🦄", "👾", "🦊", "🦁", "🐼", "🐙", "👻", "🥑", "🍕", "🎮", "🎸"];

export default function TakeQuiz({ quiz, onSubmit, onCancel }: TakeQuizProps) {
  const [friendName, setFriendName] = useState<string>("");
  const [friendAvatar, setFriendAvatar] = useState<string>("😎");
  const [started, setStarted] = useState<boolean>(false);
  
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(quiz.settings.timeLimit);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Web Audio Synth for sound effects
  const playSound = (type: "correct" | "wrong" | "tick" | "start") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "start") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "tick") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  };

  // Shuffle Questions and options if requested on mount
  useEffect(() => {
    let qs = [...quiz.questions];
    if (quiz.settings.randomizeOrder) {
      qs.sort(() => Math.random() - 0.5);
    }
    setShuffledQuestions(qs);
  }, [quiz]);

  // Handle Question Countdown Timer
  useEffect(() => {
    if (started && quiz.settings.timeLimit > 0 && timerActive && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeExpired();
            return 0;
          }
          if (prev <= 5) playSound("tick");
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, currentQIndex, timerActive, isAnswered]);

  const handleStart = () => {
    if (!friendName.trim()) return;
    playSound("start");
    setStarted(true);
    setTimerActive(true);
    setTimeLeft(quiz.settings.timeLimit);
  };

  const handleTimeExpired = () => {
    setSelectedOption(-1); // means incorrect / no answer
    setIsAnswered(true);
    playSound("wrong");
    
    setTimeout(() => {
      proceedToNextQuestion(-1);
    }, 1500);
  };

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optIdx);
    setIsAnswered(true);
    
    const correctIdx = shuffledQuestions[currentQIndex].correctAnswerIndex;
    const isCorrect = optIdx === correctIdx;
    
    if (isCorrect) playSound("correct");
    else playSound("wrong");

    setTimeout(() => {
      proceedToNextQuestion(optIdx);
    }, 1800);
  };

  const proceedToNextQuestion = (chosenIdx: number) => {
    const updatedAnswers = [...answers, chosenIdx];
    setAnswers(updatedAnswers);

    if (currentQIndex < shuffledQuestions.length - 1) {
      // Next Question
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(quiz.settings.timeLimit);
    } else {
      // End Quiz - Submit
      setTimerActive(false);
      onSubmit(friendName.trim() + " " + friendAvatar, updatedAnswers);
    }
  };

  const currentQuestion = shuffledQuestions[currentQIndex];
  const percentageCompleted = Math.round(((currentQIndex + (isAnswered ? 1 : 0)) / shuffledQuestions.length) * 100);

  // Apply visual theme presets
  const getThemeClasses = () => {
    if (quiz.settings.theme === "dark") {
      return "bg-slate-900 text-white border-slate-800";
    }
    if (quiz.settings.theme === "gradient") {
      return "bg-gradient-to-br from-purple-600 via-pink-500 to-pink-600 text-white border-transparent";
    }
    if (quiz.settings.theme === "neon") {
      return "bg-slate-950 text-emerald-400 border-purple-500/40 font-mono shadow-[0_0_20px_rgba(168,85,247,0.15)]";
    }
    return "bg-white text-slate-900 border-slate-100";
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Onboarding Screen */}
      {!started ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-md space-y-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-50 to-blue-500"></div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              ← Leave Quiz
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 dark:text-slate-400 cursor-pointer"
              title={soundEnabled ? "Disable Sound FX" : "Enable Sound FX"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-3">
            <span className="text-4xl p-3 bg-purple-50 dark:bg-purple-950/20 rounded-2xl inline-block">
              {quiz.creatorAvatar || "🧙‍♂️"}
            </span>
            <h3 className="text-2xl font-bold font-display">{quiz.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto italic">
              "{quiz.welcomeMessage}"
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/60 text-left">
            <div>
              <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Your Nickname</label>
              <input
                type="text"
                maxLength={25}
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Enter nickname to play..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 font-semibold"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Choose Avatar Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setFriendAvatar(av)}
                    className={`text-2xl p-2 rounded-xl transition-all cursor-pointer ${
                      friendAvatar === av
                        ? "bg-purple-100 dark:bg-purple-950 ring-2 ring-purple-500 scale-110"
                        : "bg-slate-50 dark:bg-slate-950/30 hover:bg-slate-100"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            id="btn-start-taking-quiz"
            onClick={handleStart}
            disabled={!friendName.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Play className="w-5 h-5 fill-white" /> Start Quiz Challenge!
          </button>
        </motion.div>
      ) : (
        /* Quiz Gameplay Screen */
        <div className="space-y-6">
          {/* Progress & Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Question {currentQIndex + 1} of {shuffledQuestions.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Countdown Timer Badge */}
              {quiz.settings.timeLimit > 0 && (
                <div className={`flex items-center gap-1.5 font-mono font-bold px-3 py-1 rounded-full text-xs transition-colors ${
                  timeLeft <= 5 
                    ? "bg-rose-500 text-white pulse-purple" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageCompleted}%` }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
            />
          </div>

          {/* Core Question Card */}
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-8 shadow-sm space-y-8 flex flex-col justify-between ${getThemeClasses()}`}
              >
                <div className="space-y-4">
                  {currentQuestion.category && (
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider opacity-80 px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10">
                      Category: {currentQuestion.category}
                    </span>
                  )}
                  <h4 className="text-xl md:text-2xl font-bold font-display leading-snug">
                    {currentQuestion.text}
                  </h4>
                </div>

                {/* Options list */}
                <div className="space-y-3 pt-4">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = currentQuestion.correctAnswerIndex === optIdx;
                    
                    let optionStyle = "bg-white/10 dark:bg-black/10 border-white/20 hover:bg-white/15 cursor-pointer";
                    let iconNode = null;

                    if (quiz.settings.theme === "light") {
                      optionStyle = "bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100/70 cursor-pointer";
                    }

                    if (isAnswered) {
                      if (isSelected) {
                        if (isCorrect) {
                          optionStyle = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]";
                          iconNode = <Check className="w-5 h-5 stroke-[3px]" />;
                        } else {
                          optionStyle = "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/25 scale-[0.99]";
                          iconNode = <X className="w-5 h-5 stroke-[3px]" />;
                        }
                      } else if (isCorrect) {
                        // Highlight true correct answer anyway
                        optionStyle = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10";
                        iconNode = <Check className="w-5 h-5 stroke-[3px]" />;
                      } else {
                        optionStyle = "opacity-50 pointer-events-none scale-95";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between font-semibold text-sm md:text-base transition-all duration-200 ${optionStyle}`}
                      >
                        <span className="flex-1 line-clamp-2">{option}</span>
                        {iconNode}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mini Warning of Auto-Proceed */}
          {timeLeft <= 3 && timeLeft > 0 && !isAnswered && quiz.settings.timeLimit > 0 && (
            <div className="text-center text-xs font-semibold text-rose-500 flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> Hurrying up! Time is running out!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
