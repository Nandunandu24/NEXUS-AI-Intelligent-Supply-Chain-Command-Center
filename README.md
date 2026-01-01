# 🛡️NEXUS-AI-Intelligent-Supply-Chain-Command-Center


[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![MLOps](https://img.shields.io/badge/MLOps-MLflow%20%7C%20Docker-red)](https://mlflow.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**NEXUS-AI** is a Level-3 Enterprise AI System engineered for global supply chain resilience and operational intelligence.
It integrates real-time data streaming (Apache Kafka), large-scale analytics (Apache Spark), predictive machine learning, and Agentic Generative AI (RAG-based reasoning) to anticipate disruptions, predict delays, quantify financial risk, and recommend corrective actions across global shipping networks.

Designed as a command-center–grade platform, NEXUS-AI transforms fragmented logistics signals into actionable foresight, enabling organizations to move from reactive monitoring to autonomous, AI-driven decision-making.

---
---
# **📌 Problem Statement**

Global supply chains operate across hundreds of ports, vessels, and vendors, yet most logistics systems remain reactive, fragmented, and blind to real-time risks.

Organizations today face:

-Unexpected port congestion and vessel delays

-Poor visibility into financial loss impact

-Disconnected IoT, weather, and operational data

-Lack of decision intelligence, relying on manual dashboards

-No AI-driven simulations for what-if risk scenarios

Traditional dashboards only show what happened — they do not predict, explain, or recommend actions.

---
# **🎯 Solution Overview**

NEXUS-AI is an AI-powered Supply Chain Command Center designed to provide real-time visibility, predictive intelligence, and autonomous decision support for global shipping and port operations.

-It transforms raw streaming data into actionable insights using:

-Real-time data ingestion (Kafka + Spark)

-Predictive ML models (ETA, congestion, loss)

-Agentic GenAI for reasoning and recommendations

-Enterprise-grade command-center UI

---

# **⚙️ What NEXUS-AI Does**
**🔹 1. Real-Time Supply Chain Visibility**

Ingests live vessel telemetry, port congestion, and weather data

Visualizes global shipping routes and ports on an interactive world map

Highlights risk zones (Green / Yellow / Red)

**🔹 2. Delay & Congestion Prediction**

Uses ML models to forecast:

Port delays

Vessel ETA deviations

Congestion severity

Identifies bottlenecks before they escalate

**🔹 3. Financial Loss Estimation**

Quantifies business impact using predictive formulas:

Expected Loss = Delay × Cargo Value × Risk Factor


Enables leadership to prioritize high-impact shipments

**🔹 4. AI-Driven Decision Support**

Embedded AI Agent answers natural-language questions

Runs simulations like:

“What if Port X closes for 48 hours?”

“Which shipments are at highest risk?”

Provides actionable mitigation strategies

**🔹 5. Executive Command Center Dashboard**

Enterprise-style UI with:

KPI cards

Risk heatmaps

Real-time alerts

AI chat panel

Designed for operations, leadership, and planners

---

# **🧠 How the System Solves the Problem (Step-by-Step)**
**Step 1: Data Ingestion**

Kafka streams ingest IoT, weather, and port events

Spark Streaming processes data in near real time

**Step 2: Intelligent Processing**

PySpark performs windowed aggregations & anomaly detection

ML feature pipelines enrich raw signals

**Step 3: Predictive Modeling**

ML models predict delays, congestion, and losses

SHAP explains why predictions occurred

**Step 4: Agentic Reasoning**

AI agent combines predictions + knowledge base

Executes simulations and provides recommendations

**Step 5: Actionable Visualization**

React dashboard presents insights in real time

Users drill down from global → port → shipment level

# *Tools And Technology Used*
| **Layer**                      | **Technology**                         | **Purpose / Usage**                       |
| ------------------------------ | -------------------------------------- | ----------------------------------------- |
| **Frontend (UI/UX)**           | React.js                               | Enterprise-grade command center UI        |
|                                | Vite                                   | Fast frontend build & dev server          |
|                                | Plotly.js                              | Interactive maps, charts, heatmaps        |
|                                | Tailwind CSS                           | Modern dark dashboard styling             |
|                                | Zustand / Context API                  | Frontend state management                 |
|                                | WebSockets / REST                      | Real-time data updates                    |
| **Backend API**                | FastAPI                                | High-performance ML & data APIs           |
|                                | Uvicorn                                | ASGI server                               |
|                                | Pydantic                               | Data validation & schemas                 |
| **Streaming Platform**         | Apache Kafka                           | Real-time event ingestion                 |
|                                | Kafka Producers                        | Ship / port / weather event publishing    |
|                                | Kafka Consumers                        | Streaming alert processing                |
| **Stream Processing**          | Apache Spark Structured Streaming      | Real-time ML inference                    |
|                                | PySpark                                | Large-scale batch & streaming analytics   |
| **Batch Processing**           | Apache Spark                           | Historical analytics & feature generation |
| **Machine Learning**           | Scikit-learn                           | Classical ML models                       |
|                                | PySpark MLlib                          | Distributed ML pipelines                  |
|                                | Random Forest                          | Delay & risk prediction                   |
|                                | Feature Engineering                    | Congestion, weather & risk features       |
|                                | SHAP                                   | Model explainability                      |
| **AI / Agentic Layer**         | LLM Agent (Gemini / OpenAI compatible) | Decision support & reasoning              |
|                                | Prompt Engineering                     | Context-aware recommendations             |
|                                | Tool Calling (Planned)                 | Simulations & scenario analysis           |
| **Data Storage**               | Parquet                                | Optimized analytics storage               |
|                                | Local FS / Cloud Blob                  | Model & data persistence                  |
| **Monitoring & Observability** | Prometheus                             | Metrics collection                        |
|                                | Spark UI                               | Job monitoring                            |
|                                | Kafka Logs                             | Stream debugging                          |
| **DevOps / MLOps**             | Git                                    | Version control                           |
|                                | GitHub                                 | Source hosting                            |
|                                | Vercel                                 | Frontend deployment                       |
|                                | Azure (Planned)                        | Cloud infrastructure                      |
|                                | Docker (Planned)                       | Containerization                          |
| **Security**                   | Role-Based Access Control              | Admin / Analyst / Viewer                  |
|                                | Environment Variables                  | Secrets management                        |
| **Operating System**           | Linux / WSL2                           | Development & execution                   |
| **Programming Languages**      | Python                                 | Data, ML, backend                         |
|                                | JavaScript / TypeScript                | Frontend                                  |
|                                | Bash                                   | System orchestration                      |


---
# **🚀 Business Impact**

---
Challenge	NEXUS-AI Solution
Reactive decision-making	Predictive & proactive risk detection
Siloed dashboards	Unified command center
Unknown delay costs	Real-time loss estimation
Manual analysis	AI-driven recommendations
No scenario planning	Autonomous simulations

----
## 📥 Getting Started
----
### Prerequisites
* Docker & Docker Compose
* Python 3.10+
* OpenAI API Key (for Agentic RAG)

### Installation
```bash
# Clone the repository
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
