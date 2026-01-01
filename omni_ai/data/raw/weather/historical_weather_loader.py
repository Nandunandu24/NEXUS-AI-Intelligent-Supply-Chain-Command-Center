"""
Historical Weather Loader
=========================

Purpose:
- Download historical hourly weather data from Open-Meteo
- Store data in analytics-ready Parquet format
- Used for ML model training (ETA prediction)

Why this design:
- Batch ingestion (not streaming)
- Deterministic, reproducible
- Compatible with Spark downstream

Author: Omni-Sustain AI
Python: 3.10+
"""

import os
import sys
import time
import requests
import pandas as pd
from typing import Dict, List

# ---------------------------
# CONFIGURATION
# ---------------------------

BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

# Start with ONE port (Singapore) — scalable later
PORTS = {
    "singapore": {
        "latitude": 1.264,
        "longitude": 103.840
    }
}

START_DATE = "2022-01-01"
END_DATE = "2024-12-31"

HOURLY_VARS = [
    "temperature_2m",
    "wind_speed_10m",
    "wind_gusts_10m",
    "precipitation",
    "visibility",
    "weather_code"
]

TIMEZONE = "UTC"

OUTPUT_DIR = "data/raw/weather"


# ---------------------------
# UTILITY FUNCTIONS
# ---------------------------

def ensure_output_dir() -> None:
    """Create output directory if missing."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def build_request_url(lat: float, lon: float) -> str:
    """Construct Open-Meteo API URL."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "hourly": ",".join(HOURLY_VARS),
        "timezone": TIMEZONE
    }

    query = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{BASE_URL}?{query}"


def fetch_weather_data(url: str) -> Dict:
    """Call Open-Meteo API and return JSON."""
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.json()


def transform_to_dataframe(raw_json: Dict) -> pd.DataFrame:
    """Convert API JSON to Pandas DataFrame."""
    hourly = raw_json.get("hourly")

    if hourly is None:
        raise ValueError("No 'hourly' data found in API response")

    df = pd.DataFrame(hourly)

    # Convert time column
    df["timestamp"] = pd.to_datetime(df["time"], utc=True)
    df.drop(columns=["time"], inplace=True)

    # Ensure correct dtypes
    for col in df.columns:
        if col != "timestamp":
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def save_parquet(df: pd.DataFrame, port_name: str) -> None:
    """Save DataFrame to Parquet."""
    output_path = os.path.join(
        OUTPUT_DIR,
        f"{port_name}_historical_weather.parquet"
    )

    df.to_parquet(output_path, index=False)
    print(f"✅ Saved: {output_path}")


# ---------------------------
# MAIN PIPELINE
# ---------------------------

def main() -> None:
    print("🚀 Starting Historical Weather Loader")

    ensure_output_dir()

    for port_name, coords in PORTS.items():
        print(f"\n📍 Processing port: {port_name}")

        url = build_request_url(
            coords["latitude"],
            coords["longitude"]
        )

        print("🔗 API URL built")
        print(url)

        print("🌐 Fetching data from Open-Meteo...")
        raw_data = fetch_weather_data(url)

        print("🔄 Transforming to DataFrame...")
        df = transform_to_dataframe(raw_data)

        print("📊 Data validation:")
        print(df.head())
        print(df.describe())

        save_parquet(df, port_name)

        # Gentle rate-limit (good practice)
        time.sleep(2)

    print("\n🎯 Historical weather ingestion completed successfully")


# ---------------------------
# ENTRY POINT
# ---------------------------

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("❌ Pipeline failed")
        print(str(e))
        sys.exit(1)
