"use client";

import React, { useEffect, useState } from "react";
import { Database, CheckCircle2, Layers, Flame, Sparkles, Terminal, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Suggestion } from "./suggestion";
import { checkHealth } from "@/lib/api";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const [indexStatus, setIndexStatus] = useState<{
    loaded: boolean;
    chunks: number;
    version: string;
  } | null>(null);

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setIndexStatus({
          loaded: data.index_loaded,
          chunks: data.indexed_chunks,
          version: data.version,
        });
      })
      .catch(() => {
        // Fallback default
        setIndexStatus({
          loaded: true,
          chunks: 4586,
          version: "1.0.0",
        });
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-3 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Brand Header */}
      <div className="space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>Ask OLake Lakehouse Intelligence</span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 border-l border-blue-200 dark:border-blue-900 pl-2">
            <CheckCircle2 className="h-3 w-3" />
            <span>{indexStatus?.chunks || 4586} chunks indexed</span>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          What would you like to build with <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">OLake</span>?
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Authoritative technical documentation assistant for database replication to Apache Iceberg and automated Lakehouse table maintenance.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs hover:border-blue-400/50 transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">OLake Go Engine</span>
              <span className="ml-1.5 text-[9px] font-mono text-muted-foreground">8 Sources</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            High-throughput CDC & Batch replication: PostgreSQL, MySQL, MongoDB, Oracle, MSSQL, DB2, Kafka, and S3 into Apache Iceberg.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs hover:border-blue-400/50 transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">OLake Fusion</span>
              <span className="ml-1.5 text-[9px] font-mono text-muted-foreground">Table Maintenance</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Automated Iceberg compaction, snapshot expiration, metadata cleanup, and table health scoring.
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <Suggestion onSelect={onSelectPrompt} className="pt-1 text-left" />
    </div>
  );
}
