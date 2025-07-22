import numpy as np

def detect_with_ml(text: str, vectorizer, model) -> np.ndarray:
    """
    Vectorizes the input text and returns ML model prediction.
    Returns:
        1 if phishing detected, 0 otherwise.
    """
    vectorized_text = vectorizer.transform([text])
    prediction = model.predict(vectorized_text)
    return prediction[0]
