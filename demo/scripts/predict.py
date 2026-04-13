#!/usr/bin/env python3
import json
import os
import re
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

CACHE_DIR = Path(__file__).resolve().parents[1] / ".model_cache"
CACHE_PATH = CACHE_DIR / "ai_human_tfidf.joblib"
MODEL_NAME = "TF-IDF + LogisticRegression (project dataset)"


def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z\\s]", " ", text)
    tokens = [tok for tok in text.split() if tok and tok not in ENGLISH_STOP_WORDS]
    return " ".join(tokens)


def find_dataset_csv(repo_root: Path) -> Path:
    data_dir = repo_root / "data"
    if not data_dir.exists():
        raise FileNotFoundError("Missing data/ directory in repo root.")

    candidates = sorted(data_dir.glob("*.csv"))
    if not candidates:
        raise FileNotFoundError("No dataset CSV found in data/ directory.")

    for p in candidates:
        name = p.name.lower()
        if "ai" in name or "human" in name:
            return p
    return candidates[0]


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    text_candidates = ["text", "Text", "content", "sentence"]
    label_candidates = ["generated", "label", "Category", "category", "target", "Author", "author"]

    text_col = next((c for c in text_candidates if c in df.columns), None)
    label_col = next((c for c in label_candidates if c in df.columns), None)
    if text_col is None or label_col is None:
        raise ValueError(f"Missing expected text/label columns. Found: {list(df.columns)}")

    out = df[[text_col, label_col]].copy().rename(columns={text_col: "text", label_col: "label"})

    numeric = pd.to_numeric(out["label"], errors="coerce")
    if numeric.notna().all():
        out["label"] = numeric.astype(int)
    else:
        raw = out["label"].astype(str).str.strip().str.lower()
        label_map = {
            "human": 0,
            "ai": 1,
            "ai-generated": 1,
            "generated": 1,
            "machine": 1,
            "chatgpt": 1,
            "0": 0,
            "1": 1,
        }
        mapped = raw.map(label_map)
        if mapped.isna().any():
            uniq = sorted(raw.dropna().unique().tolist())
            if len(uniq) == 2:
                if "human" in uniq:
                    other = uniq[0] if uniq[1] == "human" else uniq[1]
                    mapped = raw.map({"human": 0, other: 1})
                else:
                    mapped = raw.map({uniq[0]: 0, uniq[1]: 1})

        out["label"] = mapped

    out = out.dropna(subset=["text", "label"]).copy()
    out["label"] = out["label"].astype(int)
    out = out[out["label"].isin([0, 1])]
    out["text"] = out["text"].astype(str)

    if out.empty:
        raise ValueError("No usable rows found after normalization.")

    return out


def train_and_cache_model(repo_root: Path):
    csv_path = find_dataset_csv(repo_root)
    df = pd.read_csv(csv_path)
    df = normalize_columns(df)
    df["cleaned"] = df["text"].apply(preprocess_text)

    model = Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1, 2))),
            ("clf", LogisticRegression(max_iter=2000, random_state=42)),
        ]
    )

    model.fit(df["cleaned"], df["label"])

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, CACHE_PATH)
    return model


def load_model(repo_root: Path):
    if CACHE_PATH.exists():
        return joblib.load(CACHE_PATH)
    return train_and_cache_model(repo_root)


def predict(text: str, model):
    cleaned = preprocess_text(text)
    probs = model.predict_proba([cleaned])[0]
    p_human = float(probs[0])
    p_ai = float(probs[1])
    label = "AI" if p_ai >= p_human else "Human"
    confidence = max(p_ai, p_human)

    return {
        "label": label,
        "confidence": confidence,
        "probability_ai": p_ai,
        "probability_human": p_human,
        "model_name": MODEL_NAME,
        "model_type": "classical_ml",
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: predict.py <text>"}))
        sys.exit(1)

    text = sys.argv[1].strip()
    if len(text) < 5:
        print(json.dumps({"error": "Input text too short."}))
        sys.exit(1)

    repo_root_env = os.environ.get("REPO_ROOT")
    repo_root = Path(repo_root_env) if repo_root_env else Path(__file__).resolve().parents[2]

    try:
        model = load_model(repo_root)
        result = predict(text, model)
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
