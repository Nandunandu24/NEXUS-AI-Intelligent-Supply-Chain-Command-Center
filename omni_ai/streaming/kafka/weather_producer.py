import json
import time
import random
from kafka import KafkaProducer

KAFKA_BROKER = "localhost:9092"
TOPIC = "weather_events"

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

cities = ["Delhi", "London", "New York", "Tokyo", "Singapore"]

def generate_weather():
    return {
        "city": random.choice(cities),
        "temperature_celsius": round(random.uniform(10, 45), 2),
        "humidity": random.randint(30, 90),
        "wind_kph": round(random.uniform(1, 30), 2),
        "timestamp": int(time.time())
    }

print("🚀 Weather producer started...")

while True:
    data = generate_weather()
    producer.send(TOPIC, value=data)
    producer.flush()
    print("Sent →", data)
    time.sleep(2)
