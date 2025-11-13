"""
Feature extraction for risk scoring
"""
from typing import Dict, Any
import pandas as pd

class FeatureExtractor:
    """
    Extract features from order data for risk scoring
    """
    
    def extract(self, order: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract features from order data
        Returns a dictionary of feature names and values
        """
        features = {}
        
        # Order-level features
        features['amount'] = float(order.get('amount', 0))
        features['is_cod'] = 1.0 if order.get('paymentMode') == 'cod' else 0.0
        features['is_prepaid'] = 1.0 if order.get('paymentMode') == 'prepaid' else 0.0
        
        # Customer features
        customer = order.get('customer', {})
        features['has_address'] = 1.0 if customer.get('address') else 0.0
        features['has_pincode'] = 1.0 if customer.get('pincode') else 0.0
        
        # Email features
        email = order.get('email', '')
        features['has_email'] = 1.0 if email else 0.0
        features['email_length'] = float(len(email))
        
        # Phone features
        phone = order.get('phone', '')
        features['has_phone'] = 1.0 if phone else 0.0
        features['phone_length'] = float(len(phone))
        
        # Geo features (placeholder - would need actual geo data)
        features['country_code'] = 1.0 if customer.get('country') == 'IN' else 0.0
        
        return features
    
    def extract_batch(self, orders: list) -> pd.DataFrame:
        """
        Extract features from a batch of orders
        Returns a pandas DataFrame
        """
        features_list = [self.extract(order) for order in orders]
        return pd.DataFrame(features_list)

