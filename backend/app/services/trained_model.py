"""
train_model.py
─────────────────────────────────────────────────────────────────────────────
Trains a Random Forest ensemble on the enriched crop dataset.

Features used
─────────────
Numeric  : nitrogen, phosphorus, potassium, temperature, humidity,
           rainfall, soil_pH, moisture, field_size_acres
Encoded  : soil_type (OrdinalEncoder), crop_category (OrdinalEncoder)

Pipeline : ColumnTransformer → StandardScaler+OrdinalEncoder → RandomForest

Outputs (all to ../models/)
────────────────────────────
  crop_model.pkl       — trained sklearn Pipeline
  label_encoder.pkl    — LabelEncoder for recommended_crop
  encoders.pkl         — OrdinalEncoders for soil_type, crop_category
  model_metadata.json  — accuracy, cv scores, feature importances
"""

import json
import pickle
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder, StandardScaler

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────
BASE     = Path(__file__).parent
MODELS   = BASE.parent / "models"
MODELS.mkdir(exist_ok=True)

AUG_CSV       = BASE / "crop_augmented.csv"
ENRICHED_CSV  = BASE / "crop_enriched.csv"

MODEL_PATH    = MODELS / "crop_model.pkl"
ENCODER_PATH  = MODELS / "label_encoder.pkl"
ENCODERS_PATH = MODELS / "encoders.pkl"
META_PATH     = MODELS / "model_metadata.json"

NUM_FEATURES = [
    "nitrogen", "phosphorus", "potassium",
    "temperature", "humidity", "rainfall",
    "soil_pH", "moisture", "field_size_acres",
]
CAT_FEATURES = ["soil_type", "crop_category"]
ALL_FEATURES  = NUM_FEATURES + CAT_FEATURES


def banner(msg: str) -> None:
    print(f"\n{'─'*62}\n  {msg}\n{'─'*62}")


def load_data():
    csv = AUG_CSV if AUG_CSV.exists() else ENRICHED_CSV
    if not csv.exists():
        raise FileNotFoundError(
            f"Dataset not found at {csv}. Run enrich_dataset.py first."
        )
    df = pd.read_csv(csv)
    print(f"  Loaded: {len(df):,} rows, {df['recommended_crop'].nunique()} crops  ← {csv.name}")
    return df


def build_pipeline(soil_cats: list, category_cats: list) -> tuple:
    """Returns (pipeline, label_encoder, cat_encoders_dict)"""

    soil_enc = OrdinalEncoder(
        categories=[soil_cats],
        handle_unknown="use_encoded_value",
        unknown_value=-1,
    )
    cat_enc = OrdinalEncoder(
        categories=[category_cats],
        handle_unknown="use_encoded_value",
        unknown_value=-1,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num",  StandardScaler(),                  NUM_FEATURES),
            ("soil", soil_enc,                          ["soil_type"]),
            ("cat",  cat_enc,                           ["crop_category"]),
        ],
        remainder="drop",
    )

    clf = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        bootstrap=True,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("clf",          clf),
    ])

    encoders = {
        "soil_type":     soil_cats,
        "crop_category": category_cats,
    }
    return pipeline, encoders


def train():
    banner("Loading data")
    df = load_data()

    # ── Encode target ──────────────────────────────────────────────────────
    le_crop = LabelEncoder()
    y = le_crop.fit_transform(df["recommended_crop"])
    X = df[ALL_FEATURES]

    n_classes = len(le_crop.classes_)
    print(f"  Classes ({n_classes}): {', '.join(le_crop.classes_)}")

    # ── Category values ────────────────────────────────────────────────────
    soil_cats     = sorted(df["soil_type"].unique().tolist())
    category_cats = sorted(df["crop_category"].unique().tolist())

    # ── Train / test split ─────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    # ── Build & train ──────────────────────────────────────────────────────
    banner("Training Random Forest pipeline")
    pipeline, cat_encoders = build_pipeline(soil_cats, category_cats)
    t0 = time.time()
    pipeline.fit(X_train, y_train)
    elapsed = time.time() - t0
    print(f"  Trained in {elapsed:.1f}s")

    # ── Evaluate ───────────────────────────────────────────────────────────
    banner("Evaluation — held-out test set")
    y_pred = pipeline.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    print(f"\n  🎯  Test Accuracy : {acc * 100:.4f}%\n")
    print(classification_report(
        y_test, y_pred,
        target_names=le_crop.classes_,
        digits=4,
    ))

    # ── 5-fold Cross-validation ────────────────────────────────────────────
    banner("5-fold Stratified Cross-Validation")
    cv_pipe, _ = build_pipeline(soil_cats, category_cats)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(cv_pipe, X, y, cv=cv, scoring="accuracy", n_jobs=-1)
    print(f"  Fold scores : {[f'{s*100:.2f}%' for s in scores]}")
    print(f"  Mean        : {scores.mean()*100:.4f}%  ± {scores.std()*100:.4f}%")

    # ── Feature importances ────────────────────────────────────────────────
    rf_clf = pipeline.named_steps["clf"]
    feature_names = (
        NUM_FEATURES
        + [f"soil_type_enc"]
        + [f"crop_category_enc"]
    )
    fi = dict(zip(feature_names, rf_clf.feature_importances_.tolist()))
    fi_ranked = sorted(fi.items(), key=lambda x: x[1], reverse=True)
    print("\n  Feature importances:")
    for feat, imp in fi_ranked:
        bar = "█" * int(imp * 50)
        print(f"    {feat:<22} {imp:.4f}  {bar}")

    # ── Save artefacts ─────────────────────────────────────────────────────
    banner("Saving model artefacts")
    with open(MODEL_PATH,    "wb") as f: pickle.dump(pipeline,   f)
    with open(ENCODER_PATH,  "wb") as f: pickle.dump(le_crop,    f)
    with open(ENCODERS_PATH, "wb") as f: pickle.dump(cat_encoders, f)

    metadata = {
        "model":           "RandomForestClassifier (500 trees)",
        "n_classes":       n_classes,
        "classes":         le_crop.classes_.tolist(),
        "features_num":    NUM_FEATURES,
        "features_cat":    CAT_FEATURES,
        "soil_types":      soil_cats,
        "crop_categories": category_cats,
        "test_accuracy":   round(float(acc), 6),
        "cv_mean":         round(float(scores.mean()), 6),
        "cv_std":          round(float(scores.std()),  6),
        "feature_importance": {k: round(v, 6) for k, v in fi_ranked},
        "train_rows":      int(len(X_train)),
        "test_rows":       int(len(X_test)),
    }
    with open(META_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"  crop_model.pkl       → {MODEL_PATH}")
    print(f"  label_encoder.pkl    → {ENCODER_PATH}")
    print(f"  encoders.pkl         → {ENCODERS_PATH}")
    print(f"  model_metadata.json  → {META_PATH}")

    banner(f"✅  Done — test accuracy: {acc * 100:.4f}%  |  CV mean: {scores.mean()*100:.4f}%")
    return pipeline, le_crop, metadata


if __name__ == "__main__":
    train()