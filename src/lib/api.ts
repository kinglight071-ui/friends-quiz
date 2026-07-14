import { 
  User, 
  Quiz, 
  Attempt, 
  LeaderboardResponse, 
  QuizStatsResponse, 
  DailyChallenge, 
  DailyChallengeScore,
  AdminStatsResponse 
} from "../types";

const API_BASE = "/api";

export const api = {
  // Auth
  async register(username: string, nickname?: string, avatar?: string, bio?: string, country?: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, nickname, avatar, bio, country }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to register");
    }
    return res.json();
  },

  async login(username: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to login");
    }
    return res.json();
  },

  // Users
  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error("Failed to get user");
    return res.json();
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },

  async claimDailyReward(id: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/users/${id}/claim-reward`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to claim reward");
    return res.json();
  },

  // Quizzes
  async createQuiz(data: {
    creatorId?: string;
    title: string;
    welcomeMessage: string;
    questions: Omit<Quiz["questions"][number], "id">[];
    settings: Quiz["settings"];
  }): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create quiz");
    }
    return res.json();
  },

  async getPublicQuizzes(): Promise<Omit<Quiz, "questions">[]> {
    const res = await fetch(`${API_BASE}/quizzes`);
    if (!res.ok) throw new Error("Failed to fetch public quizzes");
    return res.json();
  },

  async getQuiz(id: string, take = false): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/${id}?take=${take}`);
    if (!res.ok) throw new Error("Quiz not found");
    return res.json();
  },

  async editQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update quiz");
    return res.json();
  },

  async deleteQuiz(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete quiz");
    return res.json();
  },

  async submitAttempt(id: string, data: { friendName: string; answers: number[]; playerId?: string }): Promise<{
    attempt: Attempt;
    funnyMessage: string;
    correctAnswers: number[];
  }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit attempt");
    }
    return res.json();
  },

  async getLeaderboard(id: string): Promise<LeaderboardResponse> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/leaderboard`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json();
  },

  async getStats(id: string): Promise<QuizStatsResponse> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    const res = await fetch(`${API_BASE}/users/${userId}/quizzes`);
    if (!res.ok) throw new Error("Failed to fetch user quizzes");
    return res.json();
  },

  // Daily Challenge
  async getDailyChallenge(): Promise<DailyChallenge> {
    const res = await fetch(`${API_BASE}/daily-challenge`);
    if (!res.ok) throw new Error("Failed to fetch daily challenge");
    return res.json();
  },

  async submitDailyChallenge(data: { username: string; score: number; timeTaken: number }): Promise<{
    score: DailyChallengeScore;
    leaderboard: DailyChallengeScore[];
  }> {
    const res = await fetch(`${API_BASE}/daily-challenge/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit daily challenge score");
    return res.json();
  },

  async getDailyLeaderboard(): Promise<DailyChallengeScore[]> {
    const res = await fetch(`${API_BASE}/daily-leaderboard`);
    if (!res.ok) throw new Error("Failed to fetch daily leaderboard");
    return res.json();
  },

  // Admin Panel
  async getAdminStats(): Promise<AdminStatsResponse> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
  }
};
