"use client";

import { TextareaHTMLAttributes, forwardRef, useId } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`
            block w-full resize-none rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
            ${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300"
            }
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
