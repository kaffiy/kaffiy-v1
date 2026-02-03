"""
Kaffiy Scraper Bot - Config & paths.
Google Custom Search + temizleme ile lead arama.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
# Dashboard data (growth hub)
DASHBOARD_DATA = BASE_DIR.parent / "kaffiy-growth-dashboard" / "kaffiy-growth-hub-main" / "src" / "data"
SCRAPED_LEADS_PATH = DASHBOARD_DATA / "scraped_leads.json"
SCRAPER_STATUS_PATH = DASHBOARD_DATA / "scraper_status.json"
LEADS_DATA_PATH = DASHBOARD_DATA / "leads_data.json"
REJECTED_LEADS_PATH = DASHBOARD_DATA / "rejected_leads.json"

# Env
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID", "")  # Programmable Search Engine ID
MAX_RESULTS_PER_QUERY = 10  # API max 10 per request
DEFAULT_MAX_RESULTS = 20

# Apify benzeri: çoklu arama terimleri + only_includes kategori filtresi
SEARCH_STRINGS_DEFAULT = ["kafe", "kahve", "coffee", "cafe", "espresso", "roastery"]
CATEGORY_FILTER_WORDS = ["cafe", "coffee shop", "kafe", "kahve", "coffee", "espresso", "roastery", "kahveci", "çay"]
MAX_CRAWLED_PLACES_DEFAULT = 100  # Apify maxCrawledPlacesPerSearch
