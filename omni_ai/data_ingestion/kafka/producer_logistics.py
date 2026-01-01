import json
import time
import random
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

TOPIC = "logistics_events"

def generate_event():
    return {
        "container_id": f"CNT-{random.randint(1000,9999)}",
        "lat": random.uniform(-90, 90),
        "lon": random.uniform(-180, 180),
        "delay_minutes": random.randint(0, 180),
        "temperature": random.uniform(2, 30),
        "timestamp": time.time()
    }

if __name__ == "__main__":
    while True:
        producer.send(TOPIC, generate_event())
        print("Logistics event sent")
        time.sleep(5)
