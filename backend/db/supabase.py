# db/supabase.py
# I love supabase
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase: Client | None = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError("Missing SUPABASE_URL and/or SUPABASE_*_KEY in environment.")
        _supabase = create_client(url, key)
    return _supabase
