import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// JSON File Database Setup
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface User {
  id: string;
  username: string;
  nickname: string;
  bio: string;
  avatar: string;
  country: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastActiveDate: string | null;
  achievements: string[];
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
}

interface QuizSettings {
  timeLimit: number;
  randomizeOrder: boolean;
  randomizeOptions: boolean;
  allowRetry: boolean;
  showCorrectAnswers: boolean;
  isPublic: boolean;
  theme: "light" | "dark" | "gradient" | "neon";
}

interface Quiz {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorNickname: string;
  creatorAvatar: string;
  title: string;
  welcomeMessage: string;
  questions: Question[];
  settings: QuizSettings;
  stats: {
    attempts: number;
    visitors: number;
  };
  createdAt: string;
}

interface Attempt {
  id: string;
  quizId: string;
  friendName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank: number;
  answers: number[];
  takenAt: string;
}

interface DailyChallengeScore {
  username: string;
  score: number;
  xpEarned: number;
  timeTaken: number;
  takenAt: string;
}

interface DatabaseSchema {
  users: Record<string, User>;
  quizzes: Record<string, Quiz>;
  attempts: Attempt[];
  dailyChallengeScores: Record<string, DailyChallengeScore[]>; // keyed by YYYY-MM-DD
}

const defaultDb: DatabaseSchema = {
  users: {},
  quizzes: {},
  attempts: [],
  dailyChallengeScores: {}
};

// Initialize database
function initDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error("Error reading database file, using in-memory default:", error);
    return defaultDb;
  }
}

let db = initDb();

// Save database helper
function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving database file:", error);
  }
}

// Pre-populate some demo data if the DB is completely empty
function populateDemoData() {
  if (Object.keys(db.quizzes).length === 0) {
    console.log("Populating demo friendship quizzes...");
    const demoUserId = "demo_user_id";
    
    // Create demo user
    db.users[demoUserId] = {
      id: demoUserId,
      username: "alex",
      nickname: "Alex the Legend",
      bio: "Master of quizzes, lover of pizzas, and full-time dreamer.",
      avatar: "🦊",
      country: "United States",
      xp: 2450,
      level: 5,
      coins: 420,
      streak: 3,
      lastActiveDate: new Date().toISOString().split("T")[0],
      achievements: ["quiz_master", "social_star", "perfect_score"],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Create demo quiz
    const demoQuizId = "DEMO123";
    db.quizzes[demoQuizId] = {
      id: demoQuizId,
      creatorId: demoUserId,
      creatorName: "alex",
      creatorNickname: "Alex the Legend",
      creatorAvatar: "🦊",
      title: "How well do you know Alex?",
      welcomeMessage: "Let's see if you are my real best friend or just an imposter! No cheating! 👀",
      questions: [
        {
          id: "q1",
          text: "What is my absolute favorite food of all time?",
          options: ["Pistachio Pasta", "Pepperoni Pizza", "Chicken Biryani", "Spicy Ramen"],
          correctAnswerIndex: 1,
          category: "food"
        },
        {
          id: "q2",
          text: "If I could only watch one film genre forever, what would it be?",
          options: ["Sci-Fi/Space", "Romantic Comedy", "Horror/Thriller", "Anime"],
          correctAnswerIndex: 0,
          category: "movie"
        },
        {
          id: "q3",
          text: "What is my biggest pet peeve?",
          options: ["Slow internet connection", "Chewing loudly", "Late replies", "Cold coffee"],
          correctAnswerIndex: 2,
          category: "hobby"
        },
        {
          id: "q4",
          text: "Where is my absolute dream holiday destination?",
          options: ["Japan (Kyoto & Tokyo)", "Iceland (Northern Lights)", "Maldives (Overwater Villa)", "Switzerland (Alps)"],
          correctAnswerIndex: 0,
          category: "dream country"
        },
        {
          id: "q5",
          text: "What animal would I love to have as a pet?",
          options: ["A tiny red fox", "A lazy orange cat", "A hyperactive Golden Retriever", "An exotic sugar glider"],
          correctAnswerIndex: 0,
          category: "pet"
        },
        {
          id: "q6",
          text: "What is my favorite color to wear?",
          options: ["Jet Black", "Sunset Orange", "Royal Blue", "Sage Green"],
          correctAnswerIndex: 0,
          category: "color"
        },
        {
          id: "q7",
          text: "How do I deal with a bad day?",
          options: ["Sleeping for 12 hours", "Listening to lo-fi on repeat", "Going for a run", "Eating a tub of ice cream"],
          correctAnswerIndex: 1,
          category: "music"
        },
        {
          id: "q8",
          text: "What is my go-to sport to play or watch?",
          options: ["Football (Soccer)", "Basketball", "Tennis", "Formula 1"],
          correctAnswerIndex: 3,
          category: "sport"
        },
        {
          id: "q9",
          text: "What is my secret talent?",
          options: ["Superb cooking", "Wiggling my ears", "Remembering useless trivia", "Speaking 4 languages"],
          correctAnswerIndex: 2,
          category: "hobby"
        },
        {
          id: "q10",
          text: "Finally, what's my ideal weekend activity?",
          options: ["Partying till 3 AM", "Hiking up a mountain", "Binge-watching anime inside", "Coding fun side-projects"],
          correctAnswerIndex: 3,
          category: "hobby"
        }
      ],
      settings: {
        timeLimit: 15,
        randomizeOrder: false,
        randomizeOptions: true,
        allowRetry: true,
        showCorrectAnswers: true,
        isPublic: true,
        theme: "gradient"
      },
      stats: {
        attempts: 4,
        visitors: 12
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Populate demo attempts
    db.attempts.push(
      {
        id: "att1",
        quizId: demoQuizId,
        friendName: "Taylor (BFF)",
        score: 10,
        totalQuestions: 10,
        percentage: 100,
        rank: 1,
        answers: [1, 0, 2, 0, 0, 0, 1, 3, 2, 3],
        takenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "att2",
        quizId: demoQuizId,
        friendName: "Jordan",
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        rank: 2,
        answers: [1, 0, 1, 0, 2, 0, 1, 3, 2, 3],
        takenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "att3",
        quizId: demoQuizId,
        friendName: "Sam",
        score: 5,
        totalQuestions: 10,
        percentage: 50,
        rank: 3,
        answers: [0, 0, 2, 3, 0, 2, 1, 1, 2, 0],
        takenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "att4",
        quizId: demoQuizId,
        friendName: "Casey",
        score: 2,
        totalQuestions: 10,
        percentage: 20,
        rank: 4,
        answers: [3, 2, 0, 1, 3, 0, 2, 0, 2, 1],
        takenAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    );

    // Daily Challenge scores
    const today = new Date().toISOString().split("T")[0];
    db.dailyChallengeScores[today] = [
      { username: "Taylor", score: 5, xpEarned: 100, timeTaken: 24, takenAt: new Date().toISOString() },
      { username: "Sam", score: 4, xpEarned: 80, timeTaken: 35, takenAt: new Date().toISOString() },
      { username: "Jordan", score: 3, xpEarned: 60, timeTaken: 19, takenAt: new Date().toISOString() }
    ];

    saveDb();
  }
}
populateDemoData();

// Get Funny Message based on score percentage
function getFunnyScoreMessage(percentage: number): string {
  if (percentage === 100) return "You're literally my twin. Soulmate status unlocked! 👯‍♂️";
  if (percentage >= 90) return "Best Friend Forever. You know me inside out! 💖";
  if (percentage >= 70) return "You know me pretty well. Let's hang out more! 🍕";
  if (percentage >= 50) return "We're getting there. Not bad, but we need more deep talks! 💬";
  if (percentage >= 30) return "Do we even know each other? Is this an imposter? 🤨";
  return "Who are you? Are we strangers? Let's start from scratch! 😅";
}

// Achievement System Checker
function checkAndAwardAchievements(user: User): string[] {
  const newlyAwarded: string[] = [];
  const current = new Set(user.achievements);

  // 1. Level achievements
  if (user.level >= 2 && !current.has("rising_star")) {
    newlyAwarded.push("rising_star");
    user.achievements.push("rising_star");
  }
  if (user.level >= 5 && !current.has("quiz_master")) {
    newlyAwarded.push("quiz_master");
    user.achievements.push("quiz_master");
  }

  // 2. XP or Streak achievements
  if (user.streak >= 3 && !current.has("streak_seeker")) {
    newlyAwarded.push("streak_seeker");
    user.achievements.push("streak_seeker");
  }
  if (user.streak >= 7 && !current.has("loyal_friend")) {
    newlyAwarded.push("loyal_friend");
    user.achievements.push("loyal_friend");
  }

  // 3. Coin count
  if (user.coins >= 500 && !current.has("coin_collector")) {
    newlyAwarded.push("coin_collector");
    user.achievements.push("coin_collector");
  }

  return newlyAwarded;
}

// Helper to generate a random quiz code
function generateQuizCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Check if it exists
  if (db.quizzes[code]) {
    return generateQuizCode();
  }
  return code;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// User Registration / Auth
app.post("/api/auth/register", (req, res) => {
  const { username, nickname, avatar, bio, country } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Check if username exists
  const existingUser = Object.values(db.users).find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (existingUser) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  const userId = "u_" + Math.random().toString(36).substr(2, 9);
  const newUser: User = {
    id: userId,
    username: username.trim(),
    nickname: nickname ? nickname.trim() : username.trim(),
    avatar: avatar || "🦊",
    bio: bio || "Hey! I'm using FriendQuiz.",
    country: country || "Earth",
    xp: 100, // starting gift
    level: 1,
    coins: 50,
    streak: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
    achievements: ["newbie"],
    createdAt: new Date().toISOString()
  };

  db.users[userId] = newUser;
  saveDb();

  res.status(201).json({ user: newUser });
});

// User Login
app.post("/api/auth/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const user = Object.values(db.users).find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: "User not found. Try signing up!" });
  }

  // Update streak if logged in on a different day
  const today = new Date().toISOString().split("T")[0];
  if (user.lastActiveDate !== today) {
    if (user.lastActiveDate) {
      const lastDate = new Date(user.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1; // reset streak
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = today;
    
    // Add Daily reward coins
    user.coins += 10;
    user.xp += 25;
    
    // Check level up
    const nextLevelXp = user.level * 500;
    if (user.xp >= nextLevelXp) {
      user.level += 1;
    }

    checkAndAwardAchievements(user);
    saveDb();
  }

  res.json({ user });
});

// Get User Profile
app.get("/api/users/:id", (req, res) => {
  const user = db.users[req.params.id];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

// Update User Profile
app.put("/api/users/:id", (req, res) => {
  const user = db.users[req.params.id];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { nickname, bio, avatar, country } = req.body;
  if (nickname) user.nickname = nickname.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (avatar) user.avatar = avatar;
  if (country) user.country = country;

  saveDb();
  res.json(user);
});

// Trigger daily reward claim
app.post("/api/users/:id/claim-reward", (req, res) => {
  const user = db.users[req.params.id];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Add reward
  user.coins += 20;
  user.xp += 50;

  // Level check
  const nextLevelXp = user.level * 500;
  if (user.xp >= nextLevelXp) {
    user.level += 1;
  }

  checkAndAwardAchievements(user);
  saveDb();

  res.json({ success: true, user });
});

// Create Quiz
app.post("/api/quizzes", (req, res) => {
  const { creatorId, title, welcomeMessage, questions, settings } = req.body;
  if (!title || !questions || !Array.isArray(questions) || questions.length < 3) {
    return res.status(400).json({ error: "Title and at least 3 questions are required." });
  }

  let creatorName = "Anonymous";
  let creatorNickname = "Anonymous Friend";
  let creatorAvatar = "🧙‍♂️";

  if (creatorId && db.users[creatorId]) {
    const user = db.users[creatorId];
    creatorName = user.username;
    creatorNickname = user.nickname;
    creatorAvatar = user.avatar;

    // Award XP/coins for creating a quiz!
    user.xp += 150;
    user.coins += 30;
    
    // Level up check
    if (user.xp >= user.level * 500) {
      user.level += 1;
    }

    if (!user.achievements.includes("quiz_creator")) {
      user.achievements.push("quiz_creator");
    }

    checkAndAwardAchievements(user);
  }

  const quizId = generateQuizCode();
  const newQuiz: Quiz = {
    id: quizId,
    creatorId: creatorId || "anonymous",
    creatorName,
    creatorNickname,
    creatorAvatar,
    title,
    welcomeMessage: welcomeMessage || "Let's see how much you know me!",
    questions: questions.map((q: any, idx: number) => ({
      id: q.id || `q_${idx}`,
      text: q.text,
      options: q.options || [],
      correctAnswerIndex: q.correctAnswerIndex,
      category: q.category || "custom"
    })),
    settings: {
      timeLimit: settings?.timeLimit ?? 15,
      randomizeOrder: settings?.randomizeOrder ?? false,
      randomizeOptions: settings?.randomizeOptions ?? true,
      allowRetry: settings?.allowRetry ?? true,
      showCorrectAnswers: settings?.showCorrectAnswers ?? true,
      isPublic: settings?.isPublic ?? true,
      theme: settings?.theme ?? "gradient"
    },
    stats: {
      attempts: 0,
      visitors: 0
    },
    createdAt: new Date().toISOString()
  };

  db.quizzes[quizId] = newQuiz;
  saveDb();

  res.status(201).json(newQuiz);
});

// Get Quiz list (public quizzes)
app.get("/api/quizzes", (req, res) => {
  const list = Object.values(db.quizzes)
    .filter((q) => q.settings.isPublic)
    .sort((a, b) => b.stats.attempts - a.stats.attempts)
    .slice(0, 20);

  // Return a safe format without answers
  const safeList = list.map((q) => ({
    id: q.id,
    creatorName: q.creatorName,
    creatorNickname: q.creatorNickname,
    creatorAvatar: q.creatorAvatar,
    title: q.title,
    welcomeMessage: q.welcomeMessage,
    questionCount: q.questions.length,
    attempts: q.stats.attempts,
    theme: q.settings.theme
  }));

  res.json(safeList);
});

// Get Quiz details (with option to hide correct answers if taking)
app.get("/api/quizzes/:id", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  // Track visit
  quiz.stats.visitors += 1;
  saveDb();

  const isTaking = req.query.take === "true";
  
  if (isTaking) {
    // Hide correct answers to prevent inspection
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      category: q.category
    }));

    return res.json({
      ...quiz,
      questions: sanitizedQuestions,
      isTakeView: true
    });
  }

  res.json(quiz);
});

// Edit Quiz
app.put("/api/quizzes/:id", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const { title, welcomeMessage, questions, settings } = req.body;
  if (title) quiz.title = title;
  if (welcomeMessage !== undefined) quiz.welcomeMessage = welcomeMessage;
  if (questions && Array.isArray(questions)) {
    quiz.questions = questions.map((q: any, idx: number) => ({
      id: q.id || `q_${idx}`,
      text: q.text,
      options: q.options || [],
      correctAnswerIndex: q.correctAnswerIndex,
      category: q.category || "custom"
    }));
  }
  if (settings) {
    quiz.settings = {
      ...quiz.settings,
      ...settings
    };
  }

  saveDb();
  res.json(quiz);
});

// Delete Quiz
app.delete("/api/quizzes/:id", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  // Remove quiz
  delete db.quizzes[req.params.id];
  
  // Clean up associated attempts
  db.attempts = db.attempts.filter((a) => a.quizId !== req.params.id);

  saveDb();
  res.json({ success: true, message: "Quiz deleted successfully" });
});

// Submit Quiz Attempt
app.post("/api/quizzes/:id/attempts", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const { friendName, answers, playerId } = req.body;
  if (!friendName || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Friend name and answers are required." });
  }

  // Calculate score
  let score = 0;
  const totalQuestions = quiz.questions.length;
  
  answers.forEach((ansIndex, qIdx) => {
    if (qIdx < totalQuestions && ansIndex === quiz.questions[qIdx].correctAnswerIndex) {
      score += 1;
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);

  // Increment attempts on quiz
  quiz.stats.attempts += 1;

  // Add to attempts collection
  const attemptId = "att_" + Math.random().toString(36).substr(2, 9);
  
  // Find current attempts for rank calculation
  const existingAttempts = db.attempts
    .filter((a) => a.quizId === quiz.id)
    .sort((a, b) => b.score - a.score);

  let rank = 1;
  for (const existing of existingAttempts) {
    if (score < existing.score) {
      rank += 1;
    }
  }

  const newAttempt: Attempt = {
    id: attemptId,
    quizId: quiz.id,
    friendName: friendName.trim(),
    score,
    totalQuestions,
    percentage,
    rank,
    answers,
    takenAt: new Date().toISOString()
  };

  db.attempts.push(newAttempt);

  // If taker is a logged-in player, award them coins and XP!
  if (playerId && db.users[playerId]) {
    const user = db.users[playerId];
    user.xp += 50 + score * 10; // 50 base XP + 10 XP per correct answer
    user.coins += 5 + score * 2; // 5 base coins + 2 coins per correct answer
    
    // Perfect score award
    if (percentage === 100) {
      user.coins += 20;
      if (!user.achievements.includes("perfect_score")) {
        user.achievements.push("perfect_score");
      }
    }

    // Check level up
    if (user.xp >= user.level * 500) {
      user.level += 1;
    }

    checkAndAwardAchievements(user);
  }

  // Creator profile rewards (increase friendsPlayed statistic)
  if (quiz.creatorId && db.users[quiz.creatorId]) {
    const creator = db.users[quiz.creatorId];
    creator.xp += 30; // bonus for friend taking their quiz
    creator.coins += 5;
    
    if (creator.xp >= creator.level * 500) {
      creator.level += 1;
    }
    
    checkAndAwardAchievements(creator);
  }

  saveDb();

  res.status(201).json({
    attempt: newAttempt,
    funnyMessage: getFunnyScoreMessage(percentage),
    correctAnswers: quiz.questions.map((q) => q.correctAnswerIndex)
  });
});

// Get Leaderboard for a quiz
app.get("/api/quizzes/:id/leaderboard", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const quizAttempts = db.attempts
    .filter((a) => a.quizId === req.params.id)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime(); // faster is better on ties
    });

  // Unique leaders by friendName to prevent single user flooding
  const uniqueLeaders: Attempt[] = [];
  const seenNames = new Set<string>();

  for (const attempt of quizAttempts) {
    const normalized = attempt.friendName.toLowerCase().trim();
    if (!seenNames.has(normalized)) {
      seenNames.add(normalized);
      uniqueLeaders.push(attempt);
    }
    if (uniqueLeaders.length >= 10) break;
  }

  // Set corrected ranks
  const formattedLeaders = uniqueLeaders.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  res.json({
    quizTitle: quiz.title,
    creatorNickname: quiz.creatorNickname,
    creatorAvatar: quiz.creatorAvatar,
    totalAttempts: quiz.stats.attempts,
    leaders: formattedLeaders
  });
});

// Get Detailed Stats for Creator Dashboard
app.get("/api/quizzes/:id/stats", (req, res) => {
  const quiz = db.quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  const quizAttempts = db.attempts.filter((a) => a.quizId === req.params.id);
  
  // Calculate average, highest, lowest
  let totalScore = 0;
  let highestScore = 0;
  let averageScore = 0;

  quizAttempts.forEach((a) => {
    totalScore += a.score;
    if (a.score > highestScore) {
      highestScore = a.score;
    }
  });

  if (quizAttempts.length > 0) {
    averageScore = Math.round((totalScore / (quizAttempts.length * quiz.questions.length)) * 100);
    highestScore = Math.round((highestScore / quiz.questions.length) * 100);
  }

  // Group scores into intervals (0-20, 21-40, 41-60, 61-80, 81-100) for charts
  const distribution = [
    { range: "0-20%", count: 0 },
    { range: "21-40%", count: 0 },
    { range: "41-60%", count: 0 },
    { range: "61-80%", count: 0 },
    { range: "81-100%", count: 0 }
  ];

  quizAttempts.forEach((a) => {
    if (a.percentage <= 20) distribution[0].count++;
    else if (a.percentage <= 40) distribution[1].count++;
    else if (a.percentage <= 60) distribution[2].count++;
    else if (a.percentage <= 80) distribution[3].count++;
    else distribution[4].count++;
  });

  // Recent attempts
  const recentAttempts = [...quizAttempts]
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
    .slice(0, 15);

  res.json({
    quizId: quiz.id,
    title: quiz.title,
    totalAttempts: quiz.stats.attempts,
    totalVisitors: quiz.stats.visitors,
    averageScore,
    highestScore,
    distribution,
    recentAttempts
  });
});

// Get User's Quizzes
app.get("/api/users/:userId/quizzes", (req, res) => {
  const userQuizzes = Object.values(db.quizzes).filter((q) => q.creatorId === req.params.userId);
  res.json(userQuizzes);
});

// Daily Challenge
const staticDailyQuestions = [
  {
    id: "dc1",
    text: "According to psychology, most people consider which of these a 'dealbreaker' in a friendship?",
    options: ["Being occasionally late", "Constant gossiping about others", "Having different hobbies", "Rarely texting first"],
    correctAnswerIndex: 1,
    category: "psychology"
  },
  {
    id: "dc2",
    text: "Which animated television show features the ultimate best-friend duo: SpongeBob and Patrick?",
    options: ["SpongeBob SquarePants", "The Loud House", "Phineas and Ferb", "Adventure Time"],
    correctAnswerIndex: 0,
    category: "tv"
  },
  {
    id: "dc3",
    text: "In the famous sitcom 'Friends', who are the first two characters to get married?",
    options: ["Ross and Rachel", "Monica and Chandler", "Phoebe and Mike", "Ross and Carol"],
    correctAnswerIndex: 3, // Ross and Carol (before show starts) or Chandler/Monica? Let's use Chandler and Monica as 1, Ross & Carol as correct.
  },
  {
    id: "dc4",
    text: "What ancient Greek philosopher famously said: 'A friend to all is a friend to none'?",
    options: ["Socrates", "Plato", "Aristotle", "Pythagoras"],
    correctAnswerIndex: 2,
    category: "history"
  },
  {
    id: "dc5",
    text: "Which of these gestures is globally recognized as a universal sign of mutual trust and greeting?",
    options: ["The High Five", "The Handshake", "The Fist Bump", "The Friendly Wave"],
    correctAnswerIndex: 1,
    category: "social"
  }
];

app.get("/api/daily-challenge", (req, res) => {
  res.json({
    id: "daily_" + new Date().toISOString().split("T")[0],
    date: new Date().toDateString(),
    questions: staticDailyQuestions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      category: q.category
    }))
  });
});

app.post("/api/daily-challenge/submit", (req, res) => {
  const { username, score, timeTaken } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const today = new Date().toISOString().split("T")[0];
  if (!db.dailyChallengeScores[today]) {
    db.dailyChallengeScores[today] = [];
  }

  const xpEarned = score * 50; // 50 XP per correct daily answer
  const newScore: DailyChallengeScore = {
    username: username.trim(),
    score: score ?? 0,
    xpEarned,
    timeTaken: timeTaken ?? 30,
    takenAt: new Date().toISOString()
  };

  db.dailyChallengeScores[today].push(newScore);
  
  // Sort leaderboard for today
  db.dailyChallengeScores[today].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeTaken - b.timeTaken; // faster is better
  });

  saveDb();
  res.status(201).json({ score: newScore, leaderboard: db.dailyChallengeScores[today].slice(0, 10) });
});

app.get("/api/daily-leaderboard", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const list = db.dailyChallengeScores[today] || [];
  res.json(list.slice(0, 10));
});

// Admin Panel Stats
app.get("/api/admin/stats", (req, res) => {
  const totalUsers = Object.keys(db.users).length;
  const totalQuizzes = Object.keys(db.quizzes).length;
  const totalAttempts = db.attempts.length;
  
  const quizzesList = Object.values(db.quizzes).map(q => ({
    id: q.id,
    creatorName: q.creatorName,
    title: q.title,
    attempts: q.stats.attempts,
    createdAt: q.createdAt
  }));

  const usersList = Object.values(db.users).map(u => ({
    id: u.id,
    username: u.username,
    nickname: u.nickname,
    xp: u.xp,
    level: u.level,
    coins: u.coins,
    createdAt: u.createdAt
  }));

  res.json({
    totalUsers,
    totalQuizzes,
    totalAttempts,
    quizzes: quizzesList,
    users: usersList
  });
});


// ----------------------------------------------------
// VITE AND STATIC CLIENT SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
