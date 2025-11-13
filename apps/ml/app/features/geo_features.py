"""
Geographic feature extraction
"""
from typing import Dict, Any

def extract_geo_features(order: Dict[str, Any]) -> Dict[str, float]:
    """
    Extract geographic features
    """
    customer = order.get('customer', {})
    features = {}
    
    # Country features
    country = customer.get('country', '')
    features['country_in'] = 1.0 if country == 'IN' else 0.0
    features['country_unknown'] = 1.0 if not country else 0.0
    
    # Pincode features (placeholder - would need actual pincode data)
    pincode = customer.get('pincode', '')
    features['has_pincode'] = 1.0 if pincode else 0.0
    features['pincode_length'] = float(len(pincode))
    
    # Address features
    address = customer.get('address', '')
    features['address_length'] = float(len(address))
    features['has_address'] = 1.0 if address else 0.0
    
    return features

