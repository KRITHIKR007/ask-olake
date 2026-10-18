"use client";

import React, { useState } from "react";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp, Globe } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  const previewSources = sources.slice(0, 2);
  const remainingCount = Math.max(0, sources.length - 2);

  return (
    <div
      className={cn(
        "mt-3.5 pt-2.5 border-t border-border/60 transition-all",
        className
      )}
    >
      {/* Header toggle bar - Clean text only, no bubble */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-left text-xs transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="font-bold tracking-wider uppercase text-[10.5px] text-foreground/80 shrink-0">
            Sources
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px] shrink-0">
            ({sources.length})
          </span>

          {/* Collapsed Clean Text Preview (NO BUBBLE - colored text only) */}
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-2 truncate ml-2">
              {previewSources.map((url, i) => {
                const label = url
                  .replace("https://olake.io/docs/", "")
                  .replace("https://github.com/datazip-inc/", "")
                  .replace(/\/$/, "");
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-muted-foreground/30 text-[10px] select-none">
                        •
                      </span>
                    )}
                    <span className="truncate max-w-[170px] font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      {label}
                    </span>
                  </React.Fragment>
                );
              })}
              {remainingCount > 0 && (
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold shrink-0 ml-0.5">
                  +{remainingCount} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground text-[11px] shrink-0 ml-2 transition-colors">
          <span>{isOpen ? "Hide" : "View"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Sources List - Clean text links, no bubble cards */}
      {isOpen && (
        <div className="pt-2 pb-1 space-y-1.5 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {sources.map((url, i) => {
              const isGithub = url.includes("github.com");
              const isDocs = url.includes("olake.io");

              let label = url;
              let sectionBadge = "Documentation";

              if (isGithub) {
                sectionBadge = "GitHub";
                label = url
                  .replace("https://github.com/datazip-inc/", "")
                  .replace("/blob/master/", " / ");
              } else if (isDocs) {
                sectionBadge = "Docs";
                label =
                  url.replace("https://olake.io/docs/", "").replace(/\/$/, "") ||
                  "Overview";
              }

              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-1 text-xs rounded hover:bg-muted/40 px-1 -mx-1 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    {isGithub ? (
                      <GithubIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="font-mono text-[11.5px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                      {sectionBadge}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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
