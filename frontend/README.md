# 🚢 NEXUS-AI: Intelligent Supply Chain Command Center

**NEXUS-AI** is a production-grade **AI-powered supply chain command center** that provides real-time visibility, delay prediction, loss estimation, and AI-driven decision support for global shipping and port operations.

The system integrates **Apache Spark (batch + streaming)**, **Kafka**, **Machine Learning**, and an **AI Agent** with an enterprise-style dashboard.

---

## 🔍 What This Project Does

- Visualizes global shipping ports with **risk zones (Green / Yellow / Red)**
- Predicts **port delays and financial loss** using ML models
- Processes real-time events using **Kafka + Spark Streaming**
- Provides an **AI assistant** for analysis, simulations, and recommendations
- Displays executive KPIs in a **command-center style UI**

---



---

## 🚀 How to Run (Linux / WSL)

### 1️⃣ Backend & ML Setup
```bash
cd omni_ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt


2️⃣ Start Kafka (Required)

Terminal 1

zookeeper-server-start.sh config/zookeeper.properties


Terminal 2

kafka-server-start.sh config/server.properties

3️⃣ Run Spark Analytics
spark-submit streaming/spark/weather_batch_analytics.py
spark-submit streaming/spark/weather_streaming_job.py

4️⃣ Start Frontend Dashboard
cd frontend
npm install
npm run dev


Dashboard will be available at:

http://localhost:5173

🤖 AI Agent Capabilities

Answers questions about port delays, congestion, and shipments

Runs what-if simulations (e.g., port closure impact)

Provides actionable recommendations

Designed for future tool-calling and RAG integration

🚨 Alerts & Monitoring

Kafka-based real-time alerts

Prometheus-ready metrics

Designed for enterprise-grade observability

🌐 Deployment

Frontend (Vercel):
👉 https://nexus-ai-intelligent-supply-chain-c.vercel.app/

Backend & streaming components are designed for deployment on:

Azure App Service

Azure Databricks

Managed Kafka services
