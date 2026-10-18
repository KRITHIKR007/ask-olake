"use client";

import React from "react";

interface StarterQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function StarterQuestions({ questions, onSelect }: StarterQuestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-left px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
        >
          <span className="text-blue-500 mr-1.5 group-hover:text-blue-600">→</span>
          {q}
        </button>
      ))}
    </div>
  );
}
