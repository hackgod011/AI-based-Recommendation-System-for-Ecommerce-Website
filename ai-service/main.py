"""
ai-service/main.py
FastAPI service that loads the Stage-1 trained Logistic Regression pipeline
and exposes a /predict endpoint used by the backend recommendation API.

Model expects these 14 features (same as training):
  Numerical : Age, AnnualIncome, NumberOfPurchases, TimeSpentOnWebsite,
              CustomerTenureYears, LastPurchaseDaysAgo, SessionCount, DiscountsAvailed
  Categorical: Gender, ProductCategory, PreferredDevice, Region,
               ReferralSource, LoyaltyProgram (binary 0/1 treated as category)

Setup:
  1. Copy stage1_purchase_model.pkl → ai-service/models/
  2. pip install -r requirements.txt
  3. uvicorn main:app --reload --port 8000
"""

import os
import logging
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# ─── Model loading ────────────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / "models" / "stage1_purchase_model.pkl"
SEGMENTATION_PATH = Path(__file__).parent / "models" / "stage1_customer_segmentation.pkl"

model = None
segmentation_model = None

def load_models():
    global model, segmentation_model
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        log.info("✅ Purchase model loaded: %s", MODEL_PATH)
    else:
        log.warning(
            "⚠️  Purchase model NOT found at %s — /predict will return rule-based fallback. "
            "Copy stage1_purchase_model.pkl to ai-service/models/", MODEL_PATH
        )

    if SEGMENTATION_PATH.exists():
        segmentation_model = joblib.load(SEGMENTATION_PATH)
        log.info("✅ Segmentation model loaded: %s", SEGMENTATION_PATH)

load_models()

# ─── Category mapping ─────────────────────────────────────────────────────────
# Map our app categories → training dataset ProductCategory values
CATEGORY_MAP = {
    "electronics": "Electronics",
    "furniture":   "Furniture",
    "fashion":     "Fashion",
    "home-decor":  "Furniture",   # closest in training data
    "kitchen":     "Groceries",   # closest in training data
    "books":       "Groceries",   # handle_unknown="ignore" will zero out OHE
    "sports":      "Sports",
    "toys":        "Groceries",   # handle_unknown="ignore" will zero out OHE
}

# Numeric features the pipeline was trained on (order matches ColumnTransformer)
NUM_FEATURES = [
    "Age", "AnnualIncome", "NumberOfPurchases", "TimeSpentOnWebsite",
    "CustomerTenureYears", "LastPurchaseDaysAgo", "SessionCount", "DiscountsAvailed",
]
CAT_FEATURES = [
    "Gender", "ProductCategory", "PreferredDevice",
    "Region", "ReferralSource", "LoyaltyProgram",
]
ALL_FEATURES = NUM_FEATURES + CAT_FEATURES

# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ecommerce AI Service",
    description="Stage-1 ML recommendation engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ──────────────────────────────────────────────────────────────────
class UserFeatures(BaseModel):
    """Features derived from real Supabase user data + sensible defaults."""
    # Derived from real data
    number_of_purchases:    int   = Field(default=0,       ge=0)
    customer_tenure_years:  float = Field(default=0.0,     ge=0)
    last_purchase_days_ago: int   = Field(default=365,     ge=0)
    # Defaults (not tracked in our app yet)
    age:                    int   = Field(default=30,       ge=15, le=81)
    annual_income:          float = Field(default=55000.0,  ge=0)
    time_spent_on_website:  float = Field(default=10.0,    ge=0)
    session_count:          int   = Field(default=5,        ge=0)
    discounts_availed:      int   = Field(default=0,        ge=0)
    gender:                 str   = Field(default="Male")
    preferred_device:       str   = Field(default="Mobile")
    region:                 str   = Field(default="South")
    referral_source:        str   = Field(default="Organic")
    loyalty_program:        int   = Field(default=0)       # 0 or 1
    # Categories to score — we run one prediction per category
    product_categories:     list[str] = Field(default=["electronics", "furniture", "sports"])


class CategoryPrediction(BaseModel):
    category:            str
    purchase_probability: float
    should_recommend:    bool
    reason:              str


class PredictResponse(BaseModel):
    predictions:   list[CategoryPrediction]
    top_category:  str
    ai_powered:    bool
    model_version: str = "stage1_logistic_regression"


# ─── Rule-based fallback (no model file) ─────────────────────────────────────
def rule_based_predict(features: UserFeatures) -> list[dict]:
    """
    Simple heuristic when the model file isn't loaded yet.
    Higher purchase count + recent purchase → higher score.
    """
    results = []
    base = 0.5

    recency_boost = max(0, (30 - features.last_purchase_days_ago) / 30) * 0.2
    purchase_boost = min(features.number_of_purchases / 20, 1.0) * 0.15
    tenure_boost   = min(features.customer_tenure_years / 5, 1.0) * 0.1

    for cat_slug in features.product_categories:
        prob = round(min(1.0, base + recency_boost + purchase_boost + tenure_boost), 4)
        results.append({
            "category":             cat_slug,
            "purchase_probability": prob,
            "should_recommend":     prob >= 0.6,
            "reason":               "rule_based_fallback",
        })

    results.sort(key=lambda x: x["purchase_probability"], reverse=True)
    return results


# ─── ML-based prediction ──────────────────────────────────────────────────────
def ml_predict(features: UserFeatures) -> list[dict]:
    results = []

    for cat_slug in features.product_categories:
        mapped_cat = CATEGORY_MAP.get(cat_slug, "Electronics")

        row = {
            "Age":                  features.age,
            "AnnualIncome":         features.annual_income,
            "NumberOfPurchases":    features.number_of_purchases,
            "TimeSpentOnWebsite":   features.time_spent_on_website,
            "CustomerTenureYears":  features.customer_tenure_years,
            "LastPurchaseDaysAgo":  features.last_purchase_days_ago,
            "SessionCount":         features.session_count,
            "DiscountsAvailed":     features.discounts_availed,
            "Gender":               features.gender,
            "ProductCategory":      mapped_cat,
            "PreferredDevice":      features.preferred_device,
            "Region":               features.region,
            "ReferralSource":       features.referral_source,
            "LoyaltyProgram":       features.loyalty_program,
        }

        df = pd.DataFrame([row], columns=ALL_FEATURES)
        prob = float(model.predict_proba(df)[0][1])

        # Recommendation reason
        if prob >= 0.85:
            reason = "high_purchase_intent"
        elif prob >= 0.7:
            reason = "moderate_purchase_intent"
        else:
            reason = "low_purchase_intent"

        results.append({
            "category":             cat_slug,
            "purchase_probability": round(prob, 4),
            "should_recommend":     prob >= 0.7,
            "reason":               reason,
        })

    results.sort(key=lambda x: x["purchase_probability"], reverse=True)
    return results


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": model is not None,
        "seg_loaded":   segmentation_model is not None,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(features: UserFeatures):
    """
    Predict purchase probability for each requested product category.
    Returns categories sorted by probability (highest first).
    """
    try:
        if model is not None:
            raw = ml_predict(features)
            ai_powered = True
        else:
            log.info("Model not loaded — using rule-based fallback")
            raw = rule_based_predict(features)
            ai_powered = False

        predictions = [CategoryPrediction(**p) for p in raw]
        top = predictions[0].category if predictions else "electronics"

        return PredictResponse(
            predictions=predictions,
            top_category=top,
            ai_powered=ai_powered,
        )

    except Exception as exc:
        log.exception("Prediction error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
