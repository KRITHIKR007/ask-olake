"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { CodeBlock } from "./code-block";
import { Sources } from "./sources";
import { Reasoning } from "./reasoning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isLoading?: boolean;
  isError?: boolean;
  timestamp?: string;
}

interface MessageProps {
  message: ChatMessageData;
  onRetry?: () => void;
}

export function Message({ message, onRetry }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3.5 py-4 transition-colors",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={cn(
          "flex flex-col max-w-[85%] md:max-w-[78%]",
          isUser && "items-end"
        )}
      >
        {/* Author / Timestamp Header */}
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">
            {isUser ? "You" : "Ask OLake"}
          </span>
          {message.timestamp && <span>• {message.timestamp}</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white px-4 py-2.5 rounded-tr-sm shadow-xs"
              : message.isError
              ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 border border-red-200 dark:border-red-800/50 p-4 rounded-tl-sm w-full"
              : "bg-card border border-border/70 p-4.5 rounded-tl-sm shadow-xs w-full text-card-foreground"
          )}
        >
          {message.isLoading ? (
            <div className="space-y-3">
              <Reasoning isLoading={true} />
              <div className="flex items-center gap-1.5 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  Synthesizing answer...
                </span>
              </div>
            </div>
          ) : message.isError ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium text-xs leading-normal">
                  {message.content || "An error occurred while communicating with Ask OLake."}
                </p>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry Question</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Markdown Rendered Content */}
              <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", isUser && "text-white prose-p:text-white")}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const value = String(children).replace(/\n$/, "");
                      const isInline = !match && !value.includes("\n");

                      if (isInline) {
                        return (
                          <code
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-mono text-[12px] font-semibold",
                              isUser
                                ? "bg-white/20 text-white"
                                : "bg-muted text-foreground border border-border/60"
                            )}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : ""}
                          value={value}
                        />
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="my-3 overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-xs text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return (
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                          {children}
                        </thead>
                      );
                    },
                    th({ children }) {
                      return <th className="p-2.5 font-semibold">{children}</th>;
                    },
                    td({ children }) {
                      return (
                        <td className="p-2.5 border-b border-border/50 text-foreground">
                          {children}
                        </td>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Source Citations */}
              {!isUser && message.sources && message.sources.length > 0 && (
                <Sources sources={message.sources} />
              )}
            </>
          )}
        </div>

        {/* Message Actions (Assistant Only) */}
        {!isUser && !message.isLoading && !message.isError && (
          <div className="mt-1.5 flex items-center gap-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 gap-1 px-2 text-[11px] hover:text-foreground"
              aria-label="Copy response text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 gap-1 px-2 text-[11px] hover:text-foreground"
                aria-label="Retry answer generation"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
