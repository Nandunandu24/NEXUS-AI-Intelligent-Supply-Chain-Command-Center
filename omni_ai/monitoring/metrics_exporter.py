from prometheus_client import start_http_server, Gauge
from kafka import KafkaConsumer
import json

ALERT_GAUGE = Gauge(
    "weather_alert_triggered",
    "AI weather alert triggered",
    ["city"]
)

consumer = KafkaConsumer(
    'weather_alerts',
    bootstrap_servers='localhost:9092',
    auto_offset_reset='latest',
    enable_auto_commit=True,
    group_id='metrics-exporter',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    api_version_auto_timeout_ms=30000
)

if __name__ == "__main__":
    start_http_server(8001)
    print("📊 Metrics exporter running on port 8001")

    for msg in consumer:
        data = msg.value
        city = data.get("city", "unknown")
        ALERT_GAUGE.labels(city=city).set(1)
        print("🚨 Alert metric updated:", city)
