"use client";

import React from "react";
import { Database, Rocket, Server, Wrench, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SuggestionItem {
  icon: React.ReactNode;
  category: string;
  question: string;
}

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    icon: <Rocket className="h-4 w-4 text-blue-500" />,
    category: "Quickstart",
    question: "How do I get started with OLake?",
  },
  {
    icon: <Database className="h-4 w-4 text-emerald-500" />,
    category: "Connectors & CDC",
    question: "How do I configure a PostgreSQL connector in OLake?",
  },
  {
    icon: <Server className="h-4 w-4 text-violet-500" />,
    category: "Deployment",
    question: "How do I deploy OLake using Helm?",
  },
  {
    icon: <Wrench className="h-4 w-4 text-amber-500" />,
    category: "Table Maintenance",
    question: "How does OLake Fusion maintain Iceberg tables?",
  },
];

interface SuggestionProps {
  onSelect: (question: string) => void;
  className?: string;
}

export function Suggestion({ onSelect, className }: SuggestionProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <span>Suggested technical questions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {DEFAULT_SUGGESTIONS.map((item, idx) => (
          <Card
            key={idx}
            onClick={() => onSelect(item.question)}
            className="group flex cursor-pointer items-start justify-between p-3.5 transition-all duration-200 hover:border-blue-400 hover:shadow-md dark:hover:border-blue-500/80 hover:-translate-y-0.5"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(item.question);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg border border-border bg-muted/60 p-1.5 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors">
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.category}
                </p>
                <p className="text-xs font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {item.question}
                </p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </Card>
        ))}
      </div>
    </div>
  );
}
