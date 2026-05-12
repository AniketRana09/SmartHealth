
import sys
import json
import joblib
import pandas as pd
import numpy as np
import os
import traceback
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────
#  Your pkl file structure (heart_disease_model.pkl) contains:
#  {
#    "model"    : RandomForestClassifier,
#    "encoders" : { "Sex": LE, "ChestPainType": LE, ... },
#    "features" or "feature_names" : ["Age","Sex", ...]
#  }
#  NOTE: No separate scaler — Random Forest does not need scaling
# ─────────────────────────────────────────────────────────────

def load_model():
    base_dir   = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'models_ml', 'heart_disease_model.pkl')

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")

    meta     = joblib.load(model_path)

    # Support both key names users may have used
    features = meta.get("feature_names", meta.get("features", []))

    return meta["model"], meta["encoders"], features


def get_info():
    try:
        model, encoders, features = load_model()
        print(json.dumps({"features": features}))
    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))


def predict():
    try:
        # ── Read JSON from stdin ──────────────────────────────
        input_data = sys.stdin.read().strip()
        if not input_data:
            raise ValueError("No input data provided via stdin")

        data = json.loads(input_data)

        # ── Load saved artifacts ──────────────────────────────
        model, encoders, features = load_model()

        # ── Build input DataFrame in correct column order ─────
        input_dict = {f: [data.get(f, 0)] for f in features}
        df = pd.DataFrame(input_dict)

        # ── Apply saved LabelEncoders to categorical columns ──
        cat_cols = ["Sex", "ChestPainType", "RestingECG",
                    "ExerciseAngina", "ST_Slope"]
        for col in cat_cols:
            if col in df.columns and col in encoders:
                try:
                    df[col] = encoders[col].transform(df[col])
                except Exception:
                    df[col] = 0   # unseen value → default to 0

        # ── Make all columns numeric ──────────────────────────
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # ── Predict ───────────────────────────────────────────
        pred       = model.predict(df)[0]
        pred_label = "Positive (High Risk)" if pred == 1 else "Negative (Low Risk)"

        prob = 0.0
        if hasattr(model, "predict_proba"):
            prob = model.predict_proba(df)[0][1]

        result = {
            "prediction"    : str(pred_label),
            "probability"   : f"{prob * 100:.1f}%",
            "risk_level"    : "High" if pred == 1 else "Low",
            "recommendation": (
                "Consult a cardiologist immediately."
                if pred == 1 else
                "Maintain a healthy lifestyle."
            ),
            "note": "Prediction based on Heart Disease ML model (Random Forest).",
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--info":
        get_info()
    else:
        predict()