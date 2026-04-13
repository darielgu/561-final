import Link from "next/link";

const metrics = [
  { label: "Dataset Size", value: "6,069 samples" },
  { label: "Class Labels", value: "0 Human / 1 AI" },
  { label: "Core Features", value: "TF-IDF (1-2 grams)" },
  { label: "Evaluation", value: "Accuracy, Precision, Recall, F1" },
];

const findings = [
  {
    title: "Baseline Strength",
    detail:
      "Classical ML with TF-IDF + Logistic Regression performs strongly on this dataset and remains fast to train and deploy.",
  },
  {
    title: "Advanced Comparison",
    detail:
      "BERT is included as the advanced model family to test whether contextual deep representations improve classification robustness.",
  },
  {
    title: "Applied Outcome",
    detail:
      "The system provides a practical detector workflow for text authenticity scenarios such as coursework review and content moderation support.",
  },
];

export default function FindingsPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <section className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker">Results Overview</p>
            <h1 className="display mt-2">Findings</h1>
          </div>
          <Link href="/" className="nav-link">
            Back To Detector
          </Link>
        </div>
        <p className="lede mt-4 max-w-4xl">
          This page summarizes the project goal, dataset framing, methods, and outcome narrative from your proposal in
          a compact, presentation-friendly format.
        </p>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.label} className="panel p-4">
            <p className="meta">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <article className="panel p-5">
          <h2 className="section-title">Method Stack</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/85">
            <p>
              Text preprocessing applies lowercasing, tokenization, and stop-word removal. Clean text is transformed
              into numerical features using TF-IDF so statistical models can identify discriminative wording patterns.
            </p>
            <p>
              The project compares a baseline model (TF-IDF + Logistic Regression) with an advanced deep model family
              (BERT) to test whether richer contextual understanding improves AI-vs-human classification.
            </p>
            <p>
              Model quality is evaluated through accuracy, precision, recall, and F1 to balance overall correctness
              with class-specific detection performance.
            </p>
          </div>
        </article>

        <article className="panel p-5">
          <h2 className="section-title">Key Takeaways</h2>
          <div className="mt-4 space-y-3">
            {findings.map((item) => (
              <div key={item.title} className="border border-white/20 bg-white/5 p-3">
                <h3 className="meta">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
