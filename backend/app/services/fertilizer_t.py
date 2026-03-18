import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "fertilizer.csv")

df = pd.read_csv(DATA_PATH)

# ---------------------------
# CROP RECOMMENDATION MODEL
# ---------------------------
X_crop = df[[
    "Nitrogen", "Phosphorus", "Potassium",
    "Temperature", "Humidity", "pH_Value", "Rainfall"
]]

y_crop = df["Crop"]

X_train, X_test, y_train, y_test = train_test_split(
    X_crop, y_crop, test_size=0.2, random_state=42
)

crop_model = RandomForestClassifier()
crop_model.fit(X_train, y_train)
crop_accuracy = accuracy_score(y_test, crop_model.predict(X_test))

joblib.dump(crop_model, "crop_model.pkl")

# ---------------------------
# FERTILIZER RECOMMENDATION
# ---------------------------

def recommend_fertilizer(row):
    if row["Nitrogen"] < 50:
        return "Urea"
    elif row["Phosphorus"] < 50:
        return "DAP"
    elif row["Potassium"] < 50:
        return "MOP"
    else:
        return "NPK Balanced"

df["Fertilizer"] = df.apply(recommend_fertilizer, axis=1)

X_fert = X_crop
y_fert = df["Fertilizer"]

X_train, X_test, y_train, y_test = train_test_split(
    X_fert, y_fert, test_size=0.2, random_state=42
)

fert_model = RandomForestClassifier()
fert_model.fit(X_train, y_train)

joblib.dump(fert_model, "fertilizer_model.pkl")

fert_accuracy = accuracy_score(y_test, fert_model.predict(X_test))

print("Models Trained & Saved ✅")
print(f"Crop Recommendation Accuracy: {crop_accuracy:.2f}")
print(f"Fertilizer Recommendation Accuracy: {fert_accuracy:.2f}")
