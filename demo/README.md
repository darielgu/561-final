# Demo (Next.js)

One-page brutalist black/white UI for text-origin prediction.

## Run

From repo root:

```bash
cd demo
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- API route: `POST /api/predict`
- The route calls `demo/scripts/predict.py`.
- Python defaults to `../.venv/bin/python`; override with `PYTHON_PATH`.
- Model is cached at `demo/.model_cache/ai_human_tfidf.joblib` after first request.
