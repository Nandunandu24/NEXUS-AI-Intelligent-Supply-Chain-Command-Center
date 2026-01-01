import json
import os
import pandas as pd
from kafka import KafkaConsumer
from datetime import datetime

KAFKA_TOPIC = "weather_events"
BOOTSTRAP_SERVERS = "localhost:9092"

OUTPUT_DIR = "data/streaming/weather"
OUTPUT_FILE = f"{OUTPUT_DIR}/weather_events.parquet"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---- Schema rules ----
REQUIRED_FIELDS = {
    "city": str,
    "temperature_celsius": (int, float),
    "humidity": int,
    "wind_kph": (int, float),
}

def is_valid(record: dict) -> bool:
    try:
        for field, dtype in REQUIRED_FIELDS.items():
            if field not in record:
                return False
            if not isinstance(record[field], dtype):
                return False

        if not (-50 <= record["temperature_celsius"] <= 60):
            return False
        if not (0 <= record["humidity"] <= 100):
            return False

        return True
    except Exception:
        return False


def main():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="weather-stream-consumer"
    )

    buffer = []
    print("🌦️ Weather consumer with validation started...")

    for message in consumer:
        record = message.value

        if not is_valid(record):
            print("❌ Dropped invalid record:", record)
            continue

        record["ingested_at"] = datetime.utcnow().isoformat()
        buffer.append(record)
        print("✅ Accepted:", record)

        if len(buffer) >= 10:
            df = pd.DataFrame(buffer)

            if os.path.exists(OUTPUT_FILE):
                existing = pd.read_parquet(OUTPUT_FILE)
                df = pd.concat([existing, df], ignore_index=True)

            df.to_parquet(OUTPUT_FILE, index=False)
            buffer.clear()
            print("📦 Written validated batch to Parquet")

if __name__ == "__main__":
    main()
