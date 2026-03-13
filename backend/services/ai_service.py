"""
AI Service — Antigravity SDK integration for chat, eligibility, and grievance classification.
"""
import os
import json
import re
from typing import Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

ANTIGRAVITY_API_KEY = os.getenv("ANTIGRAVITY_API_KEY", "")
ANTIGRAVITY_API_BASE = "https://api.antigravity.ai/v1"

SYSTEM_PROMPT = """You are Savasetu AI — a helpful Indian government services assistant.
Your mission: Help citizens discover government schemes, check eligibility, apply for benefits, and resolve grievances.
Always respond in the citizen's preferred language (Hindi, Telugu, Kannada, Marathi, Tamil, or English).
When listing schemes, respond in structured JSON format inside a <schemes> XML tag.
When classifying grievances, respond in structured JSON inside a <classification> XML tag.
Be warm, simple, encouraging, and use respectful Indian greetings (Namaste, Vanakkam, etc.).
Keep responses concise and practical. Prioritize actionable guidance."""


async def _call_antigravity(messages: list[dict], max_tokens: int = 1000) -> str:
    """
    Low-level call to Antigravity API (OpenAI-compatible endpoint).
    Falls back gracefully if API key is missing.
    """
    if not ANTIGRAVITY_API_KEY or ANTIGRAVITY_API_KEY == "your_antigravity_key_here":
        return _mock_response(messages[-1]["content"] if messages else "")

    headers = {
        "Authorization": f"Bearer {ANTIGRAVITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "antigravity-latest",
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ANTIGRAVITY_API_BASE}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Antigravity API error: {e}")
        return _mock_response(messages[-1]["content"] if messages else "")


def _mock_response(message: str) -> str:
    """Fallback mock response when API key is not set."""
    msg_lower = message.lower()
    if "scheme" in msg_lower or "yojana" in msg_lower:
        return """Namaste! 🙏 I found some government schemes that may help you.

<schemes>[
  {"name": "PM Kisan Samman Nidhi", "ministry": "Ministry of Agriculture", "benefit": "₹6,000/year", "match_score": 92, "apply_url": "https://pmkisan.gov.in", "eligibility_reason": "You may qualify as a small farmer"},
  {"name": "Ayushman Bharat PM-JAY", "ministry": "Ministry of Health", "benefit": "₹5 lakh health cover", "match_score": 85, "apply_url": "https://pmjay.gov.in", "eligibility_reason": "Health insurance for your family"},
  {"name": "PM Ujjwala Yojana", "ministry": "Ministry of Petroleum", "benefit": "Free LPG connection", "match_score": 78, "apply_url": "https://pmuy.gov.in", "eligibility_reason": "Free cooking gas connection"}
]</schemes>

Please share more about your situation (state, income, occupation) for personalized recommendations!"""
    elif "eligib" in msg_lower:
        return "Namaste! To check your eligibility, please tell me your age, state, occupation, and annual income. I'll find the best schemes for you!"
    elif "grievance" in msg_lower or "complaint" in msg_lower:
        return "I understand your concern. Please describe your issue in detail and I'll help you file a grievance and track it. What department is this related to?"
    else:
        return "Namaste! 🙏 I'm Savasetu AI, here to help you access government schemes and services. You can ask me about:\n\n• 🌾 **Farm schemes** (PM Kisan, Fasal Bima)\n• 🏥 **Health coverage** (Ayushman Bharat)\n• 🏠 **Housing** (PMAY)\n• 💼 **Business loans** (MUDRA)\n• 📋 **File grievances**\n\nHow can I help you today?"


def _extract_tag(text: str, tag: str) -> Optional[str]:
    pattern = rf"<{tag}>(.*?)</{tag}>"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else None


async def get_ai_response(
    message: str,
    language: str = "en",
    citizen_profile: Optional[dict] = None,
    history: Optional[list] = None,
) -> dict:
    """
    Main chat AI function. Returns reply, suggested_schemes, action_buttons.
    """
    profile_context = ""
    if citizen_profile:
        profile_context = f"""
Citizen Profile:
- Name: {citizen_profile.get('name', 'Citizen')}
- State: {citizen_profile.get('state', 'Unknown')}
- Age: {citizen_profile.get('age', 'Unknown')}
- Occupation: {citizen_profile.get('occupation', 'Unknown')}
- Annual Income: ₹{citizen_profile.get('annual_income', 'Unknown')}
- Caste Category: {citizen_profile.get('caste_category', 'General')}
- Family Size: {citizen_profile.get('family_size', 'Unknown')}
"""

    lang_map = {
        "hi": "Hindi", "te": "Telugu", "kn": "Kannada",
        "mr": "Marathi", "ta": "Tamil", "en": "English"
    }
    lang_name = lang_map.get(language, "English")

    system = f"{SYSTEM_PROMPT}\n\nRespond in {lang_name}.\n{profile_context}"
    messages = [{"role": "system", "content": system}]

    # Add conversation history
    if history:
        for h in history[-6:]:  # Last 6 turns
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

    messages.append({"role": "user", "content": message})

    raw_reply = await _call_antigravity(messages, max_tokens=1000)

    # Extract schemes if present
    suggested_schemes = []
    schemes_json = _extract_tag(raw_reply, "schemes")
    if schemes_json:
        try:
            suggested_schemes = json.loads(schemes_json)
        except json.JSONDecodeError:
            pass

    # Clean reply — remove XML tags for display
    clean_reply = re.sub(r"<schemes>.*?</schemes>", "", raw_reply, flags=re.DOTALL).strip()

    # Suggest action buttons based on content
    action_buttons = []
    msg_lower = message.lower()
    if "scheme" in msg_lower or len(suggested_schemes) > 0:
        action_buttons = ["Apply Now", "Check Eligibility", "Learn More"]
    elif "grievance" in msg_lower or "complaint" in msg_lower:
        action_buttons = ["File Grievance", "Track Complaint"]
    else:
        action_buttons = ["Find Schemes", "Check Eligibility", "File Grievance"]

    return {
        "reply": clean_reply or raw_reply,
        "suggested_schemes": suggested_schemes,
        "action_buttons": action_buttons,
        "language": language,
    }


async def check_eligibility_ai(profile: dict) -> list[dict]:
    """
    Deep AI eligibility check: Returns top 5 eligible schemes as JSON.
    """
    prompt = f"""Based on this citizen's profile, return a JSON array of the top 5 most relevant 
Indian government schemes they qualify for. 

Profile:
- Age: {profile.get('age')}
- Gender: {profile.get('gender')}
- State: {profile.get('state')}
- Occupation: {profile.get('occupation')}
- Annual Income: ₹{profile.get('annual_income')}
- Caste Category: {profile.get('caste_category', 'General')}
- Land Ownership: {profile.get('land_ownership', False)}
- Family Size: {profile.get('family_size')}

Return ONLY a JSON array (no markdown) with this structure:
[{{"name": "Scheme Name", "ministry": "Ministry Name", "benefit": "Benefit Description", 
   "match_score": 85, "apply_url": "https://...", "eligibility_reason": "Why they qualify", "category": "Category"}}]"""

    messages = [
        {"role": "system", "content": "You are a government scheme eligibility expert. Return only valid JSON arrays."},
        {"role": "user", "content": prompt},
    ]

    raw = await _call_antigravity(messages, max_tokens=1500)

    # Try to parse JSON
    try:
        # Find JSON array in response
        json_match = re.search(r"\[.*\]", raw, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Fallback static response
    return [
        {
            "name": "Ayushman Bharat PM-JAY",
            "ministry": "Ministry of Health",
            "benefit": "₹5,00,000 health cover/year",
            "match_score": 88,
            "apply_url": "https://pmjay.gov.in",
            "eligibility_reason": "Based on your income and family size, you qualify for free health insurance.",
            "category": "Health",
        },
        {
            "name": "PM Kisan Samman Nidhi",
            "ministry": "Ministry of Agriculture",
            "benefit": "₹6,000/year",
            "match_score": 82,
            "apply_url": "https://pmkisan.gov.in",
            "eligibility_reason": "If you own agricultural land, you qualify for direct income support.",
            "category": "Agriculture",
        },
    ]


async def classify_grievance(description: str, category: str) -> dict:
    """
    AI classification of grievance to correct government department.
    """
    prompt = f"""Classify this government grievance to the correct Indian government department.

Category: {category}
Description: {description}

Return ONLY a JSON object (no markdown):
{{"department": "Department Name", "sub_department": "Sub-department", "priority": "normal|high|urgent", "estimated_days": 15}}"""

    messages = [
        {"role": "system", "content": "You are an expert in Indian government administration. Return only valid JSON."},
        {"role": "user", "content": prompt},
    ]

    raw = await _call_antigravity(messages, max_tokens=300)

    try:
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return {
                "department": result.get("department", "General Administration"),
                "sub_department": result.get("sub_department"),
                "priority": result.get("priority", "normal"),
                "estimated_days": result.get("estimated_days", 30),
            }
    except json.JSONDecodeError:
        pass

    # Category-based fallback
    dept_map = {
        "Ration Card": ("Department of Food and Civil Supplies", "normal", 21),
        "Pension": ("Social Welfare Department", "normal", 30),
        "MNREGA": ("Department of Rural Development", "normal", 15),
        "Housing": ("Department of Housing and Urban Affairs", "normal", 45),
        "Healthcare": ("Department of Health and Family Welfare", "high", 10),
        "Other": ("General Administration", "normal", 30),
    }
    dept_info = dept_map.get(category, dept_map["Other"])
    return {
        "department": dept_info[0],
        "sub_department": None,
        "priority": dept_info[1],
        "estimated_days": dept_info[2],
    }
