"""
AI Service — Antigravity SDK integration for chat, eligibility, and grievance classification.
"""
import os
import json
import re
from typing import Optional
import httpx # type: ignore
from dotenv import load_dotenv # type: ignore
from services import db_service # type: ignore

load_dotenv()

ANTIGRAVITY_API_KEY = os.getenv("ANTIGRAVITY_API_KEY", "")
ANTIGRAVITY_API_BASE = "https://api.antigravity.ai/v1"

SYSTEM_PROMPT = """You are Savasetu AI — a professional and empathetic assistant for Indian Government services.
Your mission: Help citizens discover relevant government schemes, check eligibility, apply for benefits, and resolve grievances.

CONTEXT GUIDELINES:
1. When a user asks about schemes, I will provide you with a list of "Candidate Schemes" from the database. 
2. Use these candidates to formulate your answer. If no candidates are provided, suggest general categories (Health, Agriculture, Housing, etc.) and ask for details.
3. Always respond in the citizen's preferred language (Hindi, Telugu, Kannada, Marathi, Tamil, or English).
4. For schemes, respond with a helpful explanation AND include structured JSON inside a <schemes> XML tag.
5. Example schemes tag: <schemes>[{"name": "...", "benefit": "...", "apply_url": "..."}]</schemes>
6. Be warm and use respectful Indian greetings (Namaste, Vanakkam, etc.).
7. Keep responses concise and practical. Prioritize actionable guidance (e.g., specific documents needed)."""


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
    
    return "" # Final fallback to satisfy linter


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


async def _search_schemes_local(message: str) -> list[dict]:
    """Basic keyword-based scheme search in the database."""
    keywords = re.findall(r'\w+', message.lower())
    stop_words = {'scheme', 'yojana', 'available', 'government', 'help', 'find', 'me', 'want', 'apply'}
    search_terms = [k for k in keywords if len(k) > 3 and k not in stop_words]
    
    if not search_terms:
        return []

    candidate_schemes = []
    try:
        all_schemes = await db_service.get_all_schemes()
        for s in all_schemes:
            text = f"{s['name']} {s['category']} {s['description']}".lower()
            if any(term in text for term in search_terms):
                candidate_schemes.append({
                    "name": s["name"],
                    "benefit": s["benefit_amount"],
                    "category": s["category"],
                    "apply_url": s["apply_url"],
                    "description": s.get("description", "")
                })
    except Exception as e:
        print(f"Error in local search: {e}")
    
    return candidate_schemes


async def get_ai_response(
    message: str,
    language: str = "en",
    citizen_profile: Optional[dict] = None,
    history: Optional[list] = None,
) -> dict:
    """
    Main chat AI function. Returns reply, suggested_schemes, action_buttons.
    """
    # 1. Search Database for relevant schemes
    candidates = await _search_schemes_local(message)
    
    # 2. Build Context
    profile_context = ""
    if citizen_profile:
        profile_context = f"\nCitizen Profile: {json.dumps(citizen_profile, indent=2, default=str)}\n"

    schemes_context = ""
    if candidates:
        top_candidates = []
        for i, c in enumerate(candidates):
            if i >= 5: break
            top_candidates.append(c)
        schemes_context = f"\nRelevant schemes found in database:\n{json.dumps(top_candidates, indent=2)}\n"

    lang_map = {
        "hi": "Hindi", "te": "Telugu", "kn": "Kannada",
        "mr": "Marathi", "ta": "Tamil", "en": "English"
    }
    lang_name = lang_map.get(language, "English")

    system = f"{SYSTEM_PROMPT}\n\nRespond in {lang_name}.\n{profile_context}{schemes_context}"
    messages = [{"role": "system", "content": system}]

    if history:
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})

    messages.append({"role": "user", "content": message})

    raw_reply = await _call_antigravity(messages, max_tokens=1000)

    # 3. Post-process
    suggested_schemes = []
    schemes_json = _extract_tag(raw_reply, "schemes")
    if schemes_json:
        try:
            suggested_schemes = json.loads(schemes_json)
        except json.JSONDecodeError:
            pass
    
    # Fallback to local candidates if LLM didn't return structured JSON
    if not suggested_schemes and candidates and ("scheme" in message.lower() or "benefit" in message.lower()):
        fallback_schemes = []
        for i, c in enumerate(candidates):
            if i >= 3: break
            fallback_schemes.append(c)
        suggested_schemes = fallback_schemes

    clean_reply = re.sub(r"<schemes>.*?</schemes>", "", raw_reply, flags=re.DOTALL).strip()

    # Suggest action buttons
    action_buttons = ["Find Schemes", "Check Eligibility", "File Grievance"]
    if suggested_schemes:
        action_buttons = ["Apply Now", "Learn More", "Grievance Help"]

    return {
        "reply": clean_reply or raw_reply,
        "suggested_schemes": suggested_schemes,
        "action_buttons": action_buttons,
        "language": language,
    }


async def check_eligibility_ai(profile: dict) -> list[dict]:
    """
    Deep AI eligibility check: Returns top 5 eligible schemes using DB data and LLM reasoning.
    """
    # 1. Get all schemes from DB
    try:
        schemes = await db_service.get_all_schemes()
    except Exception:
        schemes = []

    # 2. Build prompt with schemes
    schemes_data = []
    top_schemes_list = []
    for i, s in enumerate(schemes):
        if i >= 15: break
        top_schemes_list.append(s)
        
    for s in top_schemes_list:
        schemes_data.append({
            "name": s["name"],
            "category": s["category"],
            "description": s["description"],
            "criteria": s.get("eligibility_criteria", {})
        })

    prompt = f"""Match this citizen's profile to the best 5 government schemes from the provided list.
    
Profile:
{json.dumps(profile, indent=2)}

Schemes List:
{json.dumps(schemes_data, indent=2)}

Analyze the criteria (income, age, occupation, state, gender) and find the best matches.
Return ONLY a JSON array of the top 5 matches:
[{{"name": "...", "ministry": "...", "benefit": "...", "match_score": 95, "apply_url": "...", "eligibility_reason": "..."}}]"""

    messages = [
        {"role": "system", "content": "You are a government scheme eligibility expert. Return only valid JSON arrays."},
        {"role": "user", "content": prompt},
    ]

    raw = await _call_antigravity(messages, max_tokens=1500)

    try:
        json_match = re.search(r"\[.*\]", raw, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Fallback to local filtering if AI fails or no key
    matches = []
    occ = profile.get("occupation", "").lower()
    for s in schemes:
        if occ in s["description"].lower() or occ in s["category"].lower():
            matches.append({
                "name": s["name"],
                "benefit": s["benefit_amount"],
                "match_score": 85,
                "apply_url": s["apply_url"],
                "eligibility_reason": f"Matches your occupation as a {occ}."
            })
            if len(matches) >= 5: break
            
    return matches or [
        {
            "name": "Ayushman Bharat PM-JAY",
            "benefit": "₹5,00,000 health cover/year",
            "match_score": 70,
            "apply_url": "https://pmjay.gov.in",
            "eligibility_reason": "General health coverage for low-income families."
        }
    ]


async def classify_grievance(description: str, category: str) -> dict:
    """
    AI classification of grievance to correct government department.
    """
    prompt = f"""Classify this government grievance to the correct Indian government department.
    
Category: {category}
Description: {description}

Return ONLY a JSON object:
{{"department": "...", "sub_department": "...", "priority": "normal|high|urgent", "estimated_days": 15}}"""

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
    except Exception:
        pass

    return {"department": "General Administration", "sub_department": None, "priority": "normal", "estimated_days": 30}
