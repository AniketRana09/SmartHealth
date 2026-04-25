import pickle
import sys

def inspect_model(model_path):
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
            print(f"Model: {type(model)}")
            if hasattr(model, 'n_features_in_'):
                print(f"n_features_in_: {model.n_features_in_}")
            if hasattr(model, 'feature_names_in_'):
                print(f"feature_names_in_: {model.feature_names_in_}")
    except Exception as e:
        print(f"Error reading model: {e}")

if __name__ == '__main__':
    inspect_model(sys.argv[1])
