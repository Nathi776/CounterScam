from datetime import datetime
from detection.message_risk_engine import calculate_message_risk_score


class FraudMonitor:

    def __init__(self, vectorizer, model):
        self.vectorizer = vectorizer
        self.model = model

    def process_message(self, message: str):

        result = calculate_message_risk_score(
            message,
            self.vectorizer,
            self.model
        )

        alert = False
        alert_level = "none"

        if result["risk_score"] >= 80:
            alert = True
            alert_level = "critical"

        elif result["risk_score"] >= 40:
            alert = True
            alert_level = "warning"

        return {
            "timestamp": datetime.utcnow(),
            "message": message,
            "risk_score": result["risk_score"],
            "verdict": result["verdict"],
            "alert": alert,
            "alert_level": alert_level,
            "reasons": result["reasons"]
        }
