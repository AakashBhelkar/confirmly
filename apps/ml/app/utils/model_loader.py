"""
Model loading utilities
"""
import joblib
import os
from typing import Any
import numpy as np

MODEL_PATH = os.getenv("MODEL_PATH", "./models/risk_model.pkl")
SCALER_PATH = MODEL_PATH.replace('.pkl', '_scaler.pkl')

class ModelLoader:
    """
    Load and manage ML models
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = MODEL_PATH
        self.scaler_path = SCALER_PATH
    
    def load_model(self) -> Any:
        """
        Load the risk scoring model
        """
        if self.model is None:
            try:
                if os.path.exists(self.model_path):
                    self.model = joblib.load(self.model_path)
                    print(f"Model loaded from {self.model_path}")
                else:
                    # Return a dummy model if no model file exists
                    from sklearn.ensemble import RandomForestRegressor
                    self.model = RandomForestRegressor()
                    print(f"Warning: Model file not found at {self.model_path}, using dummy model")
            except Exception as e:
                print(f"Error loading model: {e}")
                # Return a dummy model on error
                from sklearn.ensemble import RandomForestRegressor
                self.model = RandomForestRegressor()
        
        return self.model
    
    def load_scaler(self) -> Any:
        """
        Load the feature scaler
        """
        if self.scaler is None:
            try:
                if os.path.exists(self.scaler_path):
                    self.scaler = joblib.load(self.scaler_path)
                    print(f"Scaler loaded from {self.scaler_path}")
                else:
                    from sklearn.preprocessing import StandardScaler
                    self.scaler = StandardScaler()
                    print(f"Warning: Scaler file not found at {self.scaler_path}, using default scaler")
            except Exception as e:
                print(f"Error loading scaler: {e}")
                from sklearn.preprocessing import StandardScaler
                self.scaler = StandardScaler()
        
        return self.scaler
    
    def predict(self, features: dict) -> float:
        """
        Predict risk score for given features
        """
        model = self.load_model()
        scaler = self.load_scaler()
        
        # Convert features to array
        feature_array = np.array([list(features.values())])
        
        # Scale features
        if hasattr(scaler, 'transform'):
            feature_array = scaler.transform(feature_array)
        
        # Predict
        prediction = model.predict_proba(feature_array)[0]
        
        # Return risk score (probability of being unconfirmed)
        risk_score = (1 - prediction[1]) * 100 if len(prediction) > 1 else 50.0
        
        return float(risk_score)
    
    def reload_model(self):
        """
        Reload the model from disk
        """
        self.model = None
        self.scaler = None
        return self.load_model()

model_loader = ModelLoader()
