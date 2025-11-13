"""
Customer-level feature extraction
"""
from typing import Dict, Any

def extract_customer_features(order: Dict[str, Any]) -> Dict[str, float]:
    """
    Extract customer-level features
    """
    customer = order.get('customer', {})
    email = order.get('email', '')
    phone = order.get('phone', '')
    
    features = {}
    
    # Email features
    features['email_length'] = float(len(email))
    features['has_email'] = 1.0 if email else 0.0
    features['email_domain_count'] = float(len(email.split('@')) if '@' in email else 0)
    
    # Phone features
    features['phone_length'] = float(len(phone))
    features['has_phone'] = 1.0 if phone else 0.0
    features['phone_is_numeric'] = 1.0 if phone.isdigit() else 0.0
    
    # Address features
    features['has_address'] = 1.0 if customer.get('address') else 0.0
    features['has_pincode'] = 1.0 if customer.get('pincode') else 0.0
    features['pincode_length'] = float(len(customer.get('pincode', '')))
    
    # Name features
    name = customer.get('name', '')
    features['name_length'] = float(len(name))
    features['has_name'] = 1.0 if name else 0.0
    
    return features

