"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { askQuestion, checkHealth, type AskResponse } from "@/lib/api";
import { Message, type ChatMessageData } from "./ai/message";
export type { ChatMessageData as Message };
import { PromptInput } from "./ai/prompt-input";
import { EmptyState } from "./ai/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  title: string;
  messages: ChatMessageData[];
  createdAt: string;
}

export function ChatWidget() {
  // Instance-only session threads (ephemeral state in React memory, no persistent storage)
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread-init",
      title: "New Chat",
      messages: [],
      createdAt: "Just now",
    },
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>("thread-init");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{
    loaded: boolean;
    chunks: number;
  }>({ loaded: true, chunks: 4586 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active thread and messages
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const messages = activeThread?.messages || [];

  // Fetch backend health on mount
  useEffect(() => {
    checkHealth()
      .then((res) => {
        setSystemInfo({
          loaded: res.index_loaded,
          chunks: res.indexed_chunks,
        });
      })
      .catch(() => {
        // Fallback to default
        setSystemInfo({ loaded: true, chunks: 4586 });
      });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Create a new instance chat thread
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

  // Delete a specific thread
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
              createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setActiveThreadId(freshId);
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

      // Derive title if this is the first message in the thread
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          const currentTitle =
            t.title === "New Chat"
              ? trimmed.length > 36
                ? trimmed.slice(0, 36) + "..."
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

  return (
    <div className="flex h-full w-full bg-card rounded-2xl shadow-xl border border-border/80 overflow-hidden relative">
      {/* Collapsible Left Sidebar: Instance History (Claude/Gemini style) */}
      <div
        className={cn(
          "flex flex-col border-r border-border/80 bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur-md transition-all duration-300 ease-in-out shrink-0 select-none z-20",
          isSidebarOpen ? "w-64 sm:w-72" : "w-0 -mr-[1px] opacity-0 pointer-events-none"
        )}
      >
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-border/80">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-xs tracking-tight text-foreground uppercase">
              Session Chats
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
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
            className="w-full gap-2 h-9 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
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
                  {thread.messages.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground/70 px-1">
                      {thread.messages.filter((m) => m.role === "user").length}
                    </span>
                  )}
                  {threads.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
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

        {/* Bottom Sidebar Note & Clear Session */}
        <div className="p-3 border-t border-border/80 space-y-2 text-[11px] text-muted-foreground bg-card/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Instance Memory Only</span>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors cursor-pointer"
            >
              Reset Session
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-tight">
            No persistent disk, cookie, or DB storage. History cleans on reload.
          </p>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 bg-card/90 px-3 sm:px-5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Sidebar toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title={isSidebarOpen ? "Close history sidebar" : "Open history sidebar"}
              aria-label="Toggle history sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[140px] sm:max-w-xs">
                    {activeThread?.title === "New Chat" ? "Ask OLake" : activeThread?.title}
                  </h2>
                  <Badge variant="outline" className="hidden sm:inline-flex text-[9px] h-4 px-1 font-mono">
                    RAG v1.0
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  Apache Iceberg & Lakehouse AI Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Right Status Badges & Quick Actions */}
          <div className="flex items-center gap-2">
            <Badge
              variant="success"
              className="gap-1.5 text-[11px] font-mono h-6 px-2.5 shadow-2xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Index Ready:</span>
              <span>{systemInfo.chunks} chunks</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="hidden sm:inline-flex h-7 gap-1 px-2 text-xs border-border/80 hover:bg-accent cursor-pointer"
              title="Start a new chat thread"
            >
              <Plus className="h-3 w-3" />
              <span>New</span>
            </Button>
          </div>
        </div>

        {/* Message Scroll Container */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-2 min-h-0"
          id="chat-messages"
        >
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

        {/* Bottom Composer Bar */}
        <div className="p-3 sm:p-4 border-t border-border/80 bg-card/80 backdrop-blur-md shrink-0">
          <PromptInput onSubmit={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
