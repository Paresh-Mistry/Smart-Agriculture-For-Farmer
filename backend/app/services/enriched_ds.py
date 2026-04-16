import os
import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_CSV = os.path.join(BASE_DIR, "data", "crop_recommendation_5000.csv")
OUT_DIR = Path(__file__).parent
OUT_ENRICHED  = OUT_DIR / "crop_enriched.csv"
OUT_AUGMENTED = OUT_DIR / "crop_augmented.csv"

# ─── Agronomic profiles per crop ──────────────────────────────────────────
# (N_mu, N_sd, P_mu, P_sd, K_mu, K_sd,
#  temp_mu, temp_sd, hum_mu, hum_sd,
#  pH_mu, pH_sd, rain_mu, rain_sd, moisture_mu, moisture_sd)
#
# Sources: ICAR Handbook of Agriculture (9th ed.), FAO Irrigation & Drainage
# Paper 33, Kaggle "Crop Recommendation Dataset" (Atharva Ingle).

PROFILES: dict[str, tuple] = {
    # ── Pulses ────────────────────────────────────────────────────────────
    "Lentil": (
        18,  5,   69,  7,   19,  5,    # Low N, high P, low K
        24,  3,   64,  6,              # Mild temp, moderate humidity
        6.5, 0.3, 48,  12, 45,  8,    # Near-neutral pH, low rain, moderate moisture
    ),
    "Black Gram": (
        40,  7,   70,  7,   20,  5,
        28,  3,   85,  6,              # Hot + high humidity (kharif pulse)
        6.5, 0.3, 95,  15, 60,  8,
    ),
    "Chickpea": (
        40,  7,   67,  7,   80,  8,    # High K — distinguishing feature
        19,  3,   16,  5,              # Cool + very dry (rabi, dryland)
        5.8, 0.3, 73,  12, 30,  7,
    ),
    "Moong": (
        20,  5,   40,  6,   20,  5,
        29,  3,   85,  6,              # Hot + high humidity
        6.5, 0.3, 48,  10, 62,  8,
    ),
    "Red Gram": (
        20,  5,   67,  7,   20,  5,    # Similar to Pigeonpea
        29,  3,   49,  6,              # Hot + moderate humidity
        5.7, 0.3, 148, 18, 42,  8,
    ),
    # ── Vegetables ────────────────────────────────────────────────────────
    "Beans": (
        32,  7,   42,  7,   35,  6,
        20,  3,   75,  7,              # Cool + humid
        6.0, 0.3, 110, 15, 58,  8,
    ),
    "Cabbage": (
        40,  7,   60,  7,   40,  6,
        16,  2,   85,  6,              # Cold + humid — most distinctive temp
        6.5, 0.3, 143, 18, 70,  8,
    ),
    "Carrot": (
        20,  5,   45,  7,   35,  6,    # Low N
        19,  3,   75,  6,
        6.2, 0.3, 120, 15, 55,  8,
    ),
    "Onion": (
        55,  7,   55,  7,   65,  7,    # High K relative to other vegetables
        22,  3,   65,  6,
        6.5, 0.3, 77,  12, 48,  8,
    ),
    "Potato": (
        47,  7,   55,  7,   59,  7,
        19,  3,   82,  6,              # Cool + high humidity
        5.9, 0.3, 130, 15, 65,  8,
    ),
    "Spinach": (
        60,  8,   40,  6,   45,  6,    # High N, low P
        14,  2,   80,  6,              # Coldest vegetable
        6.8, 0.3, 175, 18, 60,  8,
    ),
    "Tomato": (
        18,  5,   15,  4,   20,  5,    # Very low NPK — most distinctive
        24,  3,   72,  6,
        6.0, 0.3, 111, 15, 52,  8,
    ),
    # ── Fruits ────────────────────────────────────────────────────────────
    "Apple": (
        21,  5,   134, 9,   200, 10,   # Very high P & K — most distinctive
        22,  3,   92,  6,              # Cool + high humidity
        5.8, 0.3, 114, 15, 50,  8,
    ),
    "Banana": (
       100,  9,   75,  8,   50,  7,    # Highest N — most distinctive feature
        27,  3,   80,  6,
        6.0, 0.3, 105, 15, 68,  8,
    ),
    "Grapes": (
        23,  5,   125, 9,   200, 10,   # Very high P & K (same as Apple signature)
        24,  3,   82,  6,
        6.0, 0.3, 69,  12, 45,  8,    # Distinctly lower rainfall
    ),
    "Guava": (
        35,  7,   40,  7,   40,  6,
        29,  3,   78,  6,
        6.0, 0.3, 95,  15, 55,  8,
    ),
    "Mango": (
        20,  5,   27,  6,   30,  6,    # Low NPK + hot
        31,  2,   50,  6,              # Hottest + driest fruit
        5.7, 0.3, 94,  15, 35,  7,
    ),
    "Orange": (
        30,  6,   40,  6,   40,  6,
        22,  3,   68,  6,
        6.0, 0.3, 115, 15, 55,  8,
    ),
}

FEATURE_COLS = [
    "nitrogen", "phosphorus", "potassium",
    "temperature", "humidity",
    "soil_pH", "rainfall", "moisture",
]

SOIL_PREFERRED: dict[str, list[str]] = {
    "Apple":      ["Loamy", "Sandy", "Alluvial"],
    "Banana":     ["Alluvial", "Loamy", "Clay"],
    "Beans":      ["Loamy", "Alluvial", "Clay"],
    "Black Gram": ["Alluvial", "Loamy", "Clay"],
    "Cabbage":    ["Loamy", "Clay", "Alluvial"],
    "Carrot":     ["Sandy", "Loamy", "Alluvial"],
    "Chickpea":   ["Sandy", "Loamy", "Red"],
    "Grapes":     ["Sandy", "Loamy", "Black"],
    "Guava":      ["Loamy", "Alluvial", "Red"],
    "Lentil":     ["Loamy", "Sandy", "Alluvial"],
    "Mango":      ["Red", "Sandy", "Alluvial"],
    "Moong":      ["Alluvial", "Loamy", "Clay"],
    "Onion":      ["Loamy", "Sandy", "Alluvial"],
    "Orange":     ["Loamy", "Alluvial", "Sandy"],
    "Potato":     ["Loamy", "Sandy", "Alluvial"],
    "Red Gram":   ["Black", "Red", "Alluvial"],
    "Spinach":    ["Loamy", "Alluvial", "Clay"],
    "Tomato":     ["Loamy", "Sandy", "Red"],
}

CROP_CATEGORY: dict[str, str] = {
    "Apple": "Fruits",     "Banana": "Fruits",  "Grapes": "Fruits",
    "Guava": "Fruits",     "Mango":  "Fruits",  "Orange": "Fruits",
    "Beans": "Vegetables", "Cabbage":"Vegetables","Carrot":"Vegetables",
    "Onion": "Vegetables", "Potato": "Vegetables","Spinach":"Vegetables",
    "Tomato":"Vegetables",
    "Black Gram":"Pulses", "Chickpea":"Pulses",  "Lentil":"Pulses",
    "Moong":"Pulses",      "Red Gram":"Pulses",
}

CITIES = [
    "Kolkata","Hyderabad","Mumbai","Indore","Patna","Nashik",
    "Delhi","Bhopal","Bangalore","Lucknow","Pune","Ahmedabad",
    "Chennai","Nagpur","Jaipur",
]

ALL_SOILS = ["Alluvial","Sandy","Red","Clay","Black","Loamy"]


def sample_crop(crop: str, n: int, rng: np.random.Generator) -> pd.DataFrame:
    p = PROFILES[crop]
    (n_mu,n_sd, p_mu,p_sd, k_mu,k_sd,
     t_mu,t_sd, h_mu,h_sd,
     ph_mu,ph_sd, r_mu,r_sd, m_mu,m_sd) = p

    def clip(arr, lo, hi): return np.clip(arr, lo, hi)

    N    = np.round(clip(rng.normal(n_mu,  n_sd,  n),   0,  200), 1)
    P    = np.round(clip(rng.normal(p_mu,  p_sd,  n),   0,  150), 1)
    K    = np.round(clip(rng.normal(k_mu,  k_sd,  n),   0,  210), 1)
    temp = np.round(clip(rng.normal(t_mu,  t_sd,  n),  10,   45), 1).astype(int)
    hum  = np.round(clip(rng.normal(h_mu,  h_sd,  n),  10,  100), 1).astype(int)
    ph   = np.round(clip(rng.normal(ph_mu, ph_sd, n), 3.0,  10.0), 2)
    rain = np.round(clip(rng.normal(r_mu,  r_sd,  n),  15,  300), 1).astype(int)
    mois = np.round(clip(rng.normal(m_mu,  m_sd,  n),  15,   85), 1).astype(int)

    # Preferred soil 70%, random 30%
    pref = SOIL_PREFERRED.get(crop, ALL_SOILS)
    soils = np.where(
        rng.random(n) < 0.70,
        rng.choice(pref, n),
        rng.choice(ALL_SOILS, n),
    )

    # Field size uniform 1–10 acres
    field = np.round(rng.uniform(1.0, 10.0, n), 2)
    cities = rng.choice(CITIES, n)

    return pd.DataFrame({
        "city":            cities,
        "soil_type":       soils,
        "field_size_acres":field,
        "crop_category":   CROP_CATEGORY[crop],
        "temperature":     temp,
        "humidity":        hum,
        "rainfall":        rain,
        "soil_pH":         ph,
        "nitrogen":        N,
        "phosphorus":      P,
        "potassium":       K,
        "moisture":        mois,
        "recommended_crop":crop,
    })


def enrich_original(df_orig: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    Replace numeric features in the original dataset with agronomically
    correct values while keeping all structural columns (city, soil_type,
    field_size_acres, crop_category, recommended_crop) intact.
    """
    rows = []
    for crop, group in df_orig.groupby("recommended_crop"):
        n = len(group)
        enriched = sample_crop(crop, n, rng)
        # Restore original structural columns
        enriched["city"]             = group["city"].values
        enriched["soil_type"]        = group["soil_type"].values
        enriched["field_size_acres"] = group["field_size_acres"].values
        rows.append(enriched)
    return pd.concat(rows, ignore_index=True).sample(frac=1, random_state=42).reset_index(drop=True)


def build_augmented(df_enriched: pd.DataFrame, synthetic_per_crop: int, rng: np.random.Generator) -> pd.DataFrame:
    """Add fully synthetic rows to boost training set size."""
    crops = sorted(df_enriched["recommended_crop"].unique())
    parts = [df_enriched]
    for crop in crops:
        parts.append(sample_crop(crop, synthetic_per_crop, rng))
    aug = pd.concat(parts, ignore_index=True).sample(frac=1, random_state=99).reset_index(drop=True)
    return aug


if __name__ == "__main__":
    rng = np.random.default_rng(42)
    df_orig = pd.read_csv(SRC_CSV)

    print(f"Original dataset: {len(df_orig):,} rows, {df_orig['recommended_crop'].nunique()} crops")

    # 1. Enrich original
    df_enriched = enrich_original(df_orig, rng)
    df_enriched.to_csv(OUT_ENRICHED, index=False)
    print(f"✅  Enriched  → {OUT_ENRICHED}  ({len(df_enriched):,} rows)")

    # 2. Add 500 synthetic rows per crop (18 × 500 = 9,000 extra)
    df_aug = build_augmented(df_enriched, synthetic_per_crop=500, rng=rng)
    df_aug.to_csv(OUT_AUGMENTED, index=False)
    print(f"✅  Augmented → {OUT_AUGMENTED}  ({len(df_aug):,} rows)")

    # Quick sanity check
    print("\nPer-crop feature means (enriched):")
    cols = ["nitrogen","phosphorus","potassium","temperature","humidity","rainfall","soil_pH","moisture"]
    print(df_enriched.groupby("recommended_crop")[cols].mean().round(1).to_string())