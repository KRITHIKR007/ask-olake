"use client";

import React, { useEffect, useState } from "react";
import { Database, CheckCircle2, Waves, ArrowRight, Layers, Flame } from "lucide-react";
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
        // Fallback
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 text-center max-w-2xl mx-auto space-y-6">
      {/* Brand Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <Waves className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          <span>Ask OLake Documentation AI</span>
          {indexStatus?.loaded && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              • {indexStatus.chunks} chunks indexed
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          What would you like to build with <span className="text-blue-600">OLake</span>?
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Grounded technical assistant for replicating databases to Apache Iceberg and automating table maintenance.
        </p>
      </div>

      {/* Product Highlights */}
      <div className="grid grid-cols-2 gap-3 w-full text-left">
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-foreground">OLake Go</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Fastest replication engine: CDC & Full load from Postgres, MySQL, MongoDB, and Kafka to Iceberg.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-foreground">OLake Fusion</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            Automated Iceberg table health scoring, compaction scheduling, and snapshot maintenance.
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <Suggestion onSelect={onSelectPrompt} className="pt-2 text-left" />
    </div>
  );
}
