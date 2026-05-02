import sys
import json
import joblib
import pandas as pd
import numpy as np
import os
import traceback
import warnings
warnings.filterwarnings('ignore')

def load_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models_ml')
    
    scaler = None
    model = None
    errors = []
    
    try:
        scaler = joblib.load(os.path.join(models_dir, 'scaler (1).pkl'))
    except Exception as e:
        errors.append(f"SCALER ERROR: {e}")
        
    try:
        model = joblib.load(os.path.join(models_dir, 'logistic_regression_heart_disease.pkl'))
    except Exception as e:
        errors.append(f"MODEL ERROR: {e}")
        
    return scaler, model, errors

def get_info():
    try:
        scaler, model, errors = load_models()
        features = []
        if scaler is not None and hasattr(scaler, 'feature_names_in_'):
            features = [str(f) for f in scaler.feature_names_in_]
        elif model is not None and hasattr(model, 'feature_names_in_'):
            features = [str(f) for f in model.feature_names_in_]
            
        if not features:
            features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
            
        print(json.dumps({"features": features}))
    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

def predict():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data provided")
            
        data = json.loads(input_data)
        
        scaler, model, errors = load_models()
        
        if model is None:
            raise ValueError(f"Logistic Regression Heart Disease model could not be loaded. Details: { ' | '.join(errors) }")
            
        features = []
        if scaler is not None and hasattr(scaler, 'feature_names_in_'):
            features = list(scaler.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            features = list(model.feature_names_in_)
            
        if not features:
            features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
            
        # Build DataFrame
        input_dict = {}
        for f in features:
            val = data.get(f, 0)
            try:
                val = float(val)
            except:
                pass
            input_dict[f] = [val]

        df = pd.DataFrame(input_dict)
        
        if scaler is not None:
            try:
                X = scaler.transform(df)
            except Exception as e:
                X = df
        else:
            X = df
            
        pred = model.predict(X)[0]
        
        pred_label = "Positive (High Risk)" if pred == 1 else "Negative (Low Risk)"
            
        prob = 0.0
        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(X)[0]
            prob =probs[1]
            
        result = {
            "prediction": str(pred_label),
            "probability": f"{prob*100:.1f}%",
            "risk_level": "High" if pred == 1 else "Low",
            "recommendation": "Consult a cardiologist immediately." if pred == 1 else "Maintain a healthy lifestyle.",
            "note": "Prediction based on Logistic Regression ML model."
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--info':
        get_info()
    else:
        predict()
