from __future__ import annotations
import base64
import json
import logging
import re
from typing import List, Literal, Optional
import cv2
import google.genai as genai
import os    
import google.genai.types as gtypes
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from ..schemas.weed import OpenCVStats, WeedAnalysisResult, WeedCluster
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/weed-detection", tags=["Weed Detection"])
GEMINI_MODEL = "gemini-3-flash-preview"

# ─── Gemini client (cached) ───────────────────────────────────────────────────

_client: genai.Client | None = None

def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GEMINI_API_KEY environment variable not set.",
            )
        _client = genai.Client(api_key=api_key)
    return _client


_GENERATION_CONFIG = gtypes.GenerateContentConfig(
    temperature=0.2,
    max_output_tokens=2000,
    top_p=0.8,
    top_k=40,
    safety_settings=[
        gtypes.SafetySetting(category=gtypes.HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold=gtypes.HarmBlockThreshold.BLOCK_NONE),
        gtypes.SafetySetting(category=gtypes.HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold=gtypes.HarmBlockThreshold.BLOCK_NONE),
        gtypes.SafetySetting(category=gtypes.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=gtypes.HarmBlockThreshold.BLOCK_NONE),
        gtypes.SafetySetting(category=gtypes.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold=gtypes.HarmBlockThreshold.BLOCK_NONE),
    ],
)


# ─── Stage 1: OpenCV pipeline ─────────────────────────────────────────────────

def run_opencv_pipeline(img_bytes: bytes) -> tuple[OpenCVStats, str]:
    """
    Returns (stats, annotated_image_base64).
    Uses HSV segmentation to distinguish healthy green crop from weeds/bare soil.
    """
    # Decode image bytes → numpy array
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Ensure it is a valid JPEG/PNG.")

    h, w = img.shape[:2]

    # 1. Convert to HSV colour space
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 2. Green-crop mask (hue 30–90°, decent saturation & value)
    #    Covers most healthy crop foliage greens
    lower_green = np.array([30, 35, 35])
    upper_green = np.array([90, 255, 255])
    green_mask  = cv2.inRange(hsv, lower_green, upper_green)

    # 3. Weed / non-crop mask = everything not green
    non_green = cv2.bitwise_not(green_mask)

    # 4. Morphological cleanup — close gaps within weed patches, remove speckles
    kernel     = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    weed_clean = cv2.morphologyEx(non_green, cv2.MORPH_CLOSE, kernel, iterations=2)
    weed_clean = cv2.morphologyEx(weed_clean, cv2.MORPH_OPEN,  kernel, iterations=1)

    # 5. Find contours of weed clusters
    contours, _ = cv2.findContours(weed_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area_px = max(300, int(h * w * 0.001))   # at least 0.1% of image
    weed_contours = sorted(
        [c for c in contours if cv2.contourArea(c) > min_area_px],
        key=cv2.contourArea, reverse=True
    )[:20]  # cap at 20 clusters

    # 6. Pixel stats
    total_px   = h * w
    weed_px    = int(np.sum(weed_clean > 0))
    green_px   = int(np.sum(green_mask > 0))
    bare_px    = max(0, total_px - weed_px - green_px)
    weed_pct   = round((weed_px   / total_px) * 100, 1)
    green_pct  = round((green_px  / total_px) * 100, 1)
    bare_pct   = round((bare_px   / total_px) * 100, 1)

    # 7. Build cluster list
    clusters: List[WeedCluster] = []
    for i, c in enumerate(weed_contours):
        x, y, cw, ch = cv2.boundingRect(c)
        area_px  = int(cv2.contourArea(c))
        area_pct = round((area_px / total_px) * 100, 2)
        clusters.append(WeedCluster(
            id=i + 1, x=x, y=y, width=cw, height=ch,
            area_px=area_px, area_pct=area_pct,
        ))

    # 8. Annotate image — draw weed contours + bounding boxes
    annotated = img.copy()
    cv2.drawContours(annotated, weed_contours, -1, (0, 0, 220), 1)

    # Severity-based colour for bounding box
    for i, (c, cluster) in enumerate(zip(weed_contours, clusters)):
        x, y, cw, ch = cluster.x, cluster.y, cluster.width, cluster.height
        colour = (
            (0, 0, 255)   if cluster.area_pct > 5   else
            (0, 128, 255) if cluster.area_pct > 2   else
            (0, 200, 255)
        )
        cv2.rectangle(annotated, (x, y), (x + cw, y + ch), colour, 2)
        label = f"W{cluster.id} {cluster.area_pct:.1f}%"
        # Background pill for label readability
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(annotated, (x, y - lh - 6), (x + lw + 4, y), colour, -1)
        cv2.putText(annotated, label, (x + 2, y - 3),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

    # Coverage overlay bar at bottom
    bar_h = 28
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, h - bar_h), (w, h), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.7, annotated, 0.3, 0, annotated)

    green_w = int(w * green_pct / 100)
    weed_w  = int(w * weed_pct  / 100)
    cv2.rectangle(annotated, (0, h - bar_h), (green_w, h), (40, 160, 40), -1)
    cv2.rectangle(annotated, (green_w, h - bar_h), (green_w + weed_w, h), (0, 80, 220), -1)
    summary_text = f"Crop: {green_pct}%  Weed: {weed_pct}%  Bare: {bare_pct}%  Clusters: {len(clusters)}"
    cv2.putText(annotated, summary_text, (6, h - 8),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

    # 9. Encode annotated image to base64
    _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 88])
    b64 = base64.b64encode(buf.tobytes()).decode()

    stats = OpenCVStats(
        weed_coverage_pct=weed_pct,
        green_coverage_pct=green_pct,
        bare_soil_pct=bare_pct,
        weed_cluster_count=len(clusters),
        clusters=clusters,
        image_width=w,
        image_height=h,
    )
    return stats, b64


# ─── Stage 2: Gemini vision prompt ───────────────────────────────────────────

def _build_analysis_prompt(stats: OpenCVStats, crop: str, soil_type: str, location: str) -> str:
    cluster_summary = ", ".join(
        f"Cluster {c.id}: {c.area_pct}% of image at ({c.x},{c.y}) size {c.width}x{c.height}px"
        for c in stats.clusters[:10]
    )
    return f"""You are an expert agricultural weed scientist and herbicide specialist with deep knowledge of Indian farming.

Analyse the uploaded field image for weed infestation. Also use the OpenCV pre-analysis stats below.

OPENCV PRE-ANALYSIS:
- Weed/non-crop coverage: {stats.weed_coverage_pct}% of image
- Healthy green crop coverage: {stats.green_coverage_pct}%
- Bare soil: {stats.bare_soil_pct}%
- Weed clusters detected: {stats.weed_cluster_count}
- Cluster details: {cluster_summary if cluster_summary else "No significant clusters"}

FIELD CONTEXT:
- Crop: {crop}
- Soil type: {soil_type}
- Location / region: {location if location else "India (general)"}

Return ONLY a valid JSON object — no markdown fences, no explanation, no preamble. Start with {{ and end with }}.

JSON structure:
{{
  "severity": "critical|high|moderate|low|none",
  "overall_summary": "2-3 sentence summary of the weed situation",
  "weeds_identified": [
    {{
      "name": "Common name (Scientific name if identifiable)",
      "confidence": "high|medium|low",
      "description": "Brief visual description of why this weed was identified",
      "threat_level": "critical|high|moderate|low"
    }}
  ],
  "treatments": [
    {{
      "type": "chemical|organic|mechanical",
      "product": "Product/method name",
      "dose": "Specific dose e.g. 1.5 L/acre or 2 kg/ha",
      "timing": "When to apply e.g. Early morning, pre-emergence, 3-4 leaf stage",
      "notes": "Important safety or application note"
    }}
  ],
  "best_treatment_time": "Specific advice on optimal treatment window",
  "reinspection_days": 14,
  "yield_loss_risk_pct": "estimated range e.g. 10-20%",
  "urgency_note": "One-line action urgency statement",
  "smart_tips": [
    "Practical tip 1 specific to this crop and weed combination",
    "Practical tip 2 on prevention or integrated weed management",
    "Practical tip 3 on post-treatment monitoring or cultural control"
  ]
}}

Rules:
- Identify all visible weed species/types from the image (not just from stats)
- Provide 2-4 treatments covering at least one chemical and one organic option
- Herbicide doses must be in Indian market units (L/acre, kg/ha, ml/acre)
- treatments type must be exactly "chemical", "organic", or "mechanical"
- severity must be exactly: critical, high, moderate, low, or none
- weeds_identified confidence must be exactly: high, medium, or low
- reinspection_days must be an integer (7, 14, 21, or 30)
- If weed coverage is under 2%, set severity to "low" or "none"
- Tailor all advice to {crop} crop specifically"""


# ─── JSON extractor ───────────────────────────────────────────────────────────

def _extract_json(raw: str) -> dict:
    if not raw or not raw.strip():
        raise ValueError("Gemini returned an empty response")
    text = raw.strip()
    text = re.sub(r'^```(?:json|JSON)?\s*\n?', '', text)
    text = re.sub(r'\n?\s*```\s*$', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start, end = text.find('{'), text.rfind('}')
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Could not extract valid JSON. First 400 chars: {raw[:400]}")


def _sanitise_ai(data: dict) -> dict:
    """Clamp enum fields so Pydantic validation never fails on AI output."""
    valid_severity   = {"critical", "high", "moderate", "low", "none"}
    valid_confidence = {"high", "medium", "low"}
    valid_threat     = {"critical", "high", "moderate", "low"}
    valid_type       = {"chemical", "organic", "mechanical"}

    if data.get("severity") not in valid_severity:
        data["severity"] = "moderate"

    for w in data.get("weeds_identified", []):
        if w.get("confidence")   not in valid_confidence: w["confidence"]   = "medium"
        if w.get("threat_level") not in valid_threat:     w["threat_level"] = "moderate"

    for t in data.get("treatments", []):
        if t.get("type") not in valid_type: t["type"] = "chemical"

    if not isinstance(data.get("reinspection_days"), int):
        try:   data["reinspection_days"] = int(data.get("reinspection_days", 14))
        except: data["reinspection_days"] = 14

    # Ensure list fields exist
    for key in ("weeds_identified", "treatments", "smart_tips"):
        if not isinstance(data.get(key), list):
            data[key] = []

    return data


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.post(
    "/analyse",
    response_model=WeedAnalysisResult,
    summary="Detect and analyse weeds in a field image",
    description=(
        "Upload a field photo. Returns OpenCV pixel stats + annotated image "
        "with bounding boxes, plus a Gemini AI weed identification and "
        "treatment recommendation report."
    ),
)
async def analyse_weeds(
    image:     UploadFile = File(..., description="Field photo — JPEG or PNG"),
    crop:      str        = Form("Unknown", description="Crop being grown e.g. Tomato, Wheat"),
    soil_type: str        = Form("Unknown", description="Soil type e.g. Alluvial, Black, Sandy"),
    location:  str        = Form("",        description="Location/region e.g. Nashik, Maharashtra"),
) -> WeedAnalysisResult:

    # ── Validate file type ─────────────────────────────────────────────────
    allowed_mime = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    ct = (image.content_type or "").lower()
    if ct not in allowed_mime:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{ct}'. Upload a JPEG or PNG.",
        )

    img_bytes = await image.read()
    if len(img_bytes) > 15 * 1024 * 1024:   # 15 MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image too large. Max 15 MB.",
        )

    # ── Stage 1: OpenCV analysis ───────────────────────────────────────────
    try:
        opencv_stats, annotated_b64 = run_opencv_pipeline(img_bytes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error("OpenCV pipeline error: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Image processing error: {e}")

    # ── Stage 2: Gemini vision analysis ───────────────────────────────────
    client = _get_client()
    prompt = _build_analysis_prompt(opencv_stats, crop, soil_type, location)

    # Determine correct mime type for Gemini
    gemini_mime = "image/jpeg" if ct in ("image/jpeg", "image/jpg") else "image/png"

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                gtypes.Part.from_bytes(data=img_bytes, mime_type=gemini_mime),
                gtypes.Part(text=prompt),
            ],
            config=_GENERATION_CONFIG,
        )
    except Exception as e:
        logger.error("Gemini vision error for crop=%s: %s", crop, e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {e}",
        )

    # Guard: empty/blocked response
    candidates = response.candidates or []
    if not candidates:
        block_reason = getattr(getattr(response, "prompt_feedback", None), "block_reason", "unknown")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini returned no output (block_reason: {block_reason}).",
        )

    finish_reason = str(getattr(candidates[0], "finish_reason", ""))
    if finish_reason == "SAFETY":
        raise HTTPException(status_code=502, detail="Gemini blocked response for safety.")
    if finish_reason == "MAX_TOKENS":
        logger.warning("Gemini MAX_TOKENS hit for weed analysis crop=%s", crop)

    raw_text = response.text
    logger.debug("Gemini weed analysis raw (first 400): %s", raw_text[:400])

    # ── Parse + validate ───────────────────────────────────────────────────
    try:
        parsed = _extract_json(raw_text)
    except ValueError as e:
        logger.error("JSON extraction failed: %s", e)
        raise HTTPException(status_code=502, detail=str(e))

    sanitised = _sanitise_ai(parsed)
    try:
        return WeedAnalysisResult(
            opencv_stats=opencv_stats,
            annotated_image_b64=annotated_b64,
            **sanitised,
        )
    except Exception as e:
        logger.error("Pydantic validation failed: %s. Keys: %s", e, list(sanitised.keys()))
        raise HTTPException(
            status_code=502,
            detail=f"AI response missing required fields: {e}. Keys: {list(sanitised.keys())}",
        )
