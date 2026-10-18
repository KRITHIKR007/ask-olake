/** Ask OLake API client */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AskResponse {
  answer: string;
  sources: string[];
}

export interface AskError {
  error: string;
  detail?: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  index_loaded: boolean;
  indexed_chunks: number;
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status}`,
      detail: response.statusText,
    }));
    throw new Error(errorData.detail || errorData.error || "Failed to get answer");
  }

  return response.json();
}

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("API is unavailable");
  }
  return response.json();
}
