import warnings
warnings.filterwarnings('ignore')
import sys
import json
import pickle
import numpy as np
import pandas as pd
import os

def log(msg):
    print(f"[DEBUG] {msg}", file=sys.stderr)

def predict():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data provided")

        data = json.loads(input_data)
        selected_symptoms = data.get('symptoms', [])
        log(f"Received symptoms: {selected_symptoms}")

        base_dir = os.path.dirname(os.path.abspath(__file__))
        bundle_path = os.path.join(base_dir, 'models_ml', 'disease_model_bundle.pkl')

        with open(bundle_path, 'rb') as f:
            bundle = pickle.load(f)

        model        = bundle.get('model') or bundle.get('dt')
        le           = bundle.get('label_encoder') or bundle.get('le')
        severity_map = bundle.get('severity_map', {})
        desc_map     = bundle.get('description_map', {})
        prec_map     = bundle.get('precaution_map', {})

        # Build input vector using severity weights
        input_vector = [0] * 17
        for i, s in enumerate(selected_symptoms):
            if i < 17:
                input_vector[i] = severity_map.get(s.strip(), 0)

        log(f"Input vector: {input_vector}")

        # KEY FIX: use named DataFrame columns so model recognizes features
        columns = [f"Symptom_{i+1}" for i in range(17)]
        input_df = pd.DataFrame([input_vector], columns=columns)

        # Predict
        raw_pred = model.predict(input_df)[0]
        log(f"Raw prediction: {raw_pred}")

        final_disease = le.inverse_transform([raw_pred])[0] if hasattr(le, 'inverse_transform') else str(raw_pred)
        log(f"Final disease: {final_disease}")

        description = desc_map.get(final_disease, "No description available")
        precautions = prec_map.get(final_disease, ["Not available"])
        if isinstance(precautions, str):
            precautions = [precautions]

        prob_str = "N/A"
        if hasattr(model, "predict_proba"):
            try:
                probs = model.predict_proba(input_df)[0]
                prob_str = f"{max(probs) * 100:.2f}%"
            except Exception:
                pass

        result = {
            "prediction": final_disease,
            "probability": prob_str,
            "description": description,
            "precautions": precautions,
            "note": "AI prediction is based on generalized symptoms."
        }

        import math
        def clean_data(obj):
            if isinstance(obj, (int, float)) and math.isnan(obj):
                return None
            elif isinstance(obj, list):
                return [clean_data(v) for v in obj if not (isinstance(v, (int, float)) and math.isnan(v))]
            elif isinstance(obj, dict):
                return {k: clean_data(v) for k, v in obj.items()}
            return obj

        print(json.dumps(clean_data(result)))

    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))
        sys.exit(0)

def get_info():
    """Returns symptom list for the frontend dropdown."""
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bundle_path = os.path.join(base_dir, 'models_ml', 'disease_model_bundle.pkl')

        with open(bundle_path, 'rb') as f:
            bundle = pickle.load(f)

        severity_map = bundle.get('severity_map', {})
        symptoms = [str(k) for k in severity_map.keys() if isinstance(k, str) and str(k).strip() != 'nan' and str(k).strip() != 'NaN']
        symptoms = sorted(symptoms)
        print(json.dumps({"symptoms": symptoms}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--info':
        get_info()
    else:
        predict()