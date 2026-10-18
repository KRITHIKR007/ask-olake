"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  User,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { CodeBlock } from "./code-block";
import { Sources } from "./sources";
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
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
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

  const handleFeedback = (type: "up" | "down") => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-200 transition-colors",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Assistant Avatar: Official OLake Logo (Pure logo, no bubble container) */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center pt-0.5">
          <img src="/olake-logo.svg" alt="OLake" className="h-7 w-7 object-contain" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={cn(
          "flex flex-col max-w-[88%] md:max-w-[82%]",
          isUser && "items-end"
        )}
      >
        {/* Author / Timestamp Header */}
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground px-1">
          <span className="font-semibold text-foreground/90">
            {isUser ? "You" : "Ask OLake"}
          </span>
          {message.timestamp && <span className="text-muted-foreground/60">• {message.timestamp}</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl text-[13.5px] leading-relaxed transition-all duration-200",
            isUser
              ? "bg-blue-600 text-white px-4 py-2.5 rounded-tr-xs shadow-sm font-medium"
              : message.isError
              ? "bg-red-50/80 text-red-950 dark:bg-red-950/30 dark:text-red-200 border border-red-200 dark:border-red-800/60 p-4 rounded-tl-xs w-full shadow-xs"
              : "bg-card border border-border/70 p-4.5 rounded-tl-xs shadow-xs w-full text-card-foreground hover:border-border transition-colors"
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2.5 py-2 text-muted-foreground">
              <div className="flex space-x-1">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0ms]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse [animation-delay:200ms]"></span>
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:400ms]"></span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Searching documentation & writing answer...
              </span>
            </div>
          ) : message.isError ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-destructive">
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
                  className="h-7 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry Question</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Markdown Rendered Content */}
              <div
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed text-foreground",
                  isUser && "text-white prose-p:text-white"
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1({ children }) {
                      return (
                        <h1 className="text-lg font-bold tracking-tight text-foreground mt-4 mb-2 first:mt-0 pb-1 border-b border-border/40">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-base font-bold tracking-tight text-foreground mt-3.5 mb-1.5 first:mt-0 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                          <span>{children}</span>
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-sm font-bold text-foreground mt-3 mb-1 first:mt-0">
                          {children}
                        </h3>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="my-2.5 ml-4 space-y-1 list-disc list-outside text-foreground/90">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="my-2.5 ml-4 space-y-1 list-decimal list-outside text-foreground/90">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="pl-1 leading-relaxed">{children}</li>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="my-3 border-l-3 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-3.5 py-2 text-xs italic text-muted-foreground rounded-r-md">
                          {children}
                        </blockquote>
                      );
                    },
                    strong({ children }) {
                      return <strong className="font-semibold text-foreground">{children}</strong>;
                    },
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
                        <div className="my-3.5 overflow-x-auto rounded-xl border border-border shadow-2xs">
                          <table className="w-full text-xs text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return (
                        <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                          {children}
                        </thead>
                      );
                    },
                    th({ children }) {
                      return <th className="p-3 font-semibold text-foreground/80">{children}</th>;
                    },
                    td({ children }) {
                      return (
                        <td className="p-3 border-b border-border/40 text-foreground">
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
                          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-3"
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

        {/* Message Actions (Assistant Only - ChatGPT / Claude style) */}
        {!isUser && !message.isLoading && !message.isError && (
          <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Copy response text"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
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
                  className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Regenerate answer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </Button>
              )}

              {/* Feedback buttons */}
              <div className="flex items-center gap-0.5 ml-1 border-l border-border/60 pl-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("up")}
                  className={cn(
                    "h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer transition-transform active:scale-90",
                    feedback === "up" && "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                  )}
                  title="Helpful response"
                  aria-label="Thumbs up"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback("down")}
                  className={cn(
                    "h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer transition-transform active:scale-90",
                    feedback === "down" && "text-destructive bg-red-50 dark:bg-red-950/50"
                  )}
                  title="Not helpful"
                  aria-label="Thumbs down"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
