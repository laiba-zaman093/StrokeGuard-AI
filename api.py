from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import shap
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "models"
DATA_DIR = "data"
PATIENTS_CSV = os.path.join(DATA_DIR, "new_patients.csv")
ORIG_CSV = os.path.join(DATA_DIR, "healthcare-dataset-stroke-data.csv")

# --- Load ML artifacts once at startup ---
print("Loading ML models...")
model = joblib.load(os.path.join(MODEL_DIR, "best_stroke_model.pkl"))
preprocessor = joblib.load(os.path.join(MODEL_DIR, "preprocessor.pkl"))
shap_bg = joblib.load(os.path.join(MODEL_DIR, "shap_background.pkl"))
explainer = shap.Explainer(model, shap_bg)
print("Models loaded successfully.")

# --- Columns we store for each new patient ---
PATIENT_COLS = [
    "id", "name", "date_added",
    "age", "gender", "hypertension", "heart_disease",
    "marital_status", "work_type", "residence",
    "glucose", "bmi", "smoking",
    "risk_score", "risk_level"
]

def load_patients() -> pd.DataFrame:
    if os.path.exists(PATIENTS_CSV):
        try:
            df = pd.read_csv(PATIENTS_CSV)
            # Make sure every expected column exists
            for col in PATIENT_COLS:
                if col not in df.columns:
                    df[col] = ""
            return df[PATIENT_COLS]
        except Exception:
            pass
    return pd.DataFrame(columns=PATIENT_COLS)

def save_patient(record: dict):
    df = load_patients()
    new_row = pd.DataFrame([record])
    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(PATIENTS_CSV, index=False)

class PatientData(BaseModel):
    name: str = "Unknown"
    age: float
    gender: str
    hypertension: str
    heart_disease: str
    marital_status: str
    work_type: str
    residence: str
    glucose: float
    bmi: float
    smoking: str

@app.post("/api/predict")
def predict(patient: PatientData):
    try:
        input_df = pd.DataFrame([{
            "gender": patient.gender,
            "age": patient.age,
            "hypertension": 1 if patient.hypertension == "Yes" else 0,
            "heart_disease": 1 if patient.heart_disease == "Yes" else 0,
            "ever_married": patient.marital_status,
            "work_type": patient.work_type,
            "Residence_type": patient.residence,
            "avg_glucose_level": patient.glucose,
            "bmi": patient.bmi,
            "smoking_status": patient.smoking,
        }])

        processed = preprocessor.transform(input_df)
        dense = processed.toarray() if hasattr(processed, "toarray") else processed

        prob = float(model.predict_proba(dense)[0][1])
        pred = int(model.predict(dense)[0])

        # SHAP
        shap_vals = explainer(dense)
        feature_names = preprocessor.get_feature_names_out()
        shap_data = sorted(
            [{"feature": name.split("__")[-1], "value": float(shap_vals[0].values[i])}
             for i, name in enumerate(feature_names)],
            key=lambda x: abs(x["value"]), reverse=True
        )[:10]

        # Generate unique patient id
        existing = load_patients()
        new_id = int(existing["id"].max()) + 1 if not existing.empty and existing["id"].notna().any() else 1001

        record = {
            "id": new_id,
            "name": patient.name,
            "date_added": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M"),
            "age": patient.age,
            "gender": patient.gender,
            "hypertension": patient.hypertension,
            "heart_disease": patient.heart_disease,
            "marital_status": patient.marital_status,
            "work_type": patient.work_type,
            "residence": patient.residence,
            "glucose": patient.glucose,
            "bmi": patient.bmi,
            "smoking": patient.smoking,
            "risk_score": round(prob * 100, 2),
            "risk_level": "High" if pred == 1 else "Low",
        }
        save_patient(record)

        return {"probability": prob, "prediction": pred, "shap": shap_data, "patient_id": new_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
def get_stats():
    try:
        orig_df = pd.read_csv(ORIG_CSV, encoding="ISO-8859-1")
    except Exception:
        orig_df = pd.DataFrame()

    patients_df = load_patients()

    total_historical = len(orig_df)
    high_risk_historical = int((orig_df["stroke"] == 1).sum()) if "stroke" in orig_df.columns else 0
    new_patients = len(patients_df)
    new_high_risk = int((patients_df["risk_level"] == "High").sum()) if not patients_df.empty else 0

    return {
        "total_assessments": total_historical + new_patients,
        "high_risk_cases": high_risk_historical + new_high_risk,
        "average_age": round(float(orig_df["age"].mean()), 1) if not orig_df.empty else 0,
        "average_glucose": round(float(orig_df["avg_glucose_level"].mean()), 1) if not orig_df.empty else 0,
        "reports_generated": new_patients,
        "new_high_risk": new_high_risk,
    }


@app.get("/api/patients")
def get_patients():
    df = load_patients()
    if df.empty:
        return []
    df = df.sort_values("date_added", ascending=False)
    return df.fillna("").to_dict(orient="records")


@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id: int):
    df = load_patients()
    if df.empty:
        raise HTTPException(status_code=404, detail="No patients found")
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    if patient_id not in df["id"].values:
        raise HTTPException(status_code=404, detail="Patient not found")
    df = df[df["id"] != patient_id]
    df.to_csv(PATIENTS_CSV, index=False)
    return {"message": "Patient deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
