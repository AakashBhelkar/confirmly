"""
Caching utilities for model predictions
"""
import redis
import json
import os
from typing import Optional, Dict, Any

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class Cache:
    """
    Redis-based cache for predictions
    """
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(REDIS_URL) if REDIS_URL else None
        except Exception as e:
            print(f"Error connecting to Redis: {e}")
            self.redis_client = None
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get cached value
        """
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Error getting from cache: {e}")
        
        return None
    
    def set(self, key: str, value: Dict[str, Any], ttl: int = 3600):
        """
        Set cached value with TTL
        """
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(value)
            )
        except Exception as e:
            print(f"Error setting cache: {e}")

cache = Cache()

