"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Cpu, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningProps {
  isLoading?: boolean;
  className?: string;
}

export function Reasoning({ isLoading = false, className }: ReasoningProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "my-2 rounded-lg border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-slate-600 dark:text-slate-300"
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex h-3.5 w-3.5 items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              </span>
            </div>
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          )}
          <span className="font-medium">
            {isLoading
              ? "Retrieving context & synthesizing answer..."
              : "Retrieved via Hybrid Search (FAISS + BM25 RRF)"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>{isOpen ? "Less" : "Details"}</span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-1.5 border-t border-slate-200/80 pt-2 text-[11px] text-muted-foreground dark:border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-blue-500" />
            <span>Multi-source index: 4,586 documentation & repository chunks</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3 text-emerald-500" />
            <span>Ranking: Reciprocal Rank Fusion (vector weight 0.6, lexical 0.4)</span>
          </div>
        </div>
      )}
    </div>
  );
}
