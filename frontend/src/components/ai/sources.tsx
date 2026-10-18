"use client";

import React, { useState } from "react";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp, CheckCircle2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface SourcesProps {
  sources: string[];
  className?: string;
}

export function Sources({ sources, className }: SourcesProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!sources || sources.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-950/60 dark:bg-blue-950/20 shadow-xs",
        className
      )}
    >
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-100/40 dark:hover:bg-blue-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px] text-blue-900 dark:text-blue-200">
            Verified Documentation Sources
          </span>
          <Badge variant="brand" className="h-4.5 px-1.5 text-[10px]">
            {sources.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <span>{isOpen ? "Hide" : "Show"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {/* Sources Grid */}
      {isOpen && (
        <div className="border-t border-blue-100/80 dark:border-blue-950/80 p-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((url, i) => {
              const isGithub = url.includes("github.com");
              const isDocs = url.includes("olake.io");

              let label = url;
              let sectionBadge = "Documentation";

              if (isGithub) {
                sectionBadge = "GitHub Repo";
                label = url.replace("https://github.com/datazip-inc/", "").replace("/blob/master/", " / ");
              } else if (isDocs) {
                sectionBadge = "Official Docs";
                label = url.replace("https://olake.io/docs/", "").replace(/\/$/, "") || "Overview";
              }

              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs transition-all duration-150 hover:border-blue-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500"
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isGithub ? (
                        <GithubIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {sectionBadge}
                      </span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>

                  <div className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {label}
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>Grounding Evidence</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
