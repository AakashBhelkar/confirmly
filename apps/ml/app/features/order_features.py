"""
Order-level feature extraction
"""
from typing import Dict, Any

def extract_order_features(order: Dict[str, Any]) -> Dict[str, float]:
    """
    Extract order-level features
    """
    features = {}
    
    # Amount features
    amount = float(order.get('amount', 0))
    features['amount'] = amount
    features['amount_log'] = float(__import__('math').log(amount + 1))
    features['amount_sqrt'] = float(__import__('math').sqrt(amount))
    
    # Payment mode features
    payment_mode = order.get('paymentMode', '')
    features['is_cod'] = 1.0 if payment_mode == 'cod' else 0.0
    features['is_prepaid'] = 1.0 if payment_mode == 'prepaid' else 0.0
    
    # Currency features
    currency = order.get('currency', 'INR')
    features['currency_inr'] = 1.0 if currency == 'INR' else 0.0
    
    # Platform features
    platform = order.get('platform', '')
    features['platform_shopify'] = 1.0 if platform == 'shopify' else 0.0
    features['platform_woocommerce'] = 1.0 if platform == 'woocommerce' else 0.0
    
    return features

