"use client";

import { useState } from "react";

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
    <main className="mx-auto min-h-dvh w-full max-w-6xl p-4 sm:p-6">
      <section className="mb-5 border-4 border-black bg-white p-4 sm:p-6">
        <h1 className="font-mono text-4xl uppercase leading-[0.9] tracking-[0.08em] sm:text-7xl">
          Geist Pixel Detector
        </h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base">
          Upload a <strong>.txt</strong> or <strong>.md</strong> file, or paste raw text. We extract the content and run your project model to classify human vs AI writing.
        </p>
      </section>

      <section className="border-4 border-black bg-white p-3 sm:p-5">
        <AiInput onSubmitText={runPrediction} isLoading={loading} />

        {error ? (
          <div className="mt-3 border-2 border-black bg-black px-3 py-2 text-sm text-white">{error}</div>
        ) : null}

        {result ? (
          <div className="mt-4 border-2 border-black bg-white p-3">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Prediction</h2>
            <div className="grid gap-1 text-sm sm:grid-cols-[160px_1fr]">
              <strong>Label</strong>
              <span className="font-mono">{result.label}</span>

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
          </div>
        ) : null}
      </section>
    </main>
  );
}
