Confirmly AI/ML Risk Engine — Architecture, Pipeline, and Governance

🧭 1. Overview
The Confirmly AI Risk Engine predicts whether an incoming eCommerce order is at risk of becoming an RTO (Return to Origin) — based on signals such as payment mode, pincode reliability, customer history, and past confirmation outcomes.
This document outlines the full ML lifecycle, including:
Data ingestion & feature engineering


Model training, validation, and deployment


Model registry & versioning


Retraining and drift detection


Integration with Confirmly backend



🧱 2. Architecture Overview
ML Stack Summary
Layer
Tool/Tech
Purpose
Data Storage
MongoDB Atlas
Source for labeled orders
Feature Store
Pandas + Parquet (S3)
Persist engineered features
Modeling Framework
scikit-learn, XGBoost
Training + inference
Serving Layer
FastAPI (Python)
Real-time scoring API
Registry
MLflow
Model tracking & version control
Monitoring
Grafana + Prometheus
Latency & health metrics
Drift Detection
Python (Kolmogorov-Smirnov tests)
Detect data drift weekly


⚙️ 3. Core Objective
Predict a risk_score ∈ [0, 1] representing the probability an order will fail confirmation or be canceled before delivery.
Thresholds (default):
0.0–0.4 → Low risk ✅


0.4–0.8 → Medium risk ⚠️


0.8–1.0 → High risk 🚫


Used in automation policies:
“Auto-confirm if risk < 0.5, Auto-cancel if > 0.9 and unconfirmed in 12h.”

🧮 4. Data Sources & Labeling
4.1 Data Sources
Orders collection in MongoDB:


payment_mode, amount, pincode, customer.email, risk_score


status: confirmed/unconfirmed/canceled


autoActions logs for true outcome


EventLog collection:


Confirmation timestamps


Channel performance per order


Merchant configuration:


Region, policy rules, shipping zones


4.2 Labeling Strategy
Label = 1 (RTO) if:


Order canceled due to unconfirmation


Marked as “RTO” in merchant’s system via webhook


Label = 0 (Successful) otherwise.


Cold start: synthetic bootstrap labels via early confirmation analytics.



🧩 5. Feature Engineering
Feature Groups:
Group
Example Features
Customer Behavior
repeat_customer, cancel_count, avg_order_value, email_domain_risk
Order Data
amount, payment_mode, item_count, order_hour, weekday
Geo Risk
pincode_risk_index, city_risk_score, distance_to_wh
Merchant Stats
merchant_rto_rate, merchant_avg_confirmation_time
Channel Signals
whatsapp_reply_time, email_open_rate, sms_delivery_success

Feature transformations are handled by pipeline/feature_builder.py.

🔬 6. Model Training Pipeline
6.1 Workflow Steps
Data Pull


Fetch last 90 days of orders from MongoDB.


Filter payment_mode=COD.


Feature Engineering


Derive numerical + categorical features.


One-hot encode non-numeric variables.


Train/Test Split

 X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True)


Model Training

 import xgboost as xgb
model = xgb.XGBClassifier(max_depth=6, learning_rate=0.1, n_estimators=200)
model.fit(X_train, y_train)


Validation


Metrics: AUC, Precision@Top10%, Recall, F1


from sklearn.metrics import roc_auc_score, f1_score
auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
print("AUC:", auc)


Save Model

 joblib.dump(model, "model.pkl")


Register Model in MLflow

 import mlflow
mlflow.set_tracking_uri("http://mlflow.confirmly.io")
mlflow.sklearn.log_model(model, "rto_model")
mlflow.log_metric("AUC", auc)



📦 7. Model Registry & Versioning
Model ID
Date
Version
AUC
Notes
Status
rto_model_v1
2025-10-01
1.0
0.82
Initial model
Active
rto_model_v2
2025-11-01
1.1
0.86
Retrained on more pincode data
Testing
rto_model_v3
TBD
1.2
TBD
Next scheduled retrain
Planned

Model versions are managed in MLflow Registry:
“Staging” → evaluated but not live


“Production” → serving traffic


“Archived” → deprecated



☁️ 8. Serving & Integration
FastAPI Endpoint (apps/ml/app/main.py)
@app.post("/score")
def score(order: OrderFeatures):
    X = np.array([[
        order.amount,
        order.pincode_risk,
        order.past_cancels,
        1 if order.is_repeat_customer else 0
    ]])
    score = float(model.predict_proba(X)[0][1])
    return {"risk_score": round(score, 3)}

Backend Integration
The Confirmly API sends:
POST /ml/score
{
  "amount": 799,
  "pincode_risk": 0.8,
  "past_cancels": 2,
  "is_repeat_customer": false
}

Response:
{
  "risk_score": 0.87
}

Stored in MongoDB orders.riskScore.

🧠 9. Retraining & Automation
Schedule:
Retrain every 14 days via cron or GitHub Action.


Triggers MLflow experiment run → evaluates metrics → updates registry.


Automation Script (pipeline/retrain.py):
if auc > last_auc:
    mlflow.register_model("rto_model_v3", "Production")
else:
    print("Model not promoted - no improvement.")

Notification:
Slack alert → “New model rto_model_v3 promoted to production (AUC 0.87 → 0.89).”



📈 10. Drift Detection
Weekly job compares feature distributions:
from scipy.stats import ks_2samp
pval = ks_2samp(feature_old, feature_new).pvalue
if pval < 0.05:
    print("⚠️ Data drift detected in feature:", feature_name)

If drift > 30% of monitored features → force retrain.

🔍 11. Explainability (Model Insights)
Feature Importance
Display top 10 impactful features in dashboard:


Feature
Importance
payment_mode
0.26
pincode_risk
0.22
past_cancels
0.18
repeat_customer
0.14




SHAP Values
Use shap.TreeExplainer(model) for local explanations.


Optional: expose /explain endpoint to show why a score was high.



🔄 12. Rule-Based Fallback
If ML service unavailable or low confidence (confidence < 0.5):
Apply rule engine defined in policies:

 IF COD + high-risk pincode → confirm via both WhatsApp + SMS


Rules versioned alongside ML models in /pipeline/ruleset.yaml.



🧩 13. Performance Targets
Metric
Target
Latency (avg)
< 200ms
Uptime
99.5%
AUC (production)
> 0.85
Drift detection accuracy
> 90%
Retrain success rate
100% automated


📊 14. Monitoring Dashboard (Grafana)
Panels:
Model AUC over time (from MLflow)


API latency (FastAPI)


Scoring volume/day


Drift % over last 7 days


Error rates by feature source


Alerts auto-post to Slack:
“⚠️ Drift detected in pincode_risk.”


“🧠 Retrain failed: insufficient labeled data.”



🔐 15. Security & Data Protection
No PII leaves the Confirmly ecosystem.


All order/customer data anonymized before training:


Emails → hashed domains only.


Names → removed.


Encrypted S3 bucket for feature store.


All model artifacts versioned & access-controlled (IAM roles).



🧾 16. Maintenance SOP
Task
Frequency
Owner
Retraining job
Bi-weekly
ML Engineer
Feature importance update
Monthly
Data Analyst
Drift detection audit
Weekly
DevOps
Model rollback test
Quarterly
Lead Engineer
AUC benchmarking
Bi-weekly
ML Engineer


✅ 17. Summary
The Confirmly ML Risk Engine is a self-contained, monitored, and versioned pipeline that:
Continuously improves accuracy with data.


Detects and mitigates drift.


Integrates seamlessly with backend APIs.


Is fully explainable, secure, and cost-efficient.
