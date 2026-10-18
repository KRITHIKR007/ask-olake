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
    <div className="relative my-4 overflow-hidden rounded-xl border border-border bg-[#181b20] shadow-md group">
      {/* Code Header */}
      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-white/5 px-4 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            {cleanLang}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto text-xs font-mono">
        <SyntaxHighlighter
          language={cleanLang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.825rem",
            lineHeight: "1.6",
          }}
          wrapLongLines={false}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
