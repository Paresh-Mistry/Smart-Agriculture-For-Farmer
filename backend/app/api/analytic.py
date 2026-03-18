import os
import requests
import json
from typing import Dict, Any, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..config.database import get_db
from ..models.crop import CropListing
from .users import get_current_user_from_token
from datetime import datetime, timedelta
from typing import Dict, Any
import json
import pytz

logger = logging.getLogger(__name__)

class OllamaAIService:
    def __init__(self):
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.default_model = os.getenv("OLLAMA_MODEL", "sike_aditya/AgriLlama")
        self.timeout = int(os.getenv("OLLAMA_TIMEOUT", "60"))
        
    def check_ollama_status(self) -> bool:
        """Check if Ollama service is running"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama service not available: {e}")
            return False
    
    def list_available_models(self) -> list:
        """List all available Ollama models"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []
    
    def generate(self, prompt: str, model: str = None, temperature: float = 0.7) -> str:
        """
        Generate text using Ollama
        
        Args:
            prompt: The input prompt
            model: Model name (default: llama3.2)
            temperature: Creativity level 0.0-1.0
        """
        model = model or self.default_model
        
        try:
            logger.info(f"Generating with Ollama model: {model}")
            
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "top_p": 0.9,
                        "top_k": 40,
                        "num_predict": 1024,  # max tokens
                    }
                },
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return self.generate_fallback_insights()
                
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out")
            return self.generate_fallback_insights()
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return self.generate_fallback_insights()
    
    def generate_farmer_insights(self, data: Dict[str, Any]) -> str:
        """Generate insights for farmers"""
        
        prompt = f"""You are an expert agricultural business consultant. Analyze this farmer's performance data and provide clear, actionable insights.

            PERFORMANCE METRICS:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 Total Crops Listed: {data.get('total_crops', 0)}
            ✅ Active Listings: {data.get('active_listings', 0)}
            💰 Total Revenue: ₹{data.get('total_revenue', 0):,.2f}
            📈 Average Price/kg: ₹{data.get('avg_price', 0):.2f}
            👁️  Total Views: {data.get('total_views', 0)}
            🎯 Conversion Rate: {data.get('conversion_rate', 0):.1f}%

            REVENUE BREAKDOWN:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Last 7 Days: ₹{data.get('last_7_days_revenue', 0):,.2f}
            Last 30 Days: ₹{data.get('last_30_days_revenue', 0):,.2f}

            CROP CATEGORIES:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            {self._format_distribution(data.get('crop_distribution', {}))}

            TOP PERFORMERS:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            🏆 Most Viewed: {data.get('most_viewed_crop', 'N/A')}
            ⭐ Best Category: {data.get('best_category', 'N/A')}

            ALERTS:
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ⚠️  Expiring Soon: {data.get('expiring_soon_count', 0)} crops
            📉 Low Performance: {data.get('low_performing_count', 0)} listings

            Provide a comprehensive analysis with:

            1. PERFORMANCE SUMMARY (2-3 sentences)
            2. KEY STRENGTHS (2-3 specific points)
            3. ACTIONABLE RECOMMENDATIONS (4-5 specific steps to increase sales)
            4. PRICING STRATEGY (advice based on market performance)
            5. URGENT ACTIONS (if any immediate issues need attention)

            Keep it practical, farmer-friendly, and focused on increasing revenue. Use simple language."""

        return self.generate(prompt, temperature=0.7)
    
    def generate_buyer_insights(self, data: Dict[str, Any]) -> str:
        """Generate recommendations for buyers"""
        
        prompt = f"""You are a smart procurement advisor helping buyers save money and make better purchasing decisions. Analyze this buyer's data.

PURCHASE HISTORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 Total Orders: {data.get('total_orders', 0)}
💸 Total Spent: ₹{data.get('total_spent', 0):,.2f}
📊 Avg Order Value: ₹{data.get('avg_order_value', 0):,.2f}
❤️  Favorite Categories: {', '.join(data.get('favorite_categories', []))}

BUYING PATTERNS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 Most Purchased: {data.get('most_purchased', 'N/A')}
📅 Frequency: {data.get('purchase_frequency', 'N/A')}
🕐 Last Purchase: {data.get('last_purchase_date', 'N/A')}

PRICE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Avg Price Paid: ₹{data.get('avg_price_paid', 0):.2f}/kg
💵 Potential Savings: ₹{data.get('potential_savings', 0):,.2f}

CURRENT BEST DEALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{self._format_deals(data.get('best_deals', []))}

Provide helpful recommendations:

1. SPENDING ANALYSIS (2-3 observations about patterns)
2. MONEY-SAVING TIPS (4-5 specific ways to reduce costs)
3. SMART BUY RECOMMENDATIONS (what to buy now and why)
4. SEASONAL OPPORTUNITIES (crops in season at best prices)
5. DEAL ALERTS (highlight exceptional current deals)

Focus on practical money-saving advice and value optimization."""

        return self.generate(prompt, temperature=0.7)
    
    def _format_distribution(self, distribution: Dict[str, int]) -> str:
        """Format category distribution for display"""
        if not distribution:
            return "No data available"
        
        lines = []
        for category, count in distribution.items():
            lines.append(f"  • {category}: {count} crops")
        return "\n".join(lines)
    
    def _format_deals(self, deals: list) -> str:
        """Format deals list for display"""
        if not deals:
            return "No active deals"
        
        return "\n".join([f"  • {deal}" for deal in deals[:3]])
    
    def generate_fallback_insights(self) -> str:
        """
        Fallback insights when Ollama is unavailable
        """
        return """🤖 AI Analysis Service

**STATUS**: Ollama AI service is currently unavailable.

**BASIC RECOMMENDATIONS**:

✅ **Performance Tips**
- Keep your crop listings updated with fresh images
- Respond quickly to buyer inquiries
- Offer competitive pricing based on market rates
- Add detailed descriptions to build trust

📊 **Data Review**
- Monitor your top-performing categories
- Track which crops get the most views
- Adjust prices for items with low engagement
- Focus on your best-selling products

⚠️ **Action Items**
- Check for expiring crops and mark them down
- Review listings with low views (consider price adjustment)
- Update seasonal availability
- Maintain accurate stock levels

💡 **Growth Strategies**
- Offer bulk discounts to attract larger orders
- Consider seasonal promotions
- Build relationships with repeat buyers
- Expand successful crop categories

📞 **Need Help?**
Please ensure Ollama is running on your server for AI-powered insights.
Contact support if the issue persists.
"""


# Initialize global service
ai_service = OllamaAIService()


router = APIRouter()

def make_naive(dt):
    """Convert datetime to naive (remove timezone info)"""
    if dt is None:
        return None
    if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt

# Or helper to make timezone-aware
def make_aware(dt, timezone='UTC'):
    """Convert datetime to aware (add timezone info)"""
    if dt is None:
        return None
    if hasattr(dt, 'tzinfo') and dt.tzinfo is None:
        tz = pytz.timezone(timezone)
        return tz.localize(dt)
    return dt


@router.get("/farmer/dashboard")
async def get_farmer_dashboard(
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive farmer dashboard with AI insights
    """
    try:
        farmer_id = current_user.id
        
        # Get all crops for this farmer
        all_crops = db.query(CropListing).filter(CropListing.farmer_id == farmer_id).all()
        
        # Basic metrics
        total_crops = len(all_crops)
        active_listings = len([c for c in all_crops if c.status == "AVAILABLE"])
        sold_crops = len([c for c in all_crops if c.status == "SOLD"])
        
        # Revenue calculations
        total_revenue = sum([c.price_per_kg * c.quantity_kg for c in all_crops if c.status == "SOLD"])
        
        # Average price
        avg_price = db.query(func.avg(CropListing.price_per_kg))\
            .filter(CropListing.farmer_id == farmer_id)\
            .scalar() or 0
        
        # Total views
        total_views = db.query(func.sum(CropListing.views_count))\
            .filter(CropListing.farmer_id == farmer_id)\
            .scalar() or 0
        
        # Conversion rate
        conversion_rate = (sold_crops / total_crops * 100) if total_crops > 0 else 0
        
        # Category distribution
        category_distribution = db.query(
            CropListing.category,
            func.count(CropListing.id).label('count')
        ).filter(CropListing.farmer_id == farmer_id)\
         .group_by(CropListing.category)\
         .all()
        
        crop_distribution = {cat: count for cat, count in category_distribution}
        
        # Time-based analytics - FIX: Make all datetimes naive
        now = datetime.now()  # This is naive by default
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)
        
        # Filter crops with naive datetime comparison
        last_7_days_crops = [
            c for c in all_crops 
            if make_naive(c.created_at) >= last_7_days and c.status == "SOLD"
        ]
        last_30_days_crops = [
            c for c in all_crops 
            if make_naive(c.created_at) >= last_30_days and c.status == "SOLD"
        ]
        
        last_7_days_revenue = sum([c.price_per_kg * c.quantity_kg for c in last_7_days_crops])
        last_30_days_revenue = sum([c.price_per_kg * c.quantity_kg for c in last_30_days_crops])
        
        # Most viewed crop
        most_viewed = db.query(CropListing)\
            .filter(CropListing.farmer_id == farmer_id)\
            .order_by(desc(CropListing.views_count))\
            .first()
        
        # Best selling category
        best_category = db.query(CropListing.category)\
            .filter(CropListing.farmer_id == farmer_id, CropListing.status == "SOLD")\
            .group_by(CropListing.category)\
            .order_by(desc(func.count(CropListing.id)))\
            .first()
        
        # Expiring soon crops - FIX: Compare dates properly
        today = datetime.now().date()
        expiring_threshold = today + timedelta(days=7)
        
        expiring_soon = []
        for crop in all_crops:
            if (crop.status == "AVAILABLE" and 
                crop.expiry_date is not None and 
                crop.expiry_date <= expiring_threshold):
                expiring_soon.append(crop)
        
        # Low performing crops - FIX: Use naive datetime
        seven_days_ago = now - timedelta(days=7)
        low_performing = []
        for crop in all_crops:
            crop_created = make_naive(crop.created_at)
            if (crop.status == "AVAILABLE" and 
                crop.views_count < 5 and 
                crop_created < seven_days_ago):
                low_performing.append(crop)
        
        # Prepare data for AI
        analytics_data = {
            "total_crops": total_crops,
            "active_listings": active_listings,
            "sold_crops": sold_crops,
            "total_revenue": round(total_revenue, 2),
            "avg_price": round(avg_price, 2),
            "total_views": total_views,
            "conversion_rate": round(conversion_rate, 2),
            "crop_distribution": crop_distribution,
            "last_7_days_revenue": round(last_7_days_revenue, 2),
            "last_30_days_revenue": round(last_30_days_revenue, 2),
            "most_viewed_crop": most_viewed.crop_name if most_viewed else "N/A",
            "best_category": best_category[0] if best_category else "N/A",
            "expiring_soon_count": len(expiring_soon),
            "low_performing_count": len(low_performing)
        }
        
        # Get AI insights from Ollama
        ai_insights = ai_service.generate_farmer_insights(analytics_data)
        
        # Calculate growth rate
        avg_weekly_revenue = last_30_days_revenue / 4 if last_30_days_revenue > 0 else 1
        growth_rate = ((last_7_days_revenue - avg_weekly_revenue) / avg_weekly_revenue * 100) if avg_weekly_revenue > 0 else 0
        
        return {
            "summary": {
                "total_crops": total_crops,
                "active_listings": active_listings,
                "sold_crops": sold_crops,
                "total_revenue": round(total_revenue, 2),
                "avg_price_per_kg": round(avg_price, 2),
                "total_views": total_views,
                "conversion_rate": round(conversion_rate, 2)
            },
            "revenue": {
                "total": round(total_revenue, 2),
                "last_7_days": round(last_7_days_revenue, 2),
                "last_30_days": round(last_30_days_revenue, 2),
                "growth_rate": round(growth_rate, 2)
            },
            "category_distribution": crop_distribution,
            "top_performers": {
                "most_viewed": {
                    "crop_name": most_viewed.crop_name if most_viewed else None,
                    "views": most_viewed.views_count if most_viewed else 0,
                    "category": most_viewed.category if most_viewed else None
                },
                "best_category": best_category[0] if best_category else None
            },
            "alerts": {
                "expiring_soon": [
                    {
                        "id": str(crop.id),
                        "crop_name": crop.crop_name,
                        "expiry_date": crop.expiry_date.isoformat(),
                        "days_left": (crop.expiry_date - today).days
                    } for crop in expiring_soon
                ],
                "low_performing": [
                    {
                        "id": str(crop.id),
                        "crop_name": crop.crop_name,
                        "views": crop.views_count,
                        "days_listed": (now - make_naive(crop.created_at)).days
                    } for crop in low_performing
                ]
            },
            "ai_insights": ai_insights,
            "ai_status": {
                "service": "Ollama",
                "model": ai_service.default_model,
                "available": ai_service.check_ollama_status()
            }
        }
        
    except Exception as error:
        import traceback
        print(f"Error details: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard: {str(error)}")



@router.get("/buyer/dashboard")
async def get_buyer_dashboard(
    current_user: dict = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive buyer dashboard with AI recommendations
    """
    try:
        buyer_id = current_user.id
        
        # Recent views
        recent_views = db.query(CropListing)\
            .filter(CropListing.status == "AVAILABLE")\
            .order_by(desc(CropListing.created_at))\
            .limit(20)\
            .all()
        
        # Mock order data (replace with real Order model queries)
        total_orders = 15
        total_spent = 45000
        avg_order_value = total_spent / total_orders if total_orders > 0 else 0
        
        favorite_categories = ["VEGETABLES", "FRUITS"]
        
        # Best deals available
        best_deals = db.query(CropListing)\
            .filter(
                CropListing.status == "AVAILABLE",
                CropListing.discount_percent > 0
            )\
            .order_by(desc(CropListing.discount_percent))\
            .limit(5)\
            .all()
        
        # Seasonal crops
        current_month = datetime.now().month
        seasonal_crops = db.query(CropListing)\
            .filter(
                CropListing.status == "AVAILABLE",
                func.extract('month', CropListing.harvest_date) == current_month
            )\
            .limit(10)\
            .all()
        
        # Price insights
        price_insights = db.query(
            CropListing.category,
            func.avg(CropListing.price_per_kg).label('avg_price'),
            func.min(CropListing.price_per_kg).label('min_price'),
            func.max(CropListing.price_per_kg).label('max_price')
        ).filter(CropListing.status == "AVAILABLE")\
         .group_by(CropListing.category)\
         .all()
        
        # Prepare AI data
        analytics_data = {
            "total_orders": total_orders,
            "total_spent": total_spent,
            "avg_order_value": round(avg_order_value, 2),
            "favorite_categories": favorite_categories,
            "most_purchased": "Tomatoes",
            "purchase_frequency": "Weekly",
            "last_purchase_date": "2025-01-28",
            "avg_price_paid": round(avg_order_value / 50, 2),
            "best_deals": [f"{deal.crop_name} - {deal.discount_percent}% off" for deal in best_deals[:3]],
            "potential_savings": 2500,
            "browsing_categories": favorite_categories
        }
        
        # Get AI recommendations from Ollama
        ai_insights = ai_service.generate_buyer_insights(analytics_data)
        
        return {
            "summary": {
                "total_orders": total_orders,
                "total_spent": round(total_spent, 2),
                "avg_order_value": round(avg_order_value, 2),
                "active_searches": len(recent_views)
            },
            "preferences": {
                "favorite_categories": favorite_categories,
                "recent_views": [
                    {
                        "id": str(crop.id),
                        "crop_name": crop.crop_name,
                        "category": crop.category,
                        "price_per_kg": crop.price_per_kg
                    } for crop in recent_views[:5]
                ]
            },
            "deals": {
                "active_deals": [
                    {
                        "id": str(deal.id),
                        "crop_name": deal.crop_name,
                        "original_price": deal.price_per_kg,
                        "discount_percent": deal.discount_percent,
                        "final_price": round(deal.price_per_kg * (1 - deal.discount_percent/100), 2),
                        "savings": round(deal.price_per_kg * deal.discount_percent/100, 2)
                    } for deal in best_deals
                ]
            },
            "seasonal": {
                "current_season_crops": [
                    {
                        "id": str(crop.id),
                        "crop_name": crop.crop_name,
                        "price_per_kg": crop.price_per_kg,
                        "location": crop.location
                    } for crop in seasonal_crops
                ]
            },
            "price_insights": {
                category: {
                    "average": round(avg, 2),
                    "lowest": round(min_price, 2),
                    "highest": round(max_price, 2)
                } for category, avg, min_price, max_price in price_insights
            },
            "ai_recommendations": ai_insights,
            "ai_status": {
                "service": "Ollama",
                "model": ai_service.default_model,
                "available": ai_service.check_ollama_status()
            }
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard: {str(error)}")


@router.get("/market/trends")
async def get_market_trends(db: Session = Depends(get_db)):
    """
    Get overall market trends
    """
    try:
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Trending categories
        trending = db.query(
            CropListing.category,
            func.count(CropListing.id).label('listing_count'),
            func.avg(CropListing.price_per_kg).label('avg_price')
        ).filter(CropListing.created_at >= thirty_days_ago)\
         .group_by(CropListing.category)\
         .order_by(desc('listing_count'))\
         .all()
        
        # Popular crops
        popular_crops = db.query(CropListing)\
            .filter(CropListing.created_at >= thirty_days_ago)\
            .order_by(desc(CropListing.views_count))\
            .limit(10)\
            .all()
        
        return {
            "trending_categories": [
                {
                    "category": cat,
                    "listings": count,
                    "avg_price": round(avg, 2)
                } for cat, count, avg in trending
            ],
            "popular_crops": [
                {
                    "crop_name": crop.crop_name,
                    "category": crop.category,
                    "views": crop.views_count,
                    "price_per_kg": crop.price_per_kg
                } for crop in popular_crops
            ]
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market trends: {str(error)}")