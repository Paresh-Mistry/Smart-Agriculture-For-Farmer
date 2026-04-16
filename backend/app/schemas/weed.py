from pydantic import BaseModel, Field
from typing import List, Literal
import logging

class WeedCluster(BaseModel):
    id:         int
    x:          int
    y:          int
    width:      int
    height:     int
    area_px:    int
    area_pct:   float   # % of total image area

class OpenCVStats(BaseModel):
    weed_coverage_pct:   float
    green_coverage_pct:  float
    bare_soil_pct:       float
    weed_cluster_count:  int
    clusters:            List[WeedCluster]
    image_width:         int
    image_height:        int

class WeedIdentification(BaseModel):
    name:            str
    confidence:      Literal["high", "medium", "low"]
    description:     str
    threat_level:    Literal["critical", "high", "moderate", "low"]

class TreatmentOption(BaseModel):
    type:       Literal["chemical", "organic", "mechanical"]
    product:    str
    dose:       str
    timing:     str
    notes:      str

class WeedAnalysisResult(BaseModel):
    # OpenCV stats
    opencv_stats:        OpenCVStats
    annotated_image_b64: str           # base64 JPEG with bounding boxes drawn

    # Gemini AI analysis
    severity:            Literal["critical", "high", "moderate", "low", "none"]
    overall_summary:     str
    weeds_identified:    List[WeedIdentification]
    treatments:          List[TreatmentOption]
    best_treatment_time: str
    reinspection_days:   int
    yield_loss_risk_pct: str           # e.g. "15-25%"
    urgency_note:        str
    smart_tips:          List[str]
