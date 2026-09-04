export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "admin";
};

export type Grade = {
  id: number;
  name: string;
};

export type Subject = {
  id: number;
  grade_id: number;
  name: string;
  grade?: Grade;
};

export type Topic = {
  id: number;
  subject_id: number;
  name: string;
};

export type Subtopic = {
  id: number;
  topic_id: number;
  name: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type StudentProfile = {
  id: number;
  user_id: number;
  grade: Grade;
  selected_subjects: Subject[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail ?? "Request failed");
  }

  return data as T;
}

export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}
