import Link from "next/link";

const metrics = [
  { label: "Dataset Size", value: "6,069 samples" },
  { label: "Class Labels", value: "0 Human / 1 AI" },
  { label: "Train / Test Split", value: "4,855 / 1,214" },
  { label: "Core Features", value: "TF-IDF (1-2 grams), max 10,000" },
];

const performanceRows = [
  {
    model: "TF-IDF + Logistic Regression (full test set)",
    accuracy: "0.9885",
    precision: "0.9886",
    recall: "0.9886",
    f1: "0.9886",
    note: "Fast baseline, strong and stable on full 1,214-sample test split.",
  },
  {
    model: "BERT (fine-tuned subset)",
    accuracy: "0.9975",
    precision: "0.9951",
    recall: "1.0000",
    f1: "0.9975",
    note: "Evaluated on subset (train=800, test=400), so direct fairness vs full baseline is limited.",
  },
];

const snippetBaseline = `def train_tfidf_baseline(X_train, X_test, y_train, y_test):
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=2000, random_state=SEED)
    model.fit(X_train_tfidf, y_train)
    pred = model.predict(X_test_tfidf)`;

const snippetBert = `BERT_TRAIN_SAMPLES = min(800, len(X_train_raw))
BERT_TEST_SAMPLES = min(400, len(X_test_raw))

training_args = TrainingArguments(
    output_dir=str(outputs_dir),
    num_train_epochs=1,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    evaluation_strategy="epoch",
)`;

const snippetOpenAI = `SYSTEM_PROMPTS = {
    "strict_forensic": "...Prefer high precision...",
    "style_sensitive": "...Focus on repetition and generic abstraction...",
    "balanced": "...calibrated classifier...",
}

response = client.responses.create(
    model=OPENAI_MODEL,
    input=[{"role": "system", "content": system_prompt}, {"role": "user", "content": text}],
)`;

export default function FindingsPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-5 flex justify-end">
        <Link href="/" className="nav-link">
          Back To Detector
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.label} className="panel p-4">
            <p className="meta">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 panel p-5">
        <h2 className="section-title">What We Found</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/20 text-white/80">
                <th className="py-2 pr-3 font-medium">Model</th>
                <th className="py-2 pr-3 font-medium">Accuracy</th>
                <th className="py-2 pr-3 font-medium">Precision</th>
                <th className="py-2 pr-3 font-medium">Recall</th>
                <th className="py-2 pr-3 font-medium">F1</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {performanceRows.map((row) => (
                <tr key={row.model} className="border-b border-white/10 align-top text-white/90">
                  <td className="py-3 pr-3">{row.model}</td>
                  <td className="py-3 pr-3 font-mono">{row.accuracy}</td>
                  <td className="py-3 pr-3 font-mono">{row.precision}</td>
                  <td className="py-3 pr-3 font-mono">{row.recall}</td>
                  <td className="py-3 pr-3 font-mono">{row.f1}</td>
                  <td className="py-3 text-white/75">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="panel p-5">
          <h2 className="section-title">Method Details</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/85">
            <p>
              Data cleaning and preprocessing produced a balanced dataset of 6,069 samples after normalization. The
              baseline model used TF-IDF features plus Logistic Regression and achieved strong generalization on the
              full 1,214-sample test split.
            </p>
            <p>
              The BERT experiment improved metrics on its evaluated subset, with especially strong recall for AI class
              detection. Because BERT was run on a smaller subset for compute feasibility, the result is best treated
              as a directional improvement signal, not a strict apples-to-apples benchmark against the full baseline.
            </p>
            <p>
              The OpenAI prompted comparison section in the notebook adds a practical “external judge” perspective and
              highlights prompt-sensitivity risk when using LLM-only classification strategies.
            </p>
          </div>
        </article>

        <article className="panel p-5">
          <h2 className="section-title">Challenges</h2>
          <div className="mt-4 space-y-3">
            <div className="border border-white/20 bg-white/5 p-3">
              <h3 className="meta">Compute Constraints</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                BERT fine-tuning required a reduced subset (800 train / 400 test), making throughput manageable but
                limiting one-to-one comparability with full-dataset baseline results.
              </p>
            </div>
            <div className="border border-white/20 bg-white/5 p-3">
              <h3 className="meta">External Dependency Friction</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                Notebook runs note unauthenticated Hugging Face requests (rate-limit risk) and optional OpenAI API
                usage (cost/rate/reproducibility sensitivity).
              </p>
            </div>
            <div className="border border-white/20 bg-white/5 p-3">
              <h3 className="meta">Prompt Sensitivity</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                OpenAI detection behavior depends on system prompt framing (strict forensic vs balanced vs style
                sensitive), which can shift decision thresholds and consistency.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 panel p-5">
        <h2 className="section-title">Notebook Code Snippets</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="meta">1. Baseline Training</p>
            <pre className="mt-2 overflow-x-auto border border-white/15 bg-black/70 p-3 text-xs text-white/85">
              <code>{snippetBaseline}</code>
            </pre>
          </div>
          <div>
            <p className="meta">2. BERT Subset Setup</p>
            <pre className="mt-2 overflow-x-auto border border-white/15 bg-black/70 p-3 text-xs text-white/85">
              <code>{snippetBert}</code>
            </pre>
          </div>
          <div>
            <p className="meta">3. Prompted OpenAI Comparison</p>
            <pre className="mt-2 overflow-x-auto border border-white/15 bg-black/70 p-3 text-xs text-white/85">
              <code>{snippetOpenAI}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mt-5 panel p-5">
        <h2 className="section-title">Performance Summary</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/85">
          The project baseline already performs very strongly and is deployment-friendly due to speed and simplicity.
          BERT shows further gains on a smaller evaluated subset, indicating deeper contextual representations can help
          when compute budget allows. Overall, the practical recommendation is to keep TF-IDF + Logistic Regression as
          the default production model and use BERT or prompted LLM analysis as higher-cost secondary validation paths
          when extra accuracy or interpretive checks are needed.
        </p>
      </section>
    </main>
  );
}
