import os
from google import genai
from google.genai.errors import ClientError

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("GOOGLE_API_KEY not set")

client = genai.Client(api_key=API_KEY)

# Models to try in order (most to least likely)
MODEL_CANDIDATES = [
    "models/gemini-2.0-flash-exp",
    "models/gemini-1.5-pro-latest",
]

def explain_weather_alert(alert: dict) -> str:
    prompt = f"""
You are a senior weather risk analyst.

Alert details:
{alert}

Explain clearly:
1. What is happening
2. Why it is dangerous
3. Immediate safety actions

Keep it short, clear, and practical.
"""

    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            return response.text.strip()
        except ClientError:
            continue

    # ✅ HARD FALLBACK (PROJECT NEVER BREAKS)
    return (
        "⚠️ Weather alert detected.\n"
        "Conditions indicate a potentially dangerous event.\n"
        "Please follow local safety advisories and remain alert."
    )
