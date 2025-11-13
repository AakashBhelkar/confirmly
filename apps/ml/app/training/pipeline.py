"""
Model training pipeline for RTO risk scoring
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import lightgbm as lgb
import joblib
import os
from datetime import datetime
import mlflow
import mlflow.sklearn
from pymongo import MongoClient
from app.config import Config
from app.features.extractor import FeatureExtractor

class TrainingPipeline:
    """
    Training pipeline for risk scoring model
    """
    
    def __init__(self):
        self.config = Config()
        self.extractor = FeatureExtractor()
        self.scaler = StandardScaler()
        self.model = None
        
    def extract_data(self) -> pd.DataFrame:
        """
        Extract training data from MongoDB
        """
        client = MongoClient(self.config.MONGO_URI)
        db = client.get_database()
        
        # Query orders with known outcomes (confirmed/unconfirmed)
        orders = db.orders.find({
            'status': { '$in': ['confirmed', 'unconfirmed', 'canceled'] },
            'riskScore': { '$exists': True }
        })
        
        data = []
        for order in orders:
            # Extract features
            features = self.extractor.extract(order)
            
            # Add target (1 if confirmed, 0 if unconfirmed/canceled)
            features['target'] = 1 if order['status'] == 'confirmed' else 0
            
            data.append(features)
        
        client.close()
        
        return pd.DataFrame(data)
    
    def preprocess(self, df: pd.DataFrame) -> tuple:
        """
        Preprocess data for training
        """
        # Separate features and target
        X = df.drop('target', axis=1)
        y = df['target']
        
        # Handle missing values
        X = X.fillna(0)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_xgboost(self, X_train, y_train, X_test, y_test):
        """
        Train XGBoost model
        """
        mlflow.set_tracking_uri(self.config.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(self.config.MLFLOW_EXPERIMENT_NAME)
        
        with mlflow.start_run():
            # Train model
            model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric='logloss'
            )
            
            model.fit(
                X_train, y_train,
                eval_set=[(X_test, y_test)],
                early_stopping_rounds=10,
                verbose=False
            )
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            # Log metrics
            mlflow.log_metric("train_accuracy", train_score)
            mlflow.log_metric("test_accuracy", test_score)
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            
            self.model = model
            
            return model, test_score
    
    def train_lightgbm(self, X_train, y_train, X_test, y_test):
        """
        Train LightGBM model
        """
        mlflow.set_tracking_uri(self.config.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(self.config.MLFLOW_EXPERIMENT_NAME)
        
        with mlflow.start_run():
            # Train model
            model = lgb.LGBMClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                verbose=-1
            )
            
            model.fit(
                X_train, y_train,
                eval_set=[(X_test, y_test)],
                callbacks=[lgb.early_stopping(10), lgb.log_evaluation(0)]
            )
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            # Log metrics
            mlflow.log_metric("train_accuracy", train_score)
            mlflow.log_metric("test_accuracy", test_score)
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            
            self.model = model
            
            return model, test_score
    
    def save_model(self, model, model_path: str = None):
        """
        Save trained model
        """
        if model_path is None:
            model_path = self.config.MODEL_PATH
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        joblib.dump(model, model_path)
        
        # Save scaler
        scaler_path = model_path.replace('.pkl', '_scaler.pkl')
        joblib.dump(self.scaler, scaler_path)
        
        print(f"Model saved to {model_path}")
        print(f"Scaler saved to {scaler_path}")
    
    def run(self, model_type: str = 'xgboost'):
        """
        Run complete training pipeline
        """
        print("Starting training pipeline...")
        
        # Extract data
        print("Extracting data from MongoDB...")
        df = self.extract_data()
        print(f"Extracted {len(df)} samples")
        
        if len(df) < 100:
            print("Warning: Insufficient data for training. Need at least 100 samples.")
            return None
        
        # Preprocess
        print("Preprocessing data...")
        X_train, X_test, y_train, y_test = self.preprocess(df)
        
        # Train model
        print(f"Training {model_type} model...")
        if model_type == 'xgboost':
            model, score = self.train_xgboost(X_train, y_train, X_test, y_test)
        elif model_type == 'lightgbm':
            model, score = self.train_lightgbm(X_train, y_train, X_test, y_test)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        print(f"Model trained with test accuracy: {score:.4f}")
        
        # Save model
        self.save_model(model)
        
        return model

if __name__ == "__main__":
    pipeline = TrainingPipeline()
    pipeline.run(model_type='xgboost')

