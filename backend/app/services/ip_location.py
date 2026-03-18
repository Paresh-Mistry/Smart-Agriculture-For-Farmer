import requests
import os
from typing import Optional, Dict
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

class IPLocationService:
    """
    Automatically detect user location from IP address
    Uses multiple free geolocation APIs as fallback
    """
    
    def __init__(self):
        self.ipapi_url = "http://ip-api.com/json"
        self.ipinfo_url = "https://ipapi.co"
        self.cache = {}
    
    def get_client_ip(self, request: Request) -> str:
        """
        Extract real client IP from request
        Handles proxies and load balancers
        """
        # Check common proxy headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the first IP if multiple are present
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client
        if request.client:
            return request.client.host
        
        return "127.0.0.1"
    
    def get_location_from_ip(self, ip: str) -> Optional[Dict]:
        """
        Get location details from IP address
        Returns: {lat, lon, city, region, country}
        """
        # Skip localhost
        if ip in ["127.0.0.1", "localhost", "::1"]:
            logger.info("Localhost detected, using default location (Mumbai)")
            return {
                "latitude": 19.0760,
                "longitude": 72.8777,
                "city": "Mumbai",
                "region": "Maharashtra",
                "country": "India",
                "source": "default"
            }
        
        # Check cache
        if ip in self.cache:
            logger.info(f"Location from cache for IP: {ip}")
            return self.cache[ip]
        
        # Try ip-api.com (free, no key required)
        try:
            response = requests.get(
                f"{self.ipapi_url}/{ip}",
                params={"fields": "status,country,regionName,city,lat,lon,timezone"},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("status") == "success":
                    location = {
                        "latitude": data.get("lat"),
                        "longitude": data.get("lon"),
                        "city": data.get("city"),
                        "region": data.get("regionName"),
                        "country": data.get("country"),
                        "timezone": data.get("timezone"),
                        "source": "ip-api.com"
                    }
                    
                    # Cache the result
                    self.cache[ip] = location
                    logger.info(f"Location detected: {location['city']}, {location['region']}")
                    return location
        
        except Exception as e:
            logger.error(f"ip-api.com failed: {e}")
        
        # Fallback to ipapi.co
        try:
            response = requests.get(
                f"{self.ipinfo_url}/{ip}/json",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                location = {
                    "latitude": float(data.get("latitude", 0)),
                    "longitude": float(data.get("longitude", 0)),
                    "city": data.get("city"),
                    "region": data.get("region"),
                    "country": data.get("country_name"),
                    "timezone": data.get("timezone"),
                    "source": "ipapi.co"
                }
                
                self.cache[ip] = location
                logger.info(f"Location detected (fallback): {location['city']}, {location['region']}")
                return location
        
        except Exception as e:
            logger.error(f"ipapi.co failed: {e}")
        
        # Final fallback - return default India location
        logger.warning(f"Could not detect location for IP {ip}, using default")
        return {
            "latitude": 20.5937,
            "longitude": 78.9629,
            "city": "India",
            "region": "Central",
            "country": "India",
            "source": "default"
        }
    
    def get_location_from_request(self, request: Request) -> Dict:
        """
        Complete flow: Extract IP from request and get location
        """
        ip = self.get_client_ip(request)
        logger.info(f"Detected IP: {ip}")
        
        location = self.get_location_from_ip(ip)
        location["ip_address"] = ip
        
        return location


# Initialize service
ip_location_service = IPLocationService()