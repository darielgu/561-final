"use client";

import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Plus, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const MIN_HEIGHT = 56;
const MAX_HEIGHT = 220;

type AiInputProps = {
  onSubmitText: (text: string) => Promise<void> | void;
  isLoading?: boolean;
};

export function AiInput({ onSubmitText, isLoading = false }: AiInputProps) {
  const [value, setValue] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });

  const clearFile = (e?: MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName(null);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextType = ["text/plain", "text/markdown", "text/x-markdown", ""].includes(file.type);
    const lower = file.name.toLowerCase();
    const validExt = lower.endsWith(".txt") || lower.endsWith(".md");

    if (!validExt || !isTextType) {
      clearFile();
      setError("Only .txt or .md files are allowed.");
      return;
    }

    try {
      const extracted = await file.text();
      const merged = value.trim().length > 0 ? `${value}\n\n${extracted}` : extracted;
      setValue(merged);
      setFileName(file.name);
      requestAnimationFrame(() => adjustHeight());
    } catch {
      clearFile();
      setError("Could not read file content.");
    }
  };

  const handleSubmit = async () => {
    const payload = value.trim();
    if (payload.length < 20) {
      setError("Enter at least 20 characters to run prediction.");
      return;
    }

    setError("");
    await onSubmitText(payload);
  };

  return (
    <div className="w-full py-2">
      <div className="relative mx-auto w-full max-w-3xl rounded-none border-4 border-black bg-white p-2">
        <div className="relative flex flex-col border-2 border-black bg-white">
          <div className="overflow-y-auto" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
            <div className="relative">
              <Textarea
                id="ai-input"
                value={value}
                placeholder="Paste text, or attach a .txt/.md file..."
                className="w-full resize-none rounded-none border-0 bg-white px-4 py-4 text-base leading-tight text-black placeholder:text-black/45 focus-visible:ring-0"
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
              />
            </div>
          </div>

          <div className="h-14 border-t-2 border-black bg-white">
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <label
                className={cn(
                  "relative cursor-pointer rounded-none border-2 border-black p-2",
                  fileName ? "bg-black text-white" : "bg-white text-black",
                )}
              >
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Paperclip className="h-4 w-4" />
              </label>

              <AnimatePresence>
                {fileName && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1 border-2 border-black bg-black px-2 py-1 text-xs text-white"
                  >
                    <span className="max-w-[160px] truncate">{fileName}</span>
                    <button
                      onClick={clearFile}
                      className="inline-flex h-5 w-5 items-center justify-center border border-white text-white"
                      type="button"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                className={cn(
                  "rounded-none border-2 border-black p-2 transition-colors",
                  isLoading ? "bg-black/25 text-black" : "bg-black text-white",
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-auto mt-3 w-full max-w-3xl border-2 border-black bg-black px-3 py-2 text-sm text-white">
          {error}
        </div>
      ) : null}
    </div>
  );
}
