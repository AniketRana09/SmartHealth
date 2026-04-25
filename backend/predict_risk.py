import sys
import json
import pickle
import pandas as pd
import numpy as np
import os
import traceback
import warnings
warnings.filterwarnings('ignore')

# Patch for older sklearn preprocessor (scikit-learn < 1.2 compatibility in 1.8+)
import sklearn.compose._column_transformer
if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
    class _RemainderColsList(list): pass
    sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList

def load_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models_ml')
    
    preprocessor = None
    model = None
    le = None
    
    try:
        with open(os.path.join(models_dir, 'preprocessor.pkl'), 'rb') as f:
            preprocessor = pickle.load(f)
    except Exception as e:
        pass # Optional
        
    try:
        with open(os.path.join(models_dir, 'random_forest_model.pkl'), 'rb') as f:
            model = pickle.load(f)
    except Exception as e:
        pass
        
    try:
        with open(os.path.join(models_dir, 'label_encoder.pkl'), 'rb') as f:
            le = pickle.load(f)
    except Exception as e:
        pass
        
    return preprocessor, model, le

def get_info():
    try:
        preprocessor, model, le = load_models()
        features = []
        if preprocessor is not None and hasattr(preprocessor, 'feature_names_in_'):
            features = [str(f) for f in preprocessor.feature_names_in_]
        elif model is not None and hasattr(model, 'feature_names_in_'):
            features = [str(f) for f in model.feature_names_in_]
            
        if not features:
            # Fallback 17 features (hypothetical)
            features = [
                'age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 
                'cholesterol', 'gluc', 'smoke', 'alco', 'active', 
                'bmi', 'heart_rate', 'glucose_level', 'hypertension',
                'heart_disease', 'diabetes'
            ][:17]
            
        # Removed categories.json writing to prevent nodemon reload
        print(json.dumps({"features": features}))
    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

def predict():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data provided")
            
        data = json.loads(input_data)
        
        preprocessor, model, le = load_models()
        
        if model is None:
            raise ValueError("Random Forest model could not be loaded.")
            
        features = []
        if preprocessor is not None and hasattr(preprocessor, 'feature_names_in_'):
            features = list(preprocessor.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            features = list(model.feature_names_in_)
            
        if not features:
            features = [
                'age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 
                'cholesterol', 'gluc', 'smoke', 'alco', 'active', 
                'bmi', 'heart_rate', 'glucose_level', 'hypertension',
                'heart_disease', 'diabetes'
            ][:17]
            
        # Build DataFrame
        input_dict = {}
        provided_factors = []
        for f in features:
            val = data.get(f, 0)
            try:
                val = float(val)
            except:
                pass
            input_dict[f] = [val]
            if str(val) != '0' and str(val) != '0.0' and str(val) != '':
                provided_factors.append(f"{f}: {val}")

        df = pd.DataFrame(input_dict)
        
        if preprocessor is not None:
            try:
                X = preprocessor.transform(df)
            except Exception as e:
                X = df
        else:
            X = df
            
        pred = model.predict(X)[0]
        
        if le is not None and hasattr(le, 'inverse_transform'):
            pred_label = le.inverse_transform([pred])[0]
        else:
            pred_label = "High" if pred == 1 else "Low"
            
        prob = 0.0
        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(X)[0]
            prob = max(probs)
            
        result = {
            "overall_risk": str(pred_label).capitalize(),
            "factors": provided_factors if provided_factors else ["Model evaluated " + str(len(features)) + " factors"],
            "note": "Risk analyzed by Random Forest ML model.",
            "probability": f"{prob*100:.1f}%"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--info':
        get_info()
    else:
        predict()
