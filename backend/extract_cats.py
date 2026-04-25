import sys, pickle, json, os

import sklearn.compose._column_transformer
if not hasattr(sklearn.compose._column_transformer, '_RemainderColsList'):
    class _RemainderColsList(list): pass
    sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList

try:
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models_ml')
    with open(os.path.join(models_dir, 'preprocessor.pkl'), 'rb') as f:
        preprocessor = pickle.load(f)
    
    cats = {}
    if hasattr(preprocessor, 'transformers_'):
        for name, transformer, columns in preprocessor.transformers_:
            if hasattr(transformer, 'categories_'):
                cats[str(columns)] = [list(c) for c in transformer.categories_]
            elif hasattr(transformer, 'named_steps'):
                for step_name, step in transformer.named_steps.items():
                    if hasattr(step, 'categories_'):
                        cats[str(columns)] = [list(c) for c in step.categories_]
    
    with open('categories.json', 'w') as f:
        json.dump(cats, f)
    print("Categories extracted to categories.json")
except Exception as e:
    import traceback
    with open('categories_error.txt', 'w') as f:
        f.write(traceback.format_exc())
    print("Error")
