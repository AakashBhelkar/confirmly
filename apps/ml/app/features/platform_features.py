"""
Platform-level feature extraction
"""
from typing import Dict, Any

def extract_platform_features(order: Dict[str, Any]) -> Dict[str, float]:
    """
    Extract platform-level features
    """
    features = {}
    
    # Platform type
    platform = order.get('platform', '')
    features['platform_shopify'] = 1.0 if platform == 'shopify' else 0.0
    features['platform_woocommerce'] = 1.0 if platform == 'woocommerce' else 0.0
    features['platform_api'] = 1.0 if platform == 'api' else 0.0
    
    return features

