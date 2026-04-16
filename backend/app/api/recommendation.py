from __future__ import annotations

import json
import pickle
import warnings
from functools import lru_cache
from pathlib import Path
from typing import Literal, Optional
import os
import numpy as np
import pandas as pd
from typing import List
import re
import logging
import google.generativeai as genai
import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator, model_validator

warnings.filterwarnings("ignore")
logger = logging.getLogger(__name__)

# ── Model paths ────────────────────────────────────────────────────────────
_BASE         = Path(__file__).resolve().parents[2]   # project root
MODEL_PATH    = _BASE/ "app" / "services" / "data" / "crop_model.pkl"
ENCODER_PATH  = _BASE / "app" / "services" / "data" / "label_encoder.pkl"
ENCODERS_PATH = _BASE / "app" / "services" / "data" / "encoders.pkl"
META_PATH     = _BASE / "app" / "services" / "data" / "model_metadata.json"

NUM_FEATURES = [
    "nitrogen", "phosphorus", "potassium",
    "temperature", "humidity", "rainfall",
    "soil_pH", "moisture", "field_size_acres",
]
CAT_FEATURES = ["soil_type", "crop_category"]


# ── Lazy-loaded model artefacts ────────────────────────────────────────────
@lru_cache(maxsize=1)
def _load_artefacts():
    missing = [p for p in [MODEL_PATH, ENCODER_PATH, ENCODERS_PATH] if not p.exists()]
    if missing:
        raise RuntimeError(
            f"Model artefacts not found: {[str(p) for p in missing]}. "
            "Run `python ml/enrich_dataset.py` then `python ml/train_model.py` first."
        )
    with open(MODEL_PATH,    "rb") as f: model       = pickle.load(f)
    with open(ENCODER_PATH,  "rb") as f: le_crop     = pickle.load(f)
    with open(ENCODERS_PATH, "rb") as f: cat_enc_map = pickle.load(f)
    metadata: dict = {}
    if META_PATH.exists():
        with open(META_PATH) as f: metadata = json.load(f)
    return model, le_crop, cat_enc_map, metadata


# ── Pydantic schemas ───────────────────────────────────────────────────────

SoilType      = Literal["Alluvial", "Sandy", "Red", "Clay", "Black", "Loamy"]
CropCategory  = Literal["Fruits", "Vegetables", "Pulses"]


class RecommendInput(BaseModel):
    """
    Soil, weather, and field parameters for crop recommendation.
    All numeric values should reflect real field measurements.
    """

    # ── Numeric features ──────────────────────────────────────────────────
    nitrogen:         float = Field(..., ge=0,    le=200,  description="Soil nitrogen content (kg/ha)")
    phosphorus:       float = Field(..., ge=0,    le=150,  description="Soil phosphorus content (kg/ha)")
    potassium:        float = Field(..., ge=0,    le=210,  description="Soil potassium content (kg/ha)")
    temperature:      float = Field(..., ge=10,   le=45,   description="Average temperature (°C)")
    humidity:         float = Field(..., ge=10,   le=100,  description="Relative humidity (%)")
    rainfall:         float = Field(..., ge=15,   le=300,  description="Annual rainfall (mm)")
    soil_pH:          float = Field(..., ge=3.0,  le=10.0, description="Soil pH value")
    moisture:         float = Field(..., ge=15,   le=85,   description="Soil moisture (%)")
    field_size_acres: float = Field(..., ge=0.1,  le=50,   description="Field size (acres)")

    # ── Categorical features ──────────────────────────────────────────────
    soil_type:     SoilType    = Field(..., description="Soil classification")
    crop_category: CropCategory = Field(..., description="Intended crop category")

    # ── Optional context (not used in prediction, returned in response) ───
    city:    Optional[str] = Field(None, description="City / district (optional context)")
    top_k:   int           = Field(3, ge=1, le=10, description="Number of top predictions to return")

    @field_validator("soil_pH")
    @classmethod
    def round_ph(cls, v: float) -> float:
        return round(v, 2)

    @field_validator("nitrogen", "phosphorus", "potassium", "temperature",
                     "humidity", "rainfall", "moisture", "field_size_acres")
    @classmethod
    def round_numeric(cls, v: float) -> float:
        return round(v, 2)

    model_config = {
        "json_schema_extra": {
            "example": {
                "nitrogen":         40.0,
                "phosphorus":       67.0,
                "potassium":        80.0,
                "temperature":      19.0,
                "humidity":         16.0,
                "rainfall":         73.0,
                "soil_pH":          5.8,
                "moisture":         30.0,
                "field_size_acres":  2.5,
                "soil_type":        "Sandy",
                "crop_category":    "Pulses",
                "city":             "Jaipur",
                "top_k":            3,
            }
        }
    }


class CropResult(BaseModel):
    rank:        int
    crop:        str
    confidence:  float    # percentage 0–100
    suitability: str      # Excellent / Good / Fair / Low


class RecommendResponse(BaseModel):
    recommended_crop:    str
    confidence:          float
    top_predictions:     list[CropResult]
    input_echo:          dict
    model_accuracy_pct:  Optional[float]
    message:             str


class BatchRecommendInput(BaseModel):
    inputs: list[RecommendInput] = Field(..., max_length=50)


class BatchRecommendResponse(BaseModel):
    total:   int
    results: list[RecommendResponse]


class CropDetailsInput(BaseModel):
    crop:            str   = Field(..., description="User-selected crop name")
    soilType:        str   = Field(..., description="e.g. Alluvial, Sandy, Clay")
    temperature:     float = Field(..., ge=0,  le=60)
    humidity:        float = Field(..., ge=0,  le=100)
    rainfall:        float = Field(..., ge=0)
    fieldSizeAcres:  float = Field(..., gt=0)
    fieldUnit:       str   = Field("acre")
    experience:      str   = Field("intermediate")
    city:            Optional[str] = None
    # User-entered soil test values
    nitrogen:        float = Field(40,  ge=0,  le=200, description="kg/ha from soil test")
    phosphorus:      float = Field(40,  ge=0,  le=150, description="kg/ha from soil test")
    potassium:       float = Field(40,  ge=0,  le=210, description="kg/ha from soil test")
    soilPH:          float = Field(6.5, ge=3,  le=10,  description="pH from soil test")
 
 
class FertScheduleItem(BaseModel):
    timing: str; product: str; dose: str; color: str
 
class GrowthPhase(BaseModel):
    label: str; days: str; color: str; tip: str
 
class PestEntry(BaseModel):
    name: str; severity: Literal["high", "medium", "low"]; fix: str
 
class CropDetailsResponse(BaseModel):
    rowSpacing: str; plantSpacing: str; waterPerWeek: str; totalWater: str
    seedRate: str; harvestDays: str; yieldPerAcre: str; npk: str
    phRange: str; marketPrice: str; storageLife: str
    criticalStages: List[str]
    fertSchedule:   List[FertScheduleItem]
    growthPhases:   List[GrowthPhase]
    topPests:       List[PestEntry]
    smartTips:      List[str]
    

CropDetailsResponse.model_rebuild()


# ── Helper ─────────────────────────────────────────────────────────────────

def _suitability(conf: float) -> str:
    if conf >= 70: return "Excellent"
    if conf >= 45: return "Good"
    if conf >= 25: return "Fair"
    return "Low"


def _predict_one(data: RecommendInput) -> RecommendResponse:
    model, le_crop, _, metadata = _load_artefacts()

    row = pd.DataFrame([{
        **{f: getattr(data, f) for f in NUM_FEATURES},
        "soil_type":     data.soil_type,
        "crop_category": data.crop_category,
    }])

    proba   = model.predict_proba(row)[0]
    top_idx = np.argsort(proba)[::-1][: data.top_k]
    classes = le_crop.classes_

    top_preds = [
        CropResult(
            rank=i + 1,
            crop=classes[idx],
            confidence=round(float(proba[idx]) * 100, 2),
            suitability=_suitability(float(proba[idx]) * 100),
        )
        for i, idx in enumerate(top_idx)
    ]

    best      = top_preds[0]
    model_acc = round(metadata.get("test_accuracy", 0) * 100, 2) if metadata else None

    return RecommendResponse(
        recommended_crop=best.crop,
        confidence=best.confidence,
        top_predictions=top_preds,
        input_echo={
            "nitrogen": data.nitrogen, "phosphorus": data.phosphorus,
            "potassium": data.potassium, "temperature": data.temperature,
            "humidity": data.humidity, "rainfall": data.rainfall,
            "soil_pH": data.soil_pH, "moisture": data.moisture,
            "field_size_acres": data.field_size_acres,
            "soil_type": data.soil_type,
            "crop_category": data.crop_category,
            **({"city": data.city} if data.city else {}),
        },
        model_accuracy_pct=model_acc,
        message=(
            f"{best.crop} is the best match for your {data.soil_type.lower()} soil "
            f"conditions with {best.confidence:.1f}% confidence."
        ),
    )



router = APIRouter(
    prefix="/recommendation",
    tags=["Crop Recommendation"],
)

ALLOWED_FERT_COLORS = [
    "bg-amber-50 border-amber-200 text-amber-800",
    "bg-green-50 border-green-200 text-green-800",
    "bg-sky-50 border-sky-200 text-sky-800",
    "bg-rose-50 border-rose-200 text-rose-800",
    "bg-violet-50 border-violet-200 text-violet-800",
]
ALLOWED_PHASE_COLORS = [
    "bg-lime-400", "bg-green-500", "bg-emerald-600",
    "bg-yellow-500", "bg-amber-500", "bg-red-500",
]

@router.post(
    "/predict",
    response_model=RecommendResponse,
    summary="Predict best crop",
    description="Takes soil NPK, weather, and field data and returns the top crop recommendations.",
)
def predict(data: RecommendInput):
    try:
        return _predict_one(data)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "/predict/batch",
    response_model=BatchRecommendResponse,
    summary="Batch crop prediction",
    description="Predict crops for up to 50 inputs in a single request.",
)
def predict_batch(batch: BatchRecommendInput):
    results = []
    for item in batch.inputs:
        try:
            results.append(_predict_one(item))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error on input {len(results) + 1}: {e}",
            )
    return BatchRecommendResponse(total=len(results), results=results)


@router.get(
    "/model/info",
    summary="Model accuracy & metadata",
    description="Returns training accuracy, cross-validation scores, and model details.",
)
def model_info():
    _, _, _, metadata = _load_artefacts()
    fi = metadata.get("feature_importance", {})
    if not fi:
        raise HTTPException(status_code=404, detail="Feature importance not available.")
    ranked = [{"feature": k, "importance": v, "importance_pct": round(v * 100, 2)}
              for k, v in fi.items()]
    return {
        **metadata,
        "test_accuracy_pct": round(metadata.get("test_accuracy", 0) * 100, 4),
        "cv_mean_pct":       round(metadata.get("cv_mean", 0) * 100, 4),
        "cv_std_pct":        round(metadata.get("cv_std", 0) * 100, 4),
        "features": ranked
    }


def _build_prompt(inp: CropDetailsInput) -> str:
    def n_level(v): return "Low" if v < 40 else "High" if v > 80 else "Medium"
    def p_level(v): return "Low" if v < 20 else "High" if v > 50 else "Medium"
    def k_level(v): return "Low" if v < 40 else "High" if v > 80 else "Medium"

    ph_note = (
        "acidic" if inp.soilPH < 6.0
        else "alkaline" if inp.soilPH > 7.5
        else "neutral"
    )

    location = f", Location: {inp.city}" if inp.city else ""

    return f"""
Return ONLY valid JSON. No explanation. No markdown. No extra keys.

Crop: {inp.crop}
Soil: {inp.soilType}
Temp: {inp.temperature}C, Humidity: {inp.humidity}%, Rainfall: {inp.rainfall} mm
Field: {inp.fieldSizeAcres} acres{location}

Soil Test:
N: {n_level(inp.nitrogen)}, P: {p_level(inp.phosphorus)}, K: {k_level(inp.potassium)}, pH: {ph_note}

Rules:
- Adjust fertilizer based on NPK levels
- Adjust irrigation based on rainfall & humidity
- Use INR (Rs.)
- pest severity must be exactly: high, medium, or low
- Keep counts: 4 criticalStages, 3-5 fertSchedule items, 4 growthPhases, 3 pests, 3 smartTips

Output this EXACT JSON structure with EXACT key names shown:
{{
  "rowSpacing": "string",
  "plantSpacing": "string",
  "waterPerWeek": "string",
  "totalWater": "string",
  "seedRate": "string",
  "harvestDays": "string",
  "yieldPerAcre": "string",
  "npk": "string",
  "phRange": "string",
  "marketPrice": "string",
  "storageLife": "string",
  "criticalStages": ["string", "string", "string", "string"],
  "fertSchedule": [
    {{"timing": "stage name here", "product": "fertilizer name", "dose": "amount and unit", "color": "bg-amber-50 border-amber-200 text-amber-800"}},
    {{"timing": "stage name here", "product": "fertilizer name", "dose": "amount and unit", "color": "bg-green-50 border-green-200 text-green-800"}},
    {{"timing": "stage name here", "product": "fertilizer name", "dose": "amount and unit", "color": "bg-sky-50 border-sky-200 text-sky-800"}}
  ],
  "growthPhases": [
    {{"label": "phase name", "days": "X days", "color": "bg-lime-400", "tip": "specific actionable tip for this phase"}},
    {{"label": "phase name", "days": "X days", "color": "bg-green-500", "tip": "specific actionable tip for this phase"}},
    {{"label": "phase name", "days": "X days", "color": "bg-emerald-600", "tip": "specific actionable tip for this phase"}},
    {{"label": "phase name", "days": "X days", "color": "bg-yellow-500", "tip": "specific actionable tip for this phase"}}
  ],
  "topPests": [
    {{"name": "pest name", "severity": "high", "fix": "treatment description"}},
    {{"name": "pest name", "severity": "medium", "fix": "treatment description"}},
    {{"name": "pest name", "severity": "low", "fix": "treatment description"}}
  ],
  "smartTips": ["tip 1", "tip 2", "tip 3"]
}}
"""
# ── JSON extractor — handles all Gemini output variations ─────────────────────
 
def _extract_json(raw: str) -> dict:
    """
    Robustly extract a JSON object from Gemini's response.
    Handles: bare JSON, ```json fences, ``` fences, leading/trailing text.
    """
    if not raw or not raw.strip():
        raise ValueError("Empty response text from Gemini")
 
    text = raw.strip()
 
    # Step 1: strip ```json ... ``` or ``` ... ``` fences (any variation)
    text = re.sub(r'^```(?:json|JSON)?\s*\n?', '', text)
    text = re.sub(r'\n?\s*```\s*$', '', text)
    text = text.strip()
 
    # Step 2: try direct parse (happy path — model followed instructions)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
 
    # Step 3: find first { and last } and parse that slice
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass
 
    # Step 4: regex search for JSON object anywhere in the text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
 
    raise ValueError(
        f"Could not extract valid JSON. First 500 chars of response: {raw[:500]}"
    )
 

def normalize_schema(data: dict) -> dict:

    if isinstance(data.get("criticalStages"), list):
        data["criticalStages"] = [
            item.get("stage", "") if isinstance(item, dict) else item
            for item in data["criticalStages"]
        ]

    if isinstance(data.get("fertSchedule"), list):
        for item in data["fertSchedule"]:
            if "formula" in item:
                item["product"] = item.pop("formula")
            if "fertilizer" in item:
                item["product"] = item.pop("fertilizer")
            if "dosage" in item:
                item["dose"] = item.pop("dosage")
            # ✅ ADD THIS: Gemini returns "stage" but schema expects "timing"
            if "stage" in item and "timing" not in item:
                item["timing"] = item.pop("stage")
            elif "stage" in item:
                item.pop("stage")  # remove duplicate if timing already exists

            item.setdefault("product", "General fertilizer")
            item.setdefault("dose", "Standard dose")
            item.setdefault("timing", "General stage")

    if isinstance(data.get("growthPhases"), list):
        for item in data["growthPhases"]:
            if "phase" in item:
                item["label"] = item.pop("phase")
            if "duration" in item:
                item["days"] = item.pop("duration")
            # ✅ ADD THIS: handle "description" or "advice" → "tip"
            if "description" in item:
                item["tip"] = item.pop("description")
            if "advice" in item:
                item["tip"] = item.pop("advice")
            if "care" in item:
                item["tip"] = item.pop("care")

            item.setdefault("label", "Growth stage")
            item.setdefault("days", "N/A")
            item.setdefault("tip", "Maintain proper care")

    if isinstance(data.get("topPests"), list):
        for item in data["topPests"]:
            if "control" in item:
                item["fix"] = item.pop("control")
            if "remedy" in item:
                item["fix"] = item.pop("remedy")
            if "treatment" in item:
                item["fix"] = item.pop("treatment")
            item.setdefault("fix", "Use recommended pesticide")

    return data

 
# ── Sanitiser ─────────────────────────────────────────────────────────────────
def _sanitise(data: dict) -> dict:
    """Ensure Tailwind color strings are exactly what the frontend expects."""
    if isinstance(data.get("fertSchedule"), list):
        for i, item in enumerate(data["fertSchedule"]):
            if item.get("color") not in ALLOWED_FERT_COLORS:
                item["color"] = ALLOWED_FERT_COLORS[i % len(ALLOWED_FERT_COLORS)]
 
    if isinstance(data.get("growthPhases"), list):
        for i, phase in enumerate(data["growthPhases"]):
            if phase.get("color") not in ALLOWED_PHASE_COLORS:
                phase["color"] = ALLOWED_PHASE_COLORS[i % len(ALLOWED_PHASE_COLORS)]
 
    if isinstance(data.get("topPests"), list):
        for pest in data["topPests"]:
            if pest.get("severity") not in ("high", "medium", "low"):
                pest["severity"] = "medium"
 
    return data
 
 
# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/generate", response_model=CropDetailsResponse)
async def generate_crop_details(inp: CropDetailsInput):

    api_key = "AIzaSyAqFUWpC2-rjsojuGTVIq1Kawug6ANX9n0"
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY not set"
        )

    genai.configure(api_key=api_key)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-3-flash-preview",
            safety_settings={
                "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
            }
        )

        response = model.generate_content(
            _build_prompt(inp),
            generation_config={
                "temperature": 0.3,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 4000,
                "response_mime_type": "application/json"
            },
        )

        print({"Gemini raw response": response.text})

    except Exception as e:
        logger.error("Gemini SDK error for crop=%s: %s", inp.crop, e)
        raise HTTPException(
            status_code=502,
            detail=f"Gemini SDK error: {str(e)}",
        )

    # Extract text
    try:
        raw_text = response.text
        raw_text = raw_text.strip()
        if not raw_text.endswith("}"):
            raw_text += "}"
        # print({"Extracted raw text": raw_text})
    except Exception as e:
        raw_text = str(response)
        logger.error("Text extraction failed: %s", e)
        # print({"Fallback raw text": raw_text})
        raise HTTPException(
            status_code=502,
            detail="Failed to extract text from Gemini",
        )

    # Parse JSON
    try:
        parsed = _extract_json(raw_text)
        print({"Parsed JSON": parsed})
    except ValueError as e:
        print({"JSON extraction error": str(e)})
        raise HTTPException(status_code=502, detail=str(e))

        # Normalize + fix schema
    normalized = normalize_schema(parsed)

    # Apply UI sanitisation
    sanitised = _sanitise(normalized)

    print({"Final data": sanitised})

    try:
        return CropDetailsResponse(**sanitised)
    except Exception as e:
        print("Validation error:", e)
        print("Bad data:", sanitised)
        raise HTTPException(
            status_code=502,
            detail=f"Pydantic validation failed: {e}"
        )
