from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.mandi import (
    LivePriceResponse,
    PriceTrendResponse,
)
from ..services.mandi_price import MandiPriceService 
from typing import List, Optional
from datetime import date, timedelta

router = APIRouter()
mandi_service = MandiPriceService()

@router.get("/mandi/live", response_model=List[LivePriceResponse])
async def get_live_prices(
    commodity: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """
    Get live mandi prices from government API
    
    Query Parameters:
    - commodity: Filter by commodity name (e.g., Tomato, Wheat)
    - state: Filter by state name
    - district: Filter by district name
    - limit: Maximum results to return
    """
    try:
        # Fetch from API based on filters
        if commodity:
            prices = mandi_service.search_by_commodity(commodity, state=state)
        elif state or district:
            prices = mandi_service.search_by_location(state=state, district=district)
        else:
            prices = mandi_service.get_all_prices(limit=limit)
        
        if not prices:
            # Return empty list with helpful message
            return []
        
        # Convert to response format
        response = []
        for price in prices[:limit]:
            try:
                response.append(LivePriceResponse(
                    commodity=price.get("commodity", ""),
                    state=price.get("state", ""),
                    district=price.get("district", ""),
                    market=price.get("market", ""),
                    modal_price=float(price.get("modal_price", 0)),
                    min_price=float(price.get("min_price", 0)),
                    max_price=float(price.get("max_price", 0)),
                    date=price.get("arrival_date", ""),
                    trend=None
                ))
            except Exception as e:
                print(f"Error formatting price record: {e}")
                continue
        
        return response
        
    except Exception as error:
        print(f"Error in get_live_prices: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch prices: {str(error)}")


@router.get("/mandi/commodities")
async def get_commodities():
    """Get list of popular commodities"""
    commodities = mandi_service.get_popular_commodities()
    return {
        "commodities": commodities,
        "count": len(commodities)
    }


@router.get("/mandi/trend/{commodity}", response_model=PriceTrendResponse)
async def get_price_trend(
    commodity: str,
    state: Optional[str] = None,
    days: int = Query(30, ge=7, le=90)
):
    """
    Get price trend for a commodity over specified days
    
    Parameters:
    - commodity: Name of the commodity
    - state: Optional state filter
    - days: Number of days to analyze (7-90 days)
    """
    try:
        trend_data = mandi_service.get_price_trend(commodity, state=state, days=days)
        
        if not trend_data["dates"]:
            raise HTTPException(
                status_code=404,
                detail=f"No price data found for {commodity}"
            )
        
        return PriceTrendResponse(**trend_data)
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in get_price_trend: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch trend: {str(error)}")


@router.get("/mandi/compare")
async def compare_prices(
    commodity: str,
    states: List[str] = Query(..., description="List of states to compare")
):
    """
    Compare prices of same commodity across different states
    
    Example: /mandi/compare?commodity=Tomato&states=Maharashtra&states=Punjab
    """
    try:
        comparison = []
        
        for state in states:
            prices = mandi_service.search_by_commodity(commodity, state=state)
            
            if prices:
                # Get the first (latest) price record for this state
                price_data = prices[0]
                comparison.append({
                    "state": state,
                    "district": price_data.get("district", ""),
                    "market": price_data.get("market", ""),
                    "modal_price": float(price_data.get("modal_price", 0)),
                    "min_price": float(price_data.get("min_price", 0)),
                    "max_price": float(price_data.get("max_price", 0)),
                    "date": price_data.get("arrival_date", ""),
                })
        
        if not comparison:
            raise HTTPException(
                status_code=404, 
                detail=f"No price data found for {commodity} in specified states"
            )
        
        # Calculate statistics
        avg_price = sum(p["modal_price"] for p in comparison) / len(comparison)
        cheapest = min(comparison, key=lambda x: x["modal_price"])
        expensive = max(comparison, key=lambda x: x["modal_price"])
        
        return {
            "commodity": commodity,
            "comparison": comparison,
            "average_price": round(avg_price, 2),
            "cheapest_market": {
                "state": cheapest["state"],
                "market": cheapest["market"],
                "price": cheapest["modal_price"]
            },
            "expensive_market": {
                "state": expensive["state"],
                "market": expensive["market"],
                "price": expensive["modal_price"]
            },
            "price_difference": round(expensive["modal_price"] - cheapest["modal_price"], 2)
        }
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in compare_prices: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to compare prices: {str(error)}")


@router.get("/mandi/search")
async def search_prices(
    query: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, le=100)
):
    """
    Search prices by commodity, state, or district
    """
    try:
        # Try searching as commodity first
        results = mandi_service.search_by_commodity(query, limit=limit)
        
        # If no results, try as state
        if not results:
            results = mandi_service.search_by_location(state=query)
        
        # Convert to response
        response = []
        for price in results[:limit]:
            response.append({
                "commodity": price.get("commodity", ""),
                "state": price.get("state", ""),
                "district": price.get("district", ""),
                "market": price.get("market", ""),
                "modal_price": float(price.get("modal_price", 0)),
                "min_price": float(price.get("min_price", 0)),
                "max_price": float(price.get("max_price", 0)),
                "date": price.get("arrival_date", ""),
            })
        
        return {
            "query": query,
            "results": response,
            "count": len(response)
        }
        
    except Exception as error:
        print(f"Error in search_prices: {error}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(error)}")
