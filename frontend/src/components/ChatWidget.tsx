"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { askQuestion, type AskResponse } from "@/lib/api";
import { Message, type ChatMessageData } from "./ai/message";
export type { ChatMessageData as Message };
import { PromptInput } from "./ai/prompt-input";
import { EmptyState } from "./ai/empty-state";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface Thread {
  id: string;
  title: string;
  messages: ChatMessageData[];
  createdAt: string;
}

const SESSION_CACHE_KEY = "ask_olake_session_v3";

export function ChatWidget() {
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread-default",
      title: "New Chat",
      messages: [],
      createdAt: "Just now",
    },
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>("thread-default");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore session data from browser sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.threads) && parsed.threads.length > 0) {
            setThreads(parsed.threads);
            if (parsed.activeThreadId) {
              setActiveThreadId(parsed.activeThreadId);
            }
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsHydrated(true);
      }
    }
  }, []);

  // Save active session data to browser sessionStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          SESSION_CACHE_KEY,
          JSON.stringify({ threads, activeThreadId })
        );
      } catch {
        // Fallback
      }
    }
  }, [threads, activeThreadId, isHydrated]);

  // Active thread and messages
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const messages = activeThread?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Start new chat thread
  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    const newId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  }, [isLoading]);

  // Delete thread
  const handleDeleteThread = useCallback(
    (e: React.MouseEvent, threadId: string) => {
      e.stopPropagation();
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== threadId);
        if (filtered.length === 0) {
          const freshId = `thread-${Date.now()}`;
          setActiveThreadId(freshId);
          return [
            {
              id: freshId,
              title: "New Chat",
              messages: [],
              createdAt: "Just now",
            },
          ];
        }
        if (activeThreadId === threadId) {
          setActiveThreadId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeThreadId]
  );

  // Clear all session threads
  const handleClearAll = useCallback(() => {
    if (isLoading) return;
    const freshId = `thread-${Date.now()}`;
    setThreads([
      {
        id: freshId,
        title: "New Chat",
        messages: [],
        createdAt: "Just now",
      },
    ]);
    setActiveThreadId(freshId);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
      } catch {}
    }
  }, [isLoading]);

  // Send question in active thread
  const handleSend = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isLoading) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const userMsg: ChatMessageData = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: timeStr,
      };

      const loadingMsg: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        isLoading: true,
        timestamp: timeStr,
      };

      // Set title on first message in thread
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          const currentTitle =
            t.title === "New Chat"
              ? trimmed.length > 34
                ? trimmed.slice(0, 34) + "..."
                : trimmed
              : t.title;
          return {
            ...t,
            title: currentTitle,
            messages: [...t.messages, userMsg, loadingMsg],
          };
        })
      );

      setIsLoading(true);

      try {
        const response: AskResponse = await askQuestion(trimmed);
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== activeThreadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === loadingMsg.id
                  ? {
                      ...m,
                      content: response.answer,
                      sources: response.sources,
                      isLoading: false,
                    }
                  : m
              ),
            };
          })
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while communicating with Ask OLake.";
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== activeThreadId) return t;
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === loadingMsg.id
                  ? {
                      ...m,
                      content: errorMessage,
                      isLoading: false,
                      isError: true,
                    }
                  : m
              ),
            };
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeThreadId]
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      const userMsgIndex = messages.findIndex(
        (m, i) => m.role === "user" && messages[i + 1]?.id === messageId
      );
      if (userMsgIndex >= 0) {
        const question = messages[userMsgIndex].content;
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== activeThreadId) return t;
            return {
              ...t,
              messages: t.messages.filter((m) => m.id !== messageId),
            };
          })
        );
        handleSend(question);
      }
    },
    [messages, activeThreadId, handleSend]
  );

  // Check URL query param ?q= on initial load to auto-submit prompt from landing page
  useEffect(() => {
    if (typeof window !== "undefined" && isHydrated) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && q.trim()) {
        window.history.replaceState({}, "", window.location.pathname);
        setTimeout(() => {
          handleSend(q.trim());
        }, 200);
      }
    }
  }, [isHydrated, handleSend]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-text">
      {/* Full-Height Left Sidebar: Session Cache History */}
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-border/70 bg-slate-50/90 dark:bg-[#0c1117] transition-all duration-300 ease-in-out shrink-0 select-none z-30",
          isSidebarOpen ? "w-64 sm:w-72" : "w-0 -mr-[1px] opacity-0 pointer-events-none"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-border/70">
          <div className="flex items-center gap-2">
            <img src="/olake-logo.svg" alt="OLake" className="h-4 w-4 object-contain" />
            <span className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Chats
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer transition-transform active:scale-95"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-border/60">
          <Button
            variant="default"
            size="sm"
            onClick={handleNewChat}
            className="w-full gap-2 h-9 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-100/70 text-blue-900 font-semibold dark:bg-blue-950/70 dark:text-blue-200 border border-blue-300/50 dark:border-blue-800/60 shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{thread.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {threads.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity cursor-pointer"
                      title="Delete chat thread"
                      aria-label="Delete chat thread"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar Note & Reset Session */}
        <div className="p-3 border-t border-border/70 space-y-1.5 text-[11px] text-muted-foreground bg-card/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">
              Session Cache
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-tight">
            Persisted in browser tab cache. Purged on tab close.
          </p>
        </div>
      </aside>

      {/* Main Full-Screen Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        {/* Clean Header Bar (No green bubbles / AI gibberish) */}
        <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 sm:px-6 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer transition-transform active:scale-95"
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-label="Toggle history sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            {/* Official Logo & Brand */}
            <div className="flex items-center gap-2.5">
              <img src="/olake-logo.svg" alt="OLake" className="h-6 w-6 object-contain" />
              <div>
                <h1 className="text-sm font-bold tracking-tight text-foreground">
                  Ask OLake
                </h1>
              </div>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
              title="Return to Landing Page Overview"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Overview</span>
            </a>

            <a
              href="https://olake.io/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Docs</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>

            <a
              href="https://github.com/datazip-inc/olake"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="h-8 gap-1.5 px-2.5 text-xs border-border/80 hover:bg-accent cursor-pointer transition-transform active:scale-95"
              title="Start a new chat thread"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </Button>
          </div>
        </header>

        {/* Message Scroll Area (Centered column like ChatGPT / Claude) */}
        <div
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 min-h-0"
          id="chat-messages"
        >
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {messages.length === 0 ? (
              <EmptyState onSelectPrompt={handleSend} />
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                  onRetry={msg.isError ? () => handleRetry(msg.id) : undefined}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Pinned Composer */}
        <div className="p-3 sm:p-4 border-t border-border/70 bg-background/95 backdrop-blur-md shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            <PromptInput onSubmit={handleSend} isLoading={isLoading} />
            <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
              Grounded on official OLake documentation & repositories.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
