"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { AiInput } from "@/components/ui/ai-input";

type PredictResponse = {
  label: "Human" | "AI";
  confidence: number;
  probability_ai: number;
  probability_human: number;
  model_name: string;
  model_type: string;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);

  async function runPrediction(text: string) {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Prediction failed");
      }

      setResult(data as PredictResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="panel mb-5 p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker">CS 561 Final Project</p>
            <h1 className="display mt-2">AI vs Human Writing Detection</h1>
          </div>
          <Link href="/findings" className="nav-link">
            View Findings
          </Link>
        </div>
        <p className="lede mt-4 max-w-4xl">
          Natural Language Processing (NLP) helps computers process language. This project classifies text as
          human-written or AI-generated to support concerns around education, academic integrity, and online content
          authenticity.
        </p>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="panel p-4 sm:p-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
            <h2 className="section-title">Run Classifier</h2>
            <span className="mono-tag">TF-IDF + Logistic Regression</span>
          </div>

          <AiInput onSubmitText={runPrediction} isLoading={loading} />

          {error ? <div className="notice mt-3">{error}</div> : null}

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-white/25 bg-white/5 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="section-title">Prediction</h3>
                <span className="mono-tag">{result.label}</span>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-[170px_1fr]">
                <strong>Confidence</strong>
                <span className="font-mono">{(result.confidence * 100).toFixed(2)}%</span>

                <strong>P(AI)</strong>
                <span className="font-mono">{result.probability_ai.toFixed(4)}</span>

                <strong>P(Human)</strong>
                <span className="font-mono">{result.probability_human.toFixed(4)}</span>

                <strong>Model</strong>
                <span className="font-mono">{result.model_name}</span>

                <strong>Type</strong>
                <span className="font-mono">{result.model_type}</span>
              </div>
            </motion.div>
          ) : null}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="panel p-4 sm:p-5"
        >
          <h2 className="section-title mb-3">Project Context</h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/85">
            <div>
              <h3 className="meta">Topic / Problem</h3>
              <p>Design and evaluate ML and deep learning models that classify text as AI-generated or human-written.</p>
            </div>
            <div>
              <h3 className="meta">Dataset</h3>
              <p>
                ai-and-human-text-dataset from Kaggle with 6,069 text samples, labeled as
                <span className="font-mono"> 0 = Human</span> and
                <span className="font-mono"> 1 = AI</span>.
              </p>
            </div>
            <div>
              <h3 className="meta">Methods</h3>
              <p>
                Preprocessing includes lowercasing, tokenization, and stop-word removal. Text is transformed with
                TF-IDF and used in baseline and advanced model comparisons (TF-IDF baseline and BERT).
              </p>
            </div>
            <div>
              <h3 className="meta">Evaluation</h3>
              <p>
                Performance is measured with accuracy, precision, recall, and F1 to compare classical ML baselines
                with pretrained LLM-oriented approaches.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
