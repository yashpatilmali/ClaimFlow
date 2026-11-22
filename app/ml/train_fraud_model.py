import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.ml.fraud_features import FEATURE_NAMES, extract_tabular_features

logger = logging.getLogger("claimflow.ml")

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_model.joblib")
META_PATH = os.path.join(MODEL_DIR, "fraud_model_meta.json")


def generate_synthetic_claims_dataset(n_rows: int = 1000) -> pd.DataFrame:
    """
    Generates a realistic 1,000-row synthetic auto insurance dataset
    modeled on Kaggle P&C insurance fraud tabular distributions.
    """
    np.random.seed(42)
    
    # Months as customer: log-normal distribution
    months_as_customer = np.random.randint(1, 480, size=n_rows)
    # Days between policy binding and crash (some very recent < 15 days = high fraud rate)
    is_recent_bind = np.random.binomial(1, 0.08, size=n_rows)
    bind_days = np.where(is_recent_bind == 1, np.random.randint(1, 15, size=n_rows), np.random.randint(16, 1200, size=n_rows))
    
    deductible = np.random.choice([250, 500, 1000], size=n_rows, p=[0.25, 0.60, 0.15])
    
    # Total claim amount: normal centered around 4,500 with right skew
    base_claim = np.random.exponential(scale=3500, size=n_rows) + 500
    total_claim = np.round(base_claim, 2)
    vehicle_claim = np.round(total_claim * np.random.uniform(0.6, 0.95, size=n_rows), 2)
    
    incident_hour = np.random.randint(0, 24, size=n_rows)
    num_vehicles = np.random.choice([1, 2, 3], size=n_rows, p=[0.4, 0.5, 0.1])
    witnesses = np.random.choice([0, 1, 2, 3], size=n_rows, p=[0.4, 0.35, 0.2, 0.05])
    police_report = np.random.binomial(1, 0.70, size=n_rows)
    
    # Red flags
    part_mismatch = np.random.binomial(1, 0.07, size=n_rows)
    high_labor = np.random.binomial(1, 0.09, size=n_rows)
    racing_flag = np.random.binomial(1, 0.04, size=n_rows)
    
    # Latent fraud probability formula
    is_late_night = np.isin(incident_hour, [1, 2, 3, 4]).astype(int)
    latent_score = (
        (is_recent_bind * 2.8) +
        (part_mismatch * 3.5) +
        (high_labor * 1.8) +
        (racing_flag * 2.5) +
        (total_claim > 8000).astype(int) * 1.2 +
        (police_report == 0).astype(int) * 0.8 +
        (is_late_night * 0.9) -
        (months_as_customer > 60).astype(int) * 1.0 - 2.5
    )
    
    prob = 1.0 / (1.0 + np.exp(-latent_score))
    fraud_reported = np.random.binomial(1, prob, size=n_rows)
    
    df = pd.DataFrame({
        "months_as_customer": months_as_customer,
        "policy_bind_to_incident_days": bind_days,
        "policy_deductible": deductible,
        "total_claim_amount": total_claim,
        "vehicle_claim_amount": vehicle_claim,
        "incident_hour": incident_hour,
        "number_of_vehicles_involved": num_vehicles,
        "witnesses": witnesses,
        "police_report_available": police_report,
        "part_mismatch_flag": part_mismatch,
        "high_labor_ratio_flag": high_labor,
        "racing_exclusion_flag": racing_flag,
        "fraud_reported": fraud_reported,
    })
    return df


def train_and_save_model():
    """
    Trains a Gradient Boosting / Random Forest model and saves it.
    """
    from sklearn.ensemble import HistGradientBoostingClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import roc_auc_score, precision_score, recall_score
    import joblib

    data_path = "sample_data/insurance_claims.csv"
    if os.path.exists(data_path):
        print(f"Loading existing dataset from {data_path}...")
        df = pd.read_csv(data_path)
    else:
        print("Auto-generating 1,000-row synthetic auto insurance claims dataset...")
        df = generate_synthetic_claims_dataset(1000)
        df.to_csv(data_path, index=False)
        print(f"Saved dataset to {data_path}")

    X = df[FEATURE_NAMES]
    y = df["fraud_reported"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = HistGradientBoostingClassifier(random_state=42, max_iter=100)
    model.fit(X_train, y_train)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.4).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)

    print(f"Model Training Complete! Test ROC-AUC: {auc:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")

    joblib.dump(model, MODEL_PATH)
    meta = {
        "features": FEATURE_NAMES,
        "test_roc_auc": round(float(auc), 4),
        "test_precision": round(float(precision), 4),
        "test_recall": round(float(recall), 4),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "algorithm": "HistGradientBoostingClassifier"
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Artifacts saved to {MODEL_PATH} and {META_PATH}")
    return model, meta


class FraudPredictor:
    """
    Hybrid ML + Deterministic Rule Fraud Investigator.
    """
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        import joblib
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception as e:
                logger.warning(f"Could not load ML model: {e}")
        else:
            try:
                self.model, _ = train_and_save_model()
            except Exception as e:
                logger.warning(f"Training on first run failed: {e}")

    def evaluate_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combines deterministic SQL red flags with ML probability to calculate 0-100 fraud score.
        """
        rule_flags: List[str] = []
        risk_drivers: List[str] = []
        rule_penalty = 0.0

        # Deterministic Rule 1: Policy bound < 15 days before incident
        bind_days = float(claim_data.get("policy_bind_to_incident_days", 180.0))
        if bind_days <= 15:
            msg = f"POLICY_BOUND_RECENTLY: Policy was bound only {int(bind_days)} days prior to loss date (Threshold <= 15 days)."
            rule_flags.append(msg)
            risk_drivers.append(f"Proximity of policy binding to loss date ({int(bind_days)} days)")
            rule_penalty += 35.0

        # Deterministic Rule 2: Narrative vs Invoice Discrepancy
        if claim_data.get("part_mismatch_flag"):
            msg = "INVOICE_NARRATIVE_MISMATCH: Significant structural parts claimed on invoice that were not reported in narrative."
            rule_flags.append(msg)
            risk_drivers.append("Invoice charges for structural roof/frame replacement while narrative reports minor mirror brush")
            rule_penalty += 40.0

        # Deterministic Rule 3: Street racing flag
        if claim_data.get("racing_exclusion_flag"):
            msg = "EXCLUSION_INDICATOR: Incident narrative indicates vehicle was operated in an unlawful speed contest."
            rule_flags.append(msg)
            risk_drivers.append("Speed contest participation")
            rule_penalty += 20.0

        # ML Model Inference
        features = extract_tabular_features(claim_data)
        ml_prob = 0.15
        if self.model is not None:
            try:
                features_df = pd.DataFrame([features], columns=FEATURE_NAMES)
                probs = self.model.predict_proba(features_df)[0]
                ml_prob = float(probs[1])
            except Exception as e:
                logger.warning(f"ML inference error: {e}")

        # Combined hybrid score (0 to 100)
        ml_score = ml_prob * 100.0
        combined_score = min(100.0, max(ml_score, rule_penalty + (ml_score * 0.5)))
        combined_score = round(combined_score, 1)

        if combined_score < 30.0:
            if not risk_drivers:
                risk_drivers.append("Normal incident timeline and expected repair profile")
            recommendation = "LOW_RISK"
        elif combined_score < 60.0:
            recommendation = "MEDIUM_RISK_ADJUSTER_REVIEW"
        else:
            recommendation = "REFER_SIU"

        return {
            "fraud_risk_score": combined_score,
            "ml_model_probability": round(ml_prob, 4),
            "rule_flags": rule_flags,
            "risk_drivers": risk_drivers,
            "recommendation": recommendation,
        }


fraud_predictor = FraudPredictor()


if __name__ == "__main__":
    train_and_save_model()
