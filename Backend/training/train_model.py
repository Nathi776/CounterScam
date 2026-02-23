import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Define project root path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# 1. Load dataset
df = pd.read_csv('training/dataset.csv')

df["label"] = df["label"].map({"safe": 0, "phishing": 1})

# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)

# 3. Convert text to features
vectorizer = TfidfVectorizer()
X_train_vectors = vectorizer.fit_transform(X_train)
X_test_vectors = vectorizer.transform(X_test)

# 4. Train model
model = LogisticRegression()
model.fit(X_train_vectors, y_train)

# 5. Evaluate
y_pred = model.predict(X_test_vectors)
print("Accuracy:", accuracy_score(y_test, y_pred))

# 6. Save model and vectorizer to the project root folder
joblib.dump(model, os.path.join(PROJECT_ROOT, 'phishing_model.pkl'))
joblib.dump(vectorizer, os.path.join(PROJECT_ROOT, 'vectorizer.pkl'))

print("✅ Model and vectorizer saved to:", PROJECT_ROOT)
