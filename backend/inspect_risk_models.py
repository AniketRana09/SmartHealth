import warnings
warnings.filterwarnings('ignore')
import pickle, os, sys, traceback

def main():
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models_ml')
    out = []

    # Model
    try:
        with open(os.path.join(base, 'random_forest_model.pkl'), 'rb') as f:
            model = pickle.load(f)
        out.append("=== RANDOM FOREST MODEL ===")
        out.append("Type: " + str(type(model)))
        if hasattr(model, 'n_features_in_'):
            out.append("n_features_in_: " + str(model.n_features_in_))
        if hasattr(model, 'feature_names_in_'):
            out.append("feature_names_in_: " + str(list(model.feature_names_in_)))
        if hasattr(model, 'classes_'):
            out.append("classes_: " + str(list(model.classes_)))
            out.append("n_classes: " + str(len(model.classes_)))
    except Exception as e:
        out.append("MODEL ERROR: " + str(e))

    # Preprocessor
    try:
        with open(os.path.join(base, 'preprocessor.pkl'), 'rb') as f:
            preprocessor = pickle.load(f)
        out.append("\n=== PREPROCESSOR ===")
        out.append("Type: " + str(type(preprocessor)))
        if hasattr(preprocessor, 'feature_names_in_'):
            out.append("feature_names_in_: " + str(list(preprocessor.feature_names_in_)))
    except Exception as e:
        out.append("\nPREPROCESSOR ERROR: " + str(e))

    # Label Encoder
    try:
        with open(os.path.join(base, 'label_encoder.pkl'), 'rb') as f:
            le = pickle.load(f)
        out.append("\n=== LABEL ENCODER ===")
        out.append("Type: " + str(type(le)))
        if hasattr(le, 'classes_'):
            out.append("classes_: " + str(list(le.classes_)))
    except Exception as e:
        out.append("\nLE ERROR: " + str(e))

    import sklearn
    out.append("\nsklearn version: " + sklearn.__version__)

    result = "\n".join(out)
    print(result)

if __name__ == '__main__':
    main()
