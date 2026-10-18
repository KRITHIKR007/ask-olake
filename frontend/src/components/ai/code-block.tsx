"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const cleanLang = language?.replace(/^language-/, "") || "text";

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] shadow-lg group">
      {/* Code Header */}
      <div className="flex h-9 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3.5 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <Terminal className="h-3 w-3 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
              {cleanLang}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 gap-1.5 px-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto text-[13px] font-mono leading-relaxed">
        <SyntaxHighlighter
          language={cleanLang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem 1.15rem",
            background: "transparent",
            fontSize: "0.8125rem",
            lineHeight: "1.65",
          }}
          wrapLongLines={false}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
