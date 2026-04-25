import pickle
import os

def inspect():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    le_path = os.path.join(base_dir, 'models_ml', 'label_encoder.pkl')
    
    result = []
    
    try:
        with open(le_path, 'rb') as f:
            le = pickle.load(f)
        result.append(f"Label Encoder type: {type(le)}")
        if hasattr(le, 'classes_'):
            result.append(f"Classes: {list(le.classes_)}")
    except Exception as e:
        result.append(f"LE error: {e}")

    print("\n".join(result))

if __name__ == '__main__':
    inspect()

