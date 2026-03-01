def predict_proba(pipe, text: str) -> float:
    # returns probability of phishing class (label 1)
    proba = pipe.predict_proba([text])[0][1]
    return float(proba)