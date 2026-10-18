/** Ask OLake API client with Vercel service binding support */

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side execution (Next.js route handlers, server actions, SSR)
    // Uses Vercel service binding variable BACKEND_URL, or local fallback
    return process.env.BACKEND_URL || "http://127.0.0.1:8000";
  }
  // Client-side browser execution:
  // In Vercel services mode, relative paths ("/ask", "/health") route via top-level rewrites
  // If NEXT_PUBLIC_API_URL is explicitly set (e.g. cross-domain dev), use it
  return process.env.NEXT_PUBLIC_API_URL || "";
}

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
  const base = getBaseUrl();
  const url = base ? `${base.replace(/\/+$/, "")}/ask` : "/ask";

  const response = await fetch(url, {
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
  const base = getBaseUrl();
  const url = base ? `${base.replace(/\/+$/, "")}/health` : "/health";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("API is unavailable");
  }
  return response.json();
}
