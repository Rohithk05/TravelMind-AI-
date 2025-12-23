from duckduckgo_search import DDGS

# Initialize a single DDGS instance to reuse if needed
ddgs = DDGS()

def fetch_image_for_location(query: str) -> str:
    """
    Searches for an image URL using DuckDuckGo Images.
    Returns a URL string or None if not found.
    """
    try:
        # Search for images with SafeSearch on
        results = list(ddgs.images(query, max_results=1))
        if results and len(results) > 0:
            return results[0].get('image')
    except Exception as e:
        print(f"Image search error for {query}: {e}")
        return None
    
    return None
