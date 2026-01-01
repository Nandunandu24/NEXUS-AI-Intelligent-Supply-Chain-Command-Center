from fastapi import FastAPI
from kafka import KafkaConsumer
import json

app = FastAPI()

consumer = KafkaConsumer(
    "weather_alerts",
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="latest",
    enable_auto_commit=True
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/alerts")
def get_alerts(limit: int = 20):
    alerts = []
    for msg in consumer:
        alerts.append(msg.value)
        if len(alerts) >= limit:
            break
    return {"count": len(alerts), "alerts": alerts}
