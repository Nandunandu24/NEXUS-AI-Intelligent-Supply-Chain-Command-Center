import json
import time
import pandas as pd
import streamlit as st
from kafka import KafkaConsumer

st.set_page_config(
    page_title="Weather Alert Dashboard",
    layout="wide"
)

st.title("🌩️ Real-Time Weather Alert Dashboard")

@st.cache_resource
def get_consumer():
    return KafkaConsumer(
        "weather_alerts",
        bootstrap_servers="localhost:9092",
        auto_offset_reset="latest",
        enable_auto_commit=True,
        value_deserializer=lambda x: json.loads(x.decode("utf-8"))
    )

consumer = get_consumer()

placeholder = st.empty()
alerts_data = []

while True:
    for message in consumer.poll(timeout_ms=1000).values():
        for record in message:
            alerts_data.append(record.value)

    if alerts_data:
        df = pd.DataFrame(alerts_data)

        with placeholder.container():
            col1, col2 = st.columns(2)

            with col1:
                st.subheader("🚨 Live Alerts")
                st.dataframe(df.tail(20), use_container_width=True)

            with col2:
                st.subheader("📊 Alerts by City")
                city_counts = df["city"].value_counts()
                st.bar_chart(city_counts)

    time.sleep(2)
