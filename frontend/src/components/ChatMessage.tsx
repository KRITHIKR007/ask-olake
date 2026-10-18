"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "./ChatWidget";

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
      aria-label="Copy code"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function SourceLinks({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((url, i) => {
          // Extract a readable label from the URL
          const label = url
            .replace("https://olake.io/docs/", "docs/")
            .replace("https://github.com/datazip-inc/", "")
            .replace(/\/$/, "");

          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 2.632 2.998l.085-.058.025-.02 2-2A2 2 0 0 0 8.914 6.025Zm-1.828 3.95a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-2.632-2.998l-.085.058-.025.02-2 2a2 2 0 0 0 0 2.83.75.75 0 0 1 0 1.06l-.343.345Z" clipRule="evenodd" />
              </svg>
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
    </div>
  );
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-blue-600 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] w-full">
        <div
          className={`px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed ${
            message.isError
              ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
        >
          {message.isLoading ? (
            <LoadingDots />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-pre:my-2 prose-code:before:content-[''] prose-code:after:content-['']">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeText = String(children).replace(/\n$/, "");

                    if (match) {
                      return (
                        <div className="relative group">
                          <CopyButton text={codeText} />
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: "0.5rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            {codeText}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {message.isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
            >
              ↻ Retry
            </button>
          )}
        </div>

        {message.sources && <SourceLinks sources={message.sources} />}
      </div>
    </div>
  );
}
