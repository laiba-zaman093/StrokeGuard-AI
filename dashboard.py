import os
import joblib
import pandas as pd
import numpy as np
import streamlit as st
import shap
import matplotlib.pyplot as plt

# ==========================================
# PAGE CONFIGURATION
# ==========================================
st.set_page_config(
    page_title="StrokeGuard AI",
    page_icon="??",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for a clean look
st.markdown("""
<style>
    .reportview-container .main .block-container{
        padding-top: 2rem;
    }
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
        margin-bottom: 20px;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #1f77b4;
    }
    .metric-title {
        font-size: 1rem;
        color: #555;
    }
</style>
""", unsafe_allow_html=True)


# ==========================================
# LOAD DATA & MODELS (CACHED)
# ==========================================
@st.cache_data
def load_data():
    data_path = os.path.join("data", "healthcare-dataset-stroke-data.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path, encoding='ISO-8859-1')
        return df
    return pd.DataFrame()

@st.cache_resource
def load_models():
    model_dir = "models"
    model = joblib.load(os.path.join(model_dir, "best_stroke_model.pkl"))
    preprocessor = joblib.load(os.path.join(model_dir, "preprocessor.pkl"))
    shap_bg = joblib.load(os.path.join(model_dir, "shap_background.pkl"))
    return model, preprocessor, shap_bg

try:
    df = load_data()
    model, preprocessor, shap_bg = load_models()
except Exception as e:
    st.error(f"Error loading models or data: {e}")
    st.stop()

# ==========================================
# SIDEBAR NAVIGATION
# ==========================================
st.sidebar.image("https://cdn-icons-png.flaticon.com/512/2862/2862802.png", width=60)
st.sidebar.title("StrokeGuard AI")
st.sidebar.markdown("---")
page = st.sidebar.radio(
    "Navigation", 
    ["Dashboard", "Patient Assessment", "Client Database", "Model Insights"]
)
st.sidebar.markdown("---")
st.sidebar.info(
    "**Clinical Disclaimer**\n\n"
    "This system is intended to support healthcare professionals. "
    "It does not replace clinical judgment."
)

# ==========================================
# PAGE: DASHBOARD (Data Insights)
# ==========================================
if page == "Dashboard":
    st.title("?? Dashboard")
    st.markdown("Overview of the client database and general insights.")
    
    if not df.empty:
        col1, col2, col3, col4 = st.columns(4)
        
        total_assessments = len(df)
        high_risk = len(df[df['stroke'] == 1])
        avg_age = df['age'].mean()
        avg_glucose = df['avg_glucose_level'].mean()
        
        col1.markdown(f'<div class="metric-card"><div class="metric-title">Total Patients</div><div class="metric-value">{total_assessments:,}</div></div>', unsafe_allow_html=True)
        col2.markdown(f'<div class="metric-card"><div class="metric-title">High Risk Cases (Stroke)</div><div class="metric-value">{high_risk:,}</div></div>', unsafe_allow_html=True)
        col3.markdown(f'<div class="metric-card"><div class="metric-title">Average Age</div><div class="metric-value">{avg_age:.1f}</div></div>', unsafe_allow_html=True)
        col4.markdown(f'<div class="metric-card"><div class="metric-title">Avg Glucose Level</div><div class="metric-value">{avg_glucose:.1f}</div></div>', unsafe_allow_html=True)
        
        st.markdown("---")
        
        row1_col1, row1_col2 = st.columns(2)
        
        with row1_col1:
            st.subheader("Age Distribution")
            fig, ax = plt.subplots(figsize=(6, 4))
            ax.hist(df['age'].dropna(), bins=20, color='skyblue', edgecolor='black')
            ax.set_xlabel("Age")
            ax.set_ylabel("Count")
            st.pyplot(fig)
            
        with row1_col2:
            st.subheader("Stroke by Gender")
            stroke_gender = df[df['stroke'] == 1]['gender'].value_counts()
            fig, ax = plt.subplots(figsize=(6, 4))
            ax.pie(stroke_gender, labels=stroke_gender.index, autopct='%1.1f%%', colors=['#ff9999','#66b3ff'], startangle=90)
            ax.axis('equal')
            st.pyplot(fig)
    else:
        st.warning("No data available.")

# ==========================================
# PAGE: PATIENT ASSESSMENT (Prediction)
# ==========================================
elif page == "Patient Assessment":
    st.title("????? Patient Assessment")
    st.markdown("Enter patient information to assess stroke risk.")
    
    with st.form("assessment_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            age = st.slider("Age (years)", 0, 120, 50)
            gender = st.selectbox("Gender", ["Male", "Female", "Other"])
            hypertension = st.radio("Hypertension", ["No", "Yes"], horizontal=True)
            marital_status = st.selectbox("Marital Status", ["Yes", "No"])
            work_type = st.selectbox("Work Type", ["Private", "Self-employed", "Govt_job", "children", "Never_worked"])
            
        with col2:
            glucose = st.slider("Average Glucose Level (mg/dL)", 50.0, 300.0, 100.0)
            bmi = st.slider("BMI (kg/m²)", 10.0, 60.0, 25.0)
            heart_disease = st.radio("Heart Disease", ["No", "Yes"], horizontal=True)
            residence = st.radio("Residence Type", ["Urban", "Rural"], horizontal=True)
            smoking = st.selectbox("Smoking Status", ["never smoked", "formerly smoked", "smokes", "Unknown"])
            
        submit = st.form_submit_button("?? Assess Stroke Risk", use_container_width=True)
        
    if submit:
        # Prepare input data
        input_data = pd.DataFrame([{
            "gender": gender,
            "age": float(age),
            "hypertension": 1 if hypertension == "Yes" else 0,
            "heart_disease": 1 if heart_disease == "Yes" else 0,
            "ever_married": marital_status,
            "work_type": work_type,
            "Residence_type": residence,
            "avg_glucose_level": float(glucose),
            "bmi": float(bmi),
            "smoking_status": smoking
        }])
        
        with st.spinner("Analyzing risk profile..."):
            # Predict
            processed_data = preprocessor.transform(input_data)
            dense_data = processed_data.toarray() if hasattr(processed_data, "toarray") else processed_data
            
            prob = model.predict_proba(dense_data)[0][1]
            pred = model.predict(dense_data)[0]
            
            # Display Result
            st.markdown("---")
            st.subheader("Assessment Result")
            
            res_col1, res_col2 = st.columns([1, 1.5])
            
            with res_col1:
                if pred == 1:
                    st.error(f"### ?? Higher Risk\nProbability: {prob*100:.1f}%\nThe patient has indicators associated with higher stroke risk.")
                else:
                    st.success(f"### ? Lower Risk\nProbability: {prob*100:.1f}%\nThe patient currently shows a lower risk profile.")
            
            with res_col2:
                st.markdown("**What influenced this result? (SHAP)**")
                explainer = shap.Explainer(model, shap_bg)
                shap_values = explainer(dense_data)
                
                fig = plt.figure(figsize=(6, 4))
                shap.plots.bar(shap_values[0], show=False)
                st.pyplot(fig)

# ==========================================
# PAGE: CLIENT DATABASE
# ==========================================
elif page == "Client Database":
    st.title("?? Client Database")
    st.markdown("Search and view client records.")
    
    if not df.empty:
        search_id = st.text_input("Search by Patient ID (Leave empty to view all):")
        
        if search_id:
            try:
                search_id = int(search_id)
                filtered_df = df[df['id'] == search_id]
                if filtered_df.empty:
                    st.warning(f"No patient found with ID: {search_id}")
                else:
                    st.dataframe(filtered_df, use_container_width=True)
            except ValueError:
                st.error("Please enter a valid numeric ID.")
        else:
            st.dataframe(df.head(100), use_container_width=True)
            st.caption("Showing top 100 records. Use search to find specific patients.")
            
        # Download button
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Full Database (CSV)",
            data=csv,
            file_name='client_database.csv',
            mime='text/csv',
        )
    else:
        st.warning("No data available.")

# ==========================================
# PAGE: MODEL INSIGHTS
# ==========================================
elif page == "Model Insights":
    st.title("?? Model Insights")
    st.markdown("Global explainability of the stroke prediction model.")
    
    st.info("The model considers various features. Below is the relative importance of these features across the background dataset.")
    
    try:
        # We can calculate global SHAP values using the background data
        with st.spinner("Calculating global feature importance..."):
            explainer = shap.Explainer(model, shap_bg)
            # Sample a smaller subset for quick rendering
            sample_size = min(200, shap_bg.shape[0])
            shap_values = explainer(shap_bg[:sample_size])
            
            fig = plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, feature_names=preprocessor.get_feature_names_out(), show=False)
            st.pyplot(fig)
            
    except Exception as e:
        st.error(f"Could not render global model insights: {e}")
