import json
import time
import requests
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

TOPIC = "weather_events"

def fetch_weather():
    url = (
        "https://archive-api.open-meteo.com/v1/archive?latitude=1.264&longitude=103.84&start_date=2022-01-01&end_date=2024-12-31&hourly=temperature_2m,wind_speed_10m,precipitation,weather_code,wind_gusts_10m,relative_humidity_2m,cloud_cover&timezone=auto"
    )
    response = requests.get(url)
    return response.json()

if __name__ == "__main__":
    while True:
        data = fetch_weather()
        producer.send(TOPIC, data)
        print("Weather event sent")
        time.sleep(60)
