import {
  DashboardData,
  MyErrorsGroup,
  Question,
  RankingItem,
  SimulationResult,
  User,
} from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

type ApiMessage = {
  message?: string;
};

function getToken() {
  return localStorage.getItem("copa-ga-token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiMessage;

  if (!response.ok) {
    throw new Error(data.message ?? "Erro ao comunicar com o servidor");
  }

  return data;
}

export const api = {
  login(username: string, password: string) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  dashboard() {
    return request<DashboardData>("/dashboard/me");
  },
  themes() {
    return request<{ themes: string[]; message?: string }>("/questions/themes");
  },
  questions(theme?: string) {
    const params = theme ? `?theme=${encodeURIComponent(theme)}` : "";
    return request<{ questions: Question[]; message?: string }>(`/questions${params}`);
  },
  randomQuestions(theme: string, limit = 10) {
    return request<{ questions: Question[]; message?: string }>(
      `/questions/random?theme=${encodeURIComponent(theme)}&limit=${limit}`,
    );
  },
  simulationQuestions() {
    return request<{ questions: Question[]; message?: string }>("/questions/simulation");
  },
  answer(payload: {
    questionId: number;
    selectedAlternativeId: number;
    responseTimeMs: number;
  }) {
    return request<{
      isCorrect: boolean;
      correctAlternative: { id: number; text: string } | null;
      explanation: string;
    }>("/answers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  checkAnswer(payload: { questionId: number; selectedAlternativeId: number }) {
    return request<{
      isCorrect: boolean;
      correctAlternative: { id: number; text: string } | null;
      explanation: string;
    }>("/answers/check", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  myErrors() {
    return request<{ groups: MyErrorsGroup[]; message?: string }>("/answers/my-errors");
  },
  finishSimulation(payload: {
    totalTimeMs: number;
    answers: Array<{
      questionId: number;
      selectedAlternativeId: number;
      responseTimeMs: number;
    }>;
  }) {
    return request<{ result: SimulationResult }>("/simulations/finish", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  ranking() {
    return request<{ ranking: RankingItem[]; message?: string }>("/simulations/ranking");
  },
};
