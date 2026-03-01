import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

df = pd.read_csv("training/dataset_clean.csv")
df["label"] = df["label"].map({"safe": 0, "phishing": 1})

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=2)),
    ("clf", LogisticRegression(max_iter=2000))
])

pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))

joblib.dump(pipe, os.path.join(PROJECT_ROOT, "phishing_pipeline.pkl"))
print("✅ Pipeline saved to:", PROJECT_ROOT)