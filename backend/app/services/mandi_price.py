import requests
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
import json

class MandiPriceService:
    """Service to fetch live mandi prices from government API"""
    
    def __init__(self):
        # Official Indian Government Agriculture Market Data API
        self.data_gov_url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
        self.api_key = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
        
    def fetch_agmarknet_prices(
        self, 
        commodity: str = None, 
        state: str = None,
        district: str = None,
        from_date: date = None,
        to_date: date = None,
        limit: int = 100
    ) -> List[Dict]:
        """
        Fetch prices from data.gov.in API (Official Agmarknet data)
        
        Parameters:
        - commodity: Commodity name (e.g., "Tomato", "Wheat")
        - state: State name (e.g., "Maharashtra", "Punjab")
        - district: District name
        - from_date: Start date for price data
        - to_date: End date for price data
        - limit: Maximum records to fetch
        """
        try:
            # Default dates
            if not to_date:
                to_date = date.today()
            if not from_date:
                from_date = to_date - timedelta(days=7)
            
            params = {
                "api-key": self.api_key,
                "format": "json",
                "offset": "0",
                "limit": str(limit)
            }
            
            # Build filters
            filters = {}
            if commodity:
                filters["commodity"] = commodity
            if state:
                filters["state"] = state
            if district:
                filters["district"] = district
            
            if filters:
                params["filters"] = json.dumps(filters)
            
            print(f"Fetching from API with params: {params}")
            
            response = requests.get(
                self.data_gov_url, 
                params=params, 
                timeout=15
            )
            
            print(f"API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "records" in data and data["records"]:
                    print(f"Found {len(data['records'])} records")
                    return self._normalize_api_data(data["records"])
                else:
                    print("No records found in API response")
                    return []
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return []
            
        except requests.exceptions.Timeout:
            print("API request timed out")
            return []
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return []
        except Exception as e:
            print(f"Error fetching from API: {e}")
            return []
    
    def _normalize_api_data(self, records: List[Dict]) -> List[Dict]:
        """
        Normalize API response data to consistent format
        
        API fields may vary, common fields include:
        - state, district, market
        - commodity, variety, grade
        - min_price, max_price, modal_price
        - arrival_date, reported_date
        """
        normalized = []
        
        for record in records:
            try:
                # Handle different possible field names from API
                normalized_record = {
                    "state": record.get("state", ""),
                    "district": record.get("district", ""),
                    "market": record.get("market", ""),
                    "commodity": record.get("commodity", ""),
                    "variety": record.get("variety", ""),
                    "grade": record.get("grade", ""),
                    "min_price": self._parse_price(record.get("min_price", 0)),
                    "max_price": self._parse_price(record.get("max_price", 0)),
                    "modal_price": self._parse_price(record.get("modal_price", 0)),
                    "arrival_date": record.get("arrival_date", date.today().isoformat()),
                }
                
                # Only add if we have valid price data
                if normalized_record["modal_price"] > 0:
                    normalized.append(normalized_record)
                    
            except Exception as e:
                print(f"Error normalizing record: {e}")
                continue
        
        return normalized
    
    def _parse_price(self, price_value) -> float:
        """Parse price value handling different formats"""
        try:
            if isinstance(price_value, (int, float)):
                return float(price_value)
            if isinstance(price_value, str):
                # Remove commas and other characters
                cleaned = price_value.replace(",", "").strip()
                return float(cleaned)
            return 0.0
        except:
            return 0.0
    
    def search_by_location(self, state: str = None, district: str = None) -> List[Dict]:
        """Search prices by location - ONLY from API"""
        return self.fetch_agmarknet_prices(state=state, district=district)
    
    def search_by_commodity(self, commodity: str, state: str = None) -> List[Dict]:
        """Search prices by commodity"""
        return self.fetch_agmarknet_prices(commodity=commodity, state=state)
    
    def get_all_prices(self, limit: int = 50) -> List[Dict]:
        """Get general latest prices"""
        return self.fetch_agmarknet_prices(limit=limit)


    def get_price_trend(self, commodity: str, state: str = None, days: int = 30) -> Dict:
        """Calculate price trend for a commodity"""
        # This would query historical data from database
        # For now, return mock trend data
        dates = [(date.today() - timedelta(days=i)).isoformat() for i in range(days, 0, -1)]
        
        # Generate mock prices with slight variations
        base_price = 1500
        prices = [base_price + (i * 10) + ((-1) ** i * 50) for i in range(days)]
        
        avg_price = sum(prices) / len(prices)
        
        # Determine trend
        recent_avg = sum(prices[-7:]) / 7
        older_avg = sum(prices[:7]) / 7
        
        if recent_avg > older_avg * 1.05:
            trend = "up"
        elif recent_avg < older_avg * 0.95:
            trend = "down"
        else:
            trend = "stable"
        
        return {
            "commodity": commodity,
            "dates": dates,
            "state": state,
            "prices": prices,
            "average_price": round(avg_price, 2),
            "min_price": min(prices),
            "max_price": max(prices),
            "trend": trend
        }
    
    
    # def get_price_trend(self, commodity: str, state: str = None, days: int = 30) -> Dict:
    #     """
    #     Calculate price trend for a commodity over specified days
    #     Fetches historical data from API
    #     """
    #     try:
    #         from_date = date.today() - timedelta(days=days)
    #         to_date = date.today()
            
    #         # Fetch historical data
    #         prices = self.fetch_agmarknet_prices(
    #             commodity=commodity,
    #             state=state,
    #             from_date=from_date,
    #             to_date=to_date,
    #             limit=365  # Get more data for trends
    #         )
            
    #         if not prices:
    #             return {
    #                 "commodity": commodity,
    #                 "dates": [],
    #                 "prices": [],
    #                 "average_price": 0,
    #                 "min_price": 0,
    #                 "max_price": 0,
    #                 "trend": "no_data"
    #             }
            
    #         # Sort by date
    #         sorted_prices = sorted(prices, key=lambda x: x["arrival_date"])
            
    #         # Extract dates and prices
    #         dates = [p["arrival_date"] for p in sorted_prices]
    #         price_values = [p["modal_price"] for p in sorted_prices]
            
    #         # Calculate statistics
    #         avg_price = sum(price_values) / len(price_values) if price_values else 0
            
    #         # Determine trend
    #         if len(price_values) >= 7:
    #             recent_avg = sum(price_values[-7:]) / 7
    #             older_avg = sum(price_values[:7]) / 7
                
    #             if recent_avg > older_avg * 1.05:
    #                 trend = "up"
    #             elif recent_avg < older_avg * 0.95:
    #                 trend = "down"
    #             else:
    #                 trend = "stable"
    #         else:
    #             trend = "insufficient_data"
            
    #         return {
    #             "commodity": commodity,
    #             "dates": dates,
    #             "prices": price_values,
    #             "average_price": round(avg_price, 2),
    #             "min_price": min(price_values) if price_values else 0,
    #             "max_price": max(price_values) if price_values else 0,
    #             "trend": trend,
    #             "data_points": len(price_values)
    #         }
            
    #     except Exception as e:
    #         print(f"Error calculating trend: {e}")
    #         return {
    #             "commodity": commodity,
    #             "dates": [],
    #             "prices": [],
    #             "average_price": 0,
    #             "min_price": 0,
    #             "max_price": 0,
    #             "trend": "error"
    #         }
    
    def get_popular_commodities(self) -> List[str]:
        """Get list of popular commodities in India"""
        return [
            "Tomato",
            "Potato",
            "Onion",
            "Rice",
            "Wheat",
            "Maize",
            "Cotton",
            "Sugarcane",
            "Soybean",
            "Groundnut",
            "Bajra",
            "Jowar",
            "Tur(Arhar)",
            "Gram",
            "Apple",
            "Banana",
            "Mango",
            "Grapes",
            "Cabbage",
            "Cauliflower",
            "Brinjal",
            "Chilli",
            "Coriander",
            "Garlic",
            "Ginger",
        ]
    
    def get_states_list(self) -> List[str]:
        """Get list of Indian states"""
        return [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Delhi",
        ]


# Initialize service
mandi_service = MandiPriceService()