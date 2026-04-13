# AI vs Human Writing Detection (CS 561 Final)

Canonical notebook:
- `AI_Human_Writing_Detection_Project.ipynb`

## Dataset

We use the AI vs Human Text Dataset from Kaggle:
https://www.kaggle.com/datasets/hasanyiitakbulut/ai-and-human-text-dataset

### How to Download

1. Install Kaggle API.
2. Run:

   `kaggle datasets download -d hasanyiitakbulut/ai-and-human-text-dataset`

3. Unzip into the `data/` folder at the project root.

## Run

1. Open `AI_Human_Writing_Detection_Project.ipynb` in Jupyter.
2. Install dependencies if needed:
   - `pandas`, `numpy`, `scikit-learn`, `nltk`, `torch`, `transformers`, `openai`, `python-dotenv`, `requests`
3. For OpenAI comparison cells, create `.env` in project root:
   - `OPENAI_API_KEY=your_openai_key`
   - Optional: `OPENAI_MODEL=gpt-4.1-mini`
4. Run notebook cells top-to-bottom.
