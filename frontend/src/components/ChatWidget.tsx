"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { askQuestion, type AskResponse } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { StarterQuestions } from "./StarterQuestions";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isLoading?: boolean;
  isError?: boolean;
}

const STARTER_QUESTIONS = [
  "How do I get started with OLake?",
  "How do I configure a source connector?",
  "How do I deploy OLake using Helm?",
  "How does OLake Fusion maintain Iceberg tables?",
];

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const loadingMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
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
          : "An unexpected error occurred. Please try again.";
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
  }, [isLoading]);

  const handleRetry = useCallback((messageId: string) => {
    const userMsgIndex = messages.findIndex(
      (m, i) => m.role === "user" && messages[i + 1]?.id === messageId
    );
    if (userMsgIndex >= 0) {
      const question = messages[userMsgIndex].content;
      // Remove the error message
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      // Resend
      handleSend(question);
    }
  }, [messages, handleSend]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Ask OLake</h2>
          <p className="text-xs text-blue-100">AI Documentation Assistant</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" id="chat-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Ask OLake
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Ask me anything about OLake — setup, connectors, sync modes, deployment, Fusion maintenance, and more.
            </p>
            <StarterQuestions
              questions={STARTER_QUESTIONS}
              onSelect={handleSend}
            />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onRetry={msg.isError ? () => handleRetry(msg.id) : undefined}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
