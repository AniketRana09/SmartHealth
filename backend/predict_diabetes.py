import sys
import json
import pickle
import pandas as pd
import os

def predict():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data provided")
        
        data = json.loads(input_data)
        
        # Base directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, 'models_ml')
        
        # Load scaler and model
        try:
            with open(os.path.join(models_dir, 'scaler.pkl'), 'rb') as f:
                scaler = pickle.load(f)
            with open(os.path.join(models_dir, 'diabetes_model.pkl'), 'rb') as f:
                model = pickle.load(f)
        except Exception as e:
            print(json.dumps({"error": f"Failed to load models: {str(e)}"}))
            sys.exit(1)
            
        # Parse inputs
        # Expected inputs from JSON
        # { "gender": 0/1, "age": int, "hypertension": 0/1, "heart_disease": 0/1,
        #   "bmi": float, "HbA1c_level": float, "blood_glucose_level": float,
        #   "smoking_history": "never" } 
        
        gender = int(data.get('gender', 0))
        age = float(data.get('age', 0.0))
        hypertension = int(data.get('hypertension', 0))
        heart_disease = int(data.get('heart_disease', 0))
        bmi = float(data.get('bmi', 0.0))
        hba1c = float(data.get('HbA1c_level', 0.0))
        glucose = float(data.get('blood_glucose_level', 0.0))
        smoking = data.get('smoking_history', 'No Info')
        
        # One hot encode smoking
        smoking_categories = ['No Info', 'current', 'ever', 'former', 'never', 'not current']
        smoking_encoded = {f'smoking_history_{cat}': 1 if cat == smoking else 0 for cat in smoking_categories}
        
        # Create DataFrame mimicking the required input
        feature_dict = {
            'gender': [gender],
            'age': [age],
            'hypertension': [hypertension],
            'heart_disease': [heart_disease],
            'bmi': [bmi],
            'HbA1c_level': [hba1c],
            'blood_glucose_level': [glucose]
        }
        
        # Add smoking encoded to dict
        for k, v in smoking_encoded.items():
            feature_dict[k] = [v]
            
        # Order the columns exactly as the model expects
        feature_names = [
            'gender', 'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level',
            'blood_glucose_level', 'smoking_history_No Info', 'smoking_history_current',
            'smoking_history_ever', 'smoking_history_former', 'smoking_history_never',
            'smoking_history_not current'
        ]
        
        df = pd.DataFrame(feature_dict, columns=feature_names)
        
        # Scale the 3 numerical columns
        numerical_cols = ['age', 'bmi', 'blood_glucose_level']
        # Extract subset as dataframe to allow scaler to recognize names
        df_num = df[numerical_cols]
        df_num_scaled = scaler.transform(df_num)
        
        # Replace unscaled ones with scaled ones
        df.loc[:, numerical_cols] = df_num_scaled
        
        # Predict
        prediction_arr = model.predict(df)
        prediction_prob = model.predict_proba(df)
        
        pred = int(prediction_arr[0])
        prob = float(prediction_prob[0][1])  # Prob of class 1 (Diabetes)
        
        result = {
            "prediction": "Positive for Diabetes Risk" if pred == 1 else "Negative for Diabetes Risk",
            "probability": f"{prob * 100:.2f}%",
            "risk_level": "High" if prob > 0.6 else "Moderate" if prob > 0.3 else "Low",
            "recommendation": "Consult with a healthcare professional immediately." if pred == 1 else "Maintain a healthy lifestyle.",
            "note": "AI prediction based on clinical dataset."
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    predict()
