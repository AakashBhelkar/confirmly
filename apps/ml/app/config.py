import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "")
    
    # Redis
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # AWS
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    S3_BUCKET = os.getenv("S3_BUCKET", "confirmly-models")
    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
    
    # MLflow
    MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    MLFLOW_EXPERIMENT_NAME = os.getenv("MLFLOW_EXPERIMENT_NAME", "confirmly-risk-engine")
    
    # Model
    MODEL_PATH = os.getenv("MODEL_PATH", "./models/risk_model.pkl")
    MODEL_VERSION = os.getenv("MODEL_VERSION", "v1.0.0")
    
    # API
    ML_API_KEY = os.getenv("ML_API_KEY", "")
    PORT = int(os.getenv("PORT", 5000))
    
    # App
    NODE_ENV = os.getenv("NODE_ENV", "development")

config = Config()

