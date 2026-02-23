import numpy as np

def detect_with_ml(text: str, vectorizer, model) -> np.ndarray:
    
    vectorized_text = vectorizer.transform([text])
    prediction = model.predict(vectorized_text)
    return prediction[0]
