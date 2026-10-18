"use client";

import React from "react";
import { Layers, Flame } from "lucide-react";
import { Suggestion } from "./suggestion";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-3 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
      {/* Official OG Logo & Brand Header */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60 p-3 shadow-xs hover:scale-105 transition-transform duration-200">
          <img src="/olake-logo.svg" alt="OLake" className="h-full w-full object-contain" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          What would you like to build with <span className="text-blue-600">OLake</span>?
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Technical documentation and architecture assistant for replicating databases to Apache Iceberg and automated table maintenance.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs hover:border-blue-400/50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">OLake Go Engine</span>
              <span className="ml-1.5 text-[10px] text-muted-foreground">8 Sources</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            CDC & Batch replication: PostgreSQL, MySQL, MongoDB, Oracle, MSSQL, DB2, Kafka, and S3 into Apache Iceberg.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs hover:border-blue-400/50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">OLake Fusion</span>
              <span className="ml-1.5 text-[10px] text-muted-foreground">Table Maintenance</span>
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
