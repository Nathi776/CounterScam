import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(PROJECT_ROOT, "training", "message_dataset.csv")
OUT_PATH = os.path.join(PROJECT_ROOT, "message_pipeline.pkl")

df = pd.read_csv(DATA_PATH)
df["label"] = df["label"].map({"safe": 0, "phishing": 1})

X_train, X_test, y_train, y_test = train_test_split(
    df["text"].astype(str),
    df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)

pipe = Pipeline([
    ("features", FeatureUnion([
        ("word", TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=2
        )),
        ("char", TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            min_df=2
        )),
    ])),
    ("clf", LogisticRegression(
        max_iter=4000,
        class_weight="balanced"
    ))
])

pipe.fit(X_train, y_train)

pred = pipe.predict(X_test)
acc = accuracy_score(y_test, pred)

print("\n=== MESSAGE MODEL ===")
print("Accuracy:", round(acc, 4))
print("Confusion matrix:\n", confusion_matrix(y_test, pred))
print("\nReport:\n", classification_report(y_test, pred, digits=4))

joblib.dump(pipe, OUT_PATH)
print(f"\n✅ Saved message pipeline to: {OUT_PATH}")