import os
import json
import time
import dotenv

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

# Search for .env in current and parent directory
dotenv_path = dotenv.find_dotenv()
if not dotenv_path:
    dotenv_path = dotenv.find_dotenv('../.env')
if dotenv_path:
    dotenv.load_dotenv(dotenv_path)
else:
    dotenv.load_dotenv()

import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Resilient fallback model chain for maximum availability
MODEL_CANDIDATES = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
]

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY, transport="rest")
else:
    print("WARNING: GEMINI_API_KEY is not set.")

def _call_gemini_with_fallback(prompt, response_mime_type=None, temperature=0.2):
    """
    Executes a Gemini call with automated model fallback in case of rate limits (429) or transient errors.
    """
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is not configured.")

    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            model = genai.GenerativeModel(model_name)
            config_args = {"temperature": temperature}
            if response_mime_type:
                config_args["response_mime_type"] = response_mime_type

            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(**config_args)
            )
            if response and response.text:
                return response.text.strip(), model_name
        except Exception as e:
            last_error = e
            # If rate limited (429) or overloaded, seamlessly failover to the next candidate model
            continue

    raise last_error or RuntimeError("All candidate models failed.")

def analyze_sighting(sighting_text, case_details):
    """
    Extract structured information from a sighting report and analyze relevance.
    Strictly follows safety guidelines:
    - Never confirms identity.
    - AI relevance scores are only assistance for human review.
    - Does not fabricate missing information.
    """
    if not GEMINI_API_KEY:
        return {
            "error": "AI analysis unavailable — requires manual review.",
            "relevance_level": "INSUFFICIENT INFORMATION",
            "relevance_reasoning": "Gemini API key missing. Flagged for manual human review."
        }
    
    prompt = f"""
You are an AI assistant for a rescue coordination platform (RescueLink).
Your task is to analyze a sighting report for a missing person case.

IMPORTANT SAFETY REQUIREMENTS:
- This application must NOT claim to identify or confirm a missing person.
- AI must NOT make decisions about a person's identity.
- AI should only extract, summarize, organize, and prioritize reports for HUMAN REVIEW.
- Never use phrases like "Person confirmed" or "Identity matched".
- Use wording such as: "Potentially relevant based on the submitted description."
- If information is not present in the report, return null or "unknown". NEVER fabricate missing information.

Missing Person Case Details:
{json.dumps(case_details, indent=2)}

Sighting Report (may be written in any language, e.g., English, Hindi, Tamil):
"{sighting_text}"

Tasks:
1. Extract structured details:
   - location: specific location mentioned or "unknown"
   - time: time of sighting or "unknown"
   - date: date of sighting or "unknown"
   - clothing: described clothing or "unknown"
   - visible_characteristics: physical features described or "unknown"
   - objects: items/bags/accessories or "unknown"
   - direction: direction of movement if explicitly stated, or "unknown"
   - important_clues: notable observations or "unknown"
   - language: language the report was originally submitted in
   - summary: concise objective summary of what the witness observed
2. Analyze the relevance of the sighting to the case (classify as HIGH, MEDIUM, LOW, or INSUFFICIENT INFORMATION).
3. Provide a clear reasoning explaining why, framed strictly as assistance for human review.

Respond STRICTLY with a valid JSON object matching this schema:
{{
    "extracted_data": {{
        "location": "string or unknown",
        "time": "string or unknown",
        "date": "string or unknown",
        "clothing": "string or unknown",
        "visible_characteristics": "string or unknown",
        "objects": "string or unknown",
        "direction": "string or unknown",
        "important_clues": "string or unknown",
        "language": "string",
        "summary": "string"
    }},
    "relevance_level": "HIGH | MEDIUM | LOW | INSUFFICIENT INFORMATION",
    "relevance_reasoning": "string"
}}
"""
    
    try:
        text_response, model_used = _call_gemini_with_fallback(
            prompt, 
            response_mime_type="application/json", 
            temperature=0.2
        )
        parsed_data = json.loads(text_response)
        
        if not isinstance(parsed_data, dict):
            raise ValueError("AI response is not a valid JSON dictionary.")
            
        if "extracted_data" not in parsed_data or "relevance_level" not in parsed_data:
            raise ValueError("AI response is missing required keys.")
            
        return parsed_data
        
    except json.JSONDecodeError:
        return {
            "error": "AI analysis unavailable — requires manual review.",
            "relevance_level": "INSUFFICIENT INFORMATION",
            "relevance_reasoning": "Failed to parse structured AI output. Flagged for manual review."
        }
    except Exception as e:
        return {
            "error": "AI analysis unavailable — requires manual review.",
            "relevance_level": "INSUFFICIENT INFORMATION",
            "relevance_reasoning": "AI service temporarily unavailable. Report queued for manual review."
        }

def generate_rescue_briefing(case_details, sightings):
    """
    Generates a concise operational rescue briefing for search coordinators and volunteers.
    Adheres to safety constraints (no dangerous instructions, no predicted routes as fact).
    """
    if not GEMINI_API_KEY:
        return "AI analysis unavailable — requires manual review. Gemini API key missing."
    
    prompt = f"""
You are an AI rescue coordination assistant for RescueLink.
Your task is to analyze the case data and submitted sighting reports to produce a concise rescue briefing for human coordinators and search teams.

SAFETY CONSTRAINTS:
- Do NOT give dangerous or risky instructions.
- Do NOT claim a predicted route as fact. Use phrasing such as "Possible movement pattern based on submitted reports."
- Clearly distinguish between confirmed case facts and unverified witness reports.
- Emphasize that reports require human verification.
- End the briefing strictly with: "AI-generated briefing. Verify information with authorized responders."

Case Details:
{json.dumps(case_details, indent=2)}

Sightings Log:
{json.dumps(sightings, indent=2)}

Please structure the briefing with the following sections:
1. Case Summary & Last Confirmed Point
2. Chronological Sighting Progression
3. Common Observable Clues & Patterns
4. Priority Areas Requiring Human Review & Verification
5. Key Information Gaps & Search Coordination Recommendations

Output in concise, readable Markdown format.
"""
    
    try:
        briefing_text, model_used = _call_gemini_with_fallback(
            prompt,
            temperature=0.3
        )
        
        safety_notice = "AI-generated briefing. Verify information with authorized responders."
        if safety_notice not in briefing_text:
            briefing_text += f"\n\n---\n*{safety_notice}*"
            
        return briefing_text
    except Exception as e:
        return "AI rescue briefing unavailable at this moment due to service capacity. Please rely on manual sightings review.\n\n---\n*AI-generated briefing. Verify information with authorized responders.*"
