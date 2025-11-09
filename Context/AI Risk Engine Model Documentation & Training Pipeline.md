Confirmly ML Model Architecture, Data Pipeline, and Continuous Learning Framework

🧭 1. Purpose
The AI Risk Engine predicts the likelihood of an order being RTO (Return-to-Origin) using behavioral, transactional, and regional features.
 It helps merchants:
Prioritize confirmations 🔍


Auto-cancel high-risk orders ⚙️


Reduce overall RTO by 50–60%


This document defines the end-to-end ML lifecycle, from data ingestion to inference, retraining, and evaluation.

🧱 2. ML System Overview
Layer
Description
Feature Layer
Collects and transforms order data (signals)
Model Layer
XGBoost/LightGBM for tabular classification
Service Layer
FastAPI inference microservice
Feedback Layer
Logs actual outcomes for retraining
Monitoring Layer
Drift detection + performance dashboards

Architecture Diagram (conceptual):
Orders → Feature Extractor → Model Inference API → Risk Score
               ↑                     ↓
        Feedback Collector ← Order Outcome


⚙️ 3. Model Objective
Predict P(RTO = 1) given order and customer signals.
Output: Risk score (0–1, scaled to 0–100)


Thresholds:


0–50: Low risk → Ship


51–80: Medium → Confirm via 1 channel


81–100: High → Dual-channel confirmation or cancel


Example:
{
  "order_id": "ORD1234",
  "risk_score": 84.7,
  "category": "High"
}


📊 4. Input Features
A. Customer-Level
Feature
Description
phone_order_count
# of prior orders with same phone
email_domain_risk
Risk level based on domain (e.g., tempmail)
past_rto_rate
Historical RTO ratio per customer
days_since_last_order
Recency indicator

B. Order-Level
Feature
Description
payment_mode
COD / Prepaid
aov_bucket
Value bucket (low, medium, high)
item_count
Number of SKUs
shipping_distance
Warehouse → Pincode distance
order_hour
Time of order

C. Geo-Level
Feature
Description
pincode_risk_index
Aggregated from prior orders
state_zone
North / South / East / West
region_density_score
City vs rural indicator

D. Platform-Level
Feature
Description
store_age_days
Shopify store creation age
merchant_rto_avg
Merchant-wide RTO average
channel_count
Confirm channels enabled


🧩 5. Data Pipeline Architecture
Stage
Tool
Description
Ingestion
Node.js Worker → MongoDB → S3
Daily order dump
Transformation
Python ETL script
Feature computation
Storage
Parquet on S3
Model-ready data
Versioning
DVC (Data Version Control)
Dataset tracking
Validation
Great Expectations
Schema validation

Example ETL Flow:
def extract_features(order):
    return {
        "payment_mode": 1 if order["paymentMode"]=="cod" else 0,
        "pincode_risk_index": get_pincode_risk(order["customer"]["pincode"]),
        "aov_bucket": np.digitize(order["amount"], [500, 1000, 2000])
    }


🧮 6. Model Training Pipeline
Framework: LightGBM (preferred over XGBoost for speed)
import lightgbm as lgb
train = lgb.Dataset(X_train, label=y_train)
params = {
    "objective": "binary",
    "metric": "auc",
    "num_leaves": 64,
    "learning_rate": 0.05,
    "feature_fraction": 0.9,
    "lambda_l1": 0.1
}
model = lgb.train(params, train, num_boost_round=200)
model.save_model("models/risk_model_v1.txt")

Training Steps
Train-test split by merchant (to avoid data leakage).


Hyperparameter tuning (Optuna).


Feature importance evaluation.


Export model + metadata to MLflow.


Register version (e.g., v1.2.0).



🧠 7. Model Evaluation Metrics
Metric
Description
Target
AUC (ROC)
Ranking quality
> 0.90
Precision @ Top 10% Risk
Identify true high-risk
> 85%
Recall @ Top 20%
Catch risky orders
> 80%
KS Statistic
Separability
> 0.3
F1 Score
Balance metric
> 0.75

Confusion matrix visualized in Grafana or Jupyter.

🧩 8. Model Explainability
Uses SHAP (SHapley Additive Explanations) for transparency.
Example Output:
Top Drivers for Order #12345 (Risk Score: 88)
- COD Payment (+0.24)
- High-Risk Pincode (+0.19)
- Customer RTO History (+0.15)
- New Store (-0.08)

Visualizations embedded into Admin Dashboard → “Explain Risk” modal.

⚙️ 9. Model Deployment
Runtime: Python FastAPI


Containerization: Docker + AWS ECS


Endpoint: /score


Input: order features JSON


Output: risk score + category


Example Request:
POST /score
{
  "merchant_id": "m123",
  "payment_mode": "cod",
  "amount": 1250,
  "pincode": "400001"
}

Response:
{"risk_score": 0.82, "category": "high"}

FastAPI Dockerfile:
FROM python:3.10-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]


☁️ 10. Integration with Confirmly Backend
The backend calls /score on order ingest.


Risk score stored in Order.riskScore.


Policy Engine uses thresholds for actions:


> 0.8: auto-cancel or confirm twice


0.5–0.8: send WhatsApp


< 0.5: mark safe


Feature feedback (final order outcome) logged back to ML DB for retraining.

📊 11. Continuous Retraining Pipeline
Step
Frequency
Action
Data Pull
Weekly
Extract new confirmed & RTO orders
Feature Update
Weekly
Recompute feature tables
Model Retrain
Bi-weekly
Train + validate new model
Canary Deploy
Monthly
10% inference traffic
Full Deploy
On success
Promote to prod
Archive
Always
Move old model to cold storage

Retraining Automation
Managed by AWS Lambda trigger + GitHub Actions


Models stored in s3://confirmly-model-registry/


Training logs in MLflow with AUC comparison



🧩 12. Model Drift Detection
Type
Detection Method
Tool
Data Drift
PSI (Population Stability Index)
Great Expectations
Concept Drift
Rolling AUC tracking
Grafana
Performance Drift
Real vs predicted labels
Custom Lambda job

If drift > threshold, system flags model for retrain.

🧠 13. AI Feedback Learning
Every confirmed or canceled order feeds back into the ML data store.
Example:
Order ID: 9876
Predicted Risk: 0.82
Actual Outcome: Canceled (RTO)
Feedback: True Positive → Model reinforced

This creates a human-in-the-loop learning cycle:
CSM overrides high-risk false positives → logged as exceptions.


Retraining job incorporates those labeled outcomes.



🧾 14. Fallback Logic (LLM + Rules)
When ML service is offline or uncertain (confidence < 0.55):
Fallback to rule-based system:


COD + risky pincode → must confirm


Prepaid → safe


If rules inconclusive:
Use OpenAI API (few-shot prompt classification):

 “Classify this order risk: 
 Customer: repeated COD, high pincode RTO history.”


Cached to minimize token cost.



🧮 15. Model Monitoring Dashboard
Metrics visualized in Grafana:
Panel
Metric
AUC Trend
Daily model accuracy
Prediction Volume
Orders scored/hour
Drift Alerts
PSI > 0.2
Feature Importance Shifts
Key signal movement
Feedback Accuracy
Correct prediction %

Alerts via Slack → #ai-risk-engine.

🔒 16. Security & Compliance
Model endpoints require signed JWT from Confirmly backend.


No customer PII used in model — only anonymized signals.


Training data sanitized & stored separately from live DB.


Logs encrypted and access restricted to AI engineers.


Compliant with DPDPA, GDPR, and ISO 27001.

🧾 17. Sample Notebook (Testing Locally)
File: /notebooks/sample_risk_engine.ipynb
Features:
Generates 5,000 synthetic orders.


Simulates risk scoring with XGBoost.


Plots ROC curve, SHAP explainability, and drift simulation.


Example snippet:
import numpy as np, pandas as pd
from sklearn.metrics import roc_auc_score
from lightgbm import LGBMClassifier

df = generate_fake_orders(5000)
model = LGBMClassifier().fit(df[features], df['label'])
print("AUC:", roc_auc_score(df['label'], model.predict_proba(df[features])[:,1]))


✅ 18. Summary
The Confirmly AI Risk Engine provides:
Real-time, explainable risk scoring


Continuous self-improvement through retraining


MLflow-driven model governance


AI + human collaboration for accuracy and trust


Confirmly’s intelligence isn’t static — it learns, adapts, and safeguards eCommerce businesses at scale. 🧠⚙️
