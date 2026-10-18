"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Sparkles, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  onSubmit,
  isLoading,
  placeholder = "Ask anything about OLake connectors, architecture, deployment, or table maintenance...",
  className,
}: PromptInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = input.length;
  const isTooLong = charCount > 1000;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card shadow-lg transition-all focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20",
        className
      )}
    >
      <form onSubmit={handleSubmit} className="flex flex-col p-3">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          maxLength={1000}
          className="w-full resize-none border-0 bg-transparent p-1.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 disabled:opacity-50 min-h-[44px] max-h-[180px]"
          aria-label="Ask OLake a question"
        />

        {/* Action bar */}
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/75 font-mono">
              <CornerDownLeft className="h-3 w-3" />
              <span>Enter to send</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {charCount > 700 && (
              <span
                className={cn(
                  "text-[10px] font-mono",
                  isTooLong ? "text-destructive font-bold" : "text-muted-foreground"
                )}
              >
                {charCount}/1000
              </span>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading || isTooLong}
              className={cn(
                "h-8 w-8 rounded-full p-0 transition-transform active:scale-95",
                input.trim() && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label="Submit question"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
