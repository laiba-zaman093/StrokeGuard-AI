# StrokeGuard AI - Setup & Run Guide

## What is This?
A medical AI dashboard that predicts stroke risk using a trained machine learning model.
Built with React (frontend) + Python FastAPI (backend).

---

## BEFORE YOU START - Install These 2 Things

### 1. Python (version 3.9 or higher)
- Download from: https://www.python.org/downloads/
- During install: CHECK the box that says "Add Python to PATH"
- To verify: Open Command Prompt, type: python --version

### 2. Node.js (LTS version)
- Download from: https://nodejs.org/
- Install the LTS version (the left green button)
- To verify: Open Command Prompt, type: node --version

---

## HOW TO RUN (Only 1 Step!)

After installing Python and Node.js:

1. Go into the project folder:
   C:\...\StrokeGuard-main\StrokeGuard-main\StrokeGuard\

2. Double-click the file:    start.bat

That is it. The start.bat will:
   - Automatically install all Python packages (fastapi, shap, pandas, etc.)
   - Automatically install all React packages (first time takes ~1 min)
   - Open the backend API server
   - Open the frontend React app
   - Launch your browser at http://localhost:5173

---

## Full List of Dependencies (handled automatically by start.bat)

### Python Packages (installed automatically via pip)
  - fastapi         (web API framework)
  - uvicorn         (server runner)
  - pydantic        (data validation)
  - python-multipart
  - pandas          (data handling)
  - numpy           (math operations)
  - joblib          (loading ML model)
  - scikit-learn    (ML preprocessing)
  - shap            (AI explainability)
  - matplotlib      (charts)

  Installed from: requirements.txt
  Command used:   python -m pip install -r requirements.txt

### Node.js / React Packages (installed automatically via npm)
  - react, react-dom
  - react-router-dom  (page navigation)
  - axios             (API calls)
  - recharts          (charts)
  - lucide-react      (icons)
  - tailwindcss       (styling)
  - react-circular-progressbar
  - vite              (build tool)

  Installed from: frontend\package.json
  Command used:   npm install  (run inside the frontend\ folder)

---

## Project Folder Structure

  StrokeGuard\
  |-- api.py               <- Python backend (run this)
  |-- requirements.txt     <- Python packages list
  |-- start.bat            <- CLICK THIS TO START
  |-- data\
  |   |-- healthcare-dataset-stroke-data.csv   <- Original dataset
  |   |-- new_patients.csv                     <- Created after first assessment
  |-- models\
  |   |-- best_stroke_model.pkl    <- Trained ML model
  |   |-- preprocessor.pkl         <- Data preprocessor
  |   |-- shap_background.pkl      <- SHAP explainer data
  |-- frontend\                    <- React web app
      |-- src\
      |   |-- App.jsx
      |   |-- Dashboard.jsx
      |   |-- PatientAssessment.jsx
      |   |-- PatientsHistory.jsx
      |   |-- ModelInsights.jsx
      |-- package.json             <- Node packages list

---

## Ports Used
  - Frontend:  http://localhost:5173   (React app - open this in browser)
  - Backend:   http://localhost:8000   (Python API - do not close its window)

## How to Stop
  Close the two black terminal windows that opened when you ran start.bat.

---
