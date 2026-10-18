"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { askQuestion, checkHealth, type AskResponse } from "@/lib/api";
import { Message, type ChatMessageData } from "./ai/message";
export type { ChatMessageData as Message };
import { PromptInput } from "./ai/prompt-input";
import { EmptyState } from "./ai/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Waves, Sparkles, CheckCircle2 } from "lucide-react";

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{
    loaded: boolean;
    chunks: number;
  }>({ loaded: true, chunks: 4586 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkHealth()
      .then((res) => {
        setSystemInfo({
          loaded: res.index_loaded,
          chunks: res.indexed_chunks,
        });
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        const response: AskResponse = await askQuestion(trimmed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? {
                  ...m,
                  content: response.answer,
                  sources: response.sources,
                  isLoading: false,
                }
              : m
          )
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while communicating with Ask OLake.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? {
                  ...m,
                  content: errorMessage,
                  isLoading: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      const userMsgIndex = messages.findIndex(
        (m, i) => m.role === "user" && messages[i + 1]?.id === messageId
      );
      if (userMsgIndex >= 0) {
        const question = messages[userMsgIndex].content;
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        handleSend(question);
      }
    },
    [messages, handleSend]
  );

  const handleClear = () => {
    if (isLoading) return;
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Waves className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Ask OLake
              </h2>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] h-4.5 px-1.5 font-mono">
                RAG v1.0
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              AI Technical Documentation Assistant
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2.5">
          <Badge
            variant="success"
            className="gap-1.5 text-[11px] font-mono h-6 px-2.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Index Ready:</span>
            <span>{systemInfo.chunks} chunks</span>
          </Badge>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              title="Clear conversation"
              aria-label="Clear chat messages"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2 min-h-0"
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

      {/* Bottom Composer */}
      <div className="p-3 sm:p-4 border-t border-border bg-card/60 backdrop-blur-sm">
        <PromptInput onSubmit={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
