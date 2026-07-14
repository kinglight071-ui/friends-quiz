export interface User {
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

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
}

export interface QuizSettings {
  timeLimit: number;
  randomizeOrder: boolean;
  randomizeOptions: boolean;
  allowRetry: boolean;
  showCorrectAnswers: boolean;
  isPublic: boolean;
  theme: "light" | "dark" | "gradient" | "neon";
}

export interface Quiz {
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

export interface Attempt {
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

export interface LeaderboardResponse {
  quizTitle: string;
  creatorNickname: string;
  creatorAvatar: string;
  totalAttempts: number;
  leaders: Attempt[];
}

export interface QuizStatsResponse {
  quizId: string;
  title: string;
  totalAttempts: number;
  totalVisitors: number;
  averageScore: number;
  highestScore: number;
  distribution: { range: string; count: number }[];
  recentAttempts: Attempt[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  questions: Omit<Question, "correctAnswerIndex">[];
}

export interface DailyChallengeScore {
  username: string;
  score: number;
  xpEarned: number;
  timeTaken: number;
  takenAt: string;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
  quizzes: {
    id: string;
    creatorName: string;
    title: string;
    attempts: number;
    createdAt: string;
  }[];
  users: {
    id: string;
    username: string;
    nickname: string;
    xp: string;
    level: string;
    coins: string;
    createdAt: string;
  }[];
}
