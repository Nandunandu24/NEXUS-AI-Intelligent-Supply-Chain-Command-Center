import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.gemini_client import explain_weather_alert

import streamlit as st
import pandas as pd


st.set_page_config(
    page_title="OMNI AI – Weather Risk Platform",
    layout="wide"
)

st.title("🌦️ OMNI AI – Real-Time Weather Risk Intelligence")

# -------------------------
# Mock alert loader (replace with DB / Kafka later)
# -------------------------
def load_alerts():
    return pd.DataFrame([
        {
            "city": "Delhi",
            "temperature": 45,
            "humidity": 70,
            "wind": 12,
            "severity": "CRITICAL",
            "confidence": 0.94
        },
        {
            "city": "Mumbai",
            "temperature": 36,
            "humidity": 85,
            "wind": 18,
            "severity": "HIGH",
            "confidence": 0.88
        }
    ])

alerts_df = load_alerts()

# -------------------------
# METRICS
# -------------------------
col1, col2, col3 = st.columns(3)

col1.metric("🚨 Total Alerts", len(alerts_df))
col2.metric("🔥 Critical", len(alerts_df[alerts_df.severity == "CRITICAL"]))
col3.metric("📊 Avg Confidence", round(alerts_df.confidence.mean(), 2))

st.divider()

# -------------------------
# ALERT TABLE
# -------------------------
st.subheader("📍 Live Weather Alerts")

def severity_icon(sev):
    return {
        "LOW": "🟢",
        "MEDIUM": "🟡",
        "HIGH": "🔴",
        "CRITICAL": "🚨"
    }.get(sev, "❓")

alerts_df["severity"] = alerts_df["severity"].apply(
    lambda x: f"{severity_icon(x)} {x}"
)

st.dataframe(alerts_df, use_container_width=True)

st.divider()

# -------------------------
# AI EXPLANATION PANEL
# -------------------------
st.subheader("🤖 AI Explanation (Powered by Gemini)")

selected_city = st.selectbox(
    "Select alert to explain",
    alerts_df["city"]
)

selected_alert = alerts_df[alerts_df.city == selected_city].iloc[0]

if st.button("Explain Risk"):
    explanation = explain_weather_alert({
        "city": selected_alert.city,
        "temperature": selected_alert.temperature,
        "humidity": selected_alert.humidity,
        "wind": selected_alert.wind,
        "severity": selected_alert.severity.split()[-1],
        "confidence": selected_alert.confidence
    })

    st.success(explanation)
