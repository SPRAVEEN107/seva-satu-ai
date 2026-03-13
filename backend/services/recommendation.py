"""
Recommendation Engine — Rule-based pre-filter for scheme matching.
Runs before AI scoring to reduce the candidate set efficiently.
"""
from typing import Optional


SCHEME_RULES: dict[str, dict] = {
    "PM Kisan Samman Nidhi": {
        "occupation": ["farmer"],
        "income_max": 600000,
        "land_required": True,
    },
    "Pradhan Mantri Awas Yojana (PMAY)": {
        "income_max": 1800000,
        "housing_status": "no_house",
    },
    "Ayushman Bharat PM-JAY": {
        "income_max": 500000,
    },
    "PM MUDRA Yojana": {
        "occupation": ["business", "self_employed", "trader", "artisan", "shopkeeper"],
    },
    "Sukanya Samriddhi Yojana": {
        "gender": "female",
        "age_max": 10,
    },
    "National Social Assistance Programme (Senior Pension)": {
        "age_min": 60,
        "income_max": 100000,
    },
    "PM Ujjwala Yojana": {
        "gender": "female",
        "income_max": 200000,
    },
    "MGNREGA (Mahatma Gandhi NREGA)": {
        "age_min": 18,
        "area": "rural",
    },
    "Pradhan Mantri Fasal Bima Yojana": {
        "occupation": ["farmer"],
    },
    "PM Scholarship Scheme (PMSS)": {
        "guardian_ex_serviceman": True,
    },
    "Kisan Credit Card": {
        "occupation": ["farmer", "fisherman", "animal_husbandry"],
        "income_max": 1000000,
    },
    "PM Garib Kalyan Anna Yojana": {
        "income_max": 200000,
    },
    "Atal Pension Yojana": {
        "age_max": 40,
        "age_min": 18,
        "occupation": ["unorganized_worker", "daily_wage", "domestic_worker"],
    },
    "PM Kaushal Vikas Yojana": {
        "age_min": 15,
        "age_max": 45,
    },
    "Deen Dayal Upadhyaya Grameen Kaushalya Yojana": {
        "age_min": 15,
        "age_max": 35,
        "area": "rural",
    },
    "National Rural Livelihoods Mission": {
        "gender": "female",
        "area": "rural",
        "income_max": 500000,
    },
    "PM Matru Vandana Yojana": {
        "gender": "female",
        "age_min": 19,
    },
    "Beti Bachao Beti Padhao": {
        "gender": "female",
        "age_max": 18,
    },
    "PM Jan Dhan Yojana": {
        "no_bank_account": True,
    },
    "Stand-Up India": {
        "occupation": ["business", "entrepreneur"],
        "age_min": 18,
        "caste": ["SC", "ST"],
    },
    "e-Shram Portal": {
        "occupation": ["unorganized_worker", "daily_wage", "construction_worker", "farmer"],
        "age_min": 16,
        "age_max": 59,
    },
    "Antyodaya Anna Yojana": {
        "income_max": 100000,
    },
    "Jal Jeevan Mission": {
        "area": "rural",
    },
    "PMEGP (PM Employment Generation Programme)": {
        "age_min": 18,
        "occupation": ["unemployed", "artisan", "self_employed"],
    },
    "Krishi Sinchai Yojana": {
        "occupation": ["farmer"],
    },
}


def compute_match_score(profile: dict, rule: dict) -> int:
    """
    Returns a match score 0-100 for a given profile vs scheme rule.
    """
    score = 100
    penalty = 0

    income = profile.get("annual_income") or 0
    age = profile.get("age") or 0
    occupation = (profile.get("occupation") or "").lower()
    gender = (profile.get("gender") or "").lower()
    land = profile.get("land_ownership", False)
    caste = profile.get("caste_category") or ""

    if "income_max" in rule and income > rule["income_max"]:
        penalty += 60  # Hard fail
    if "age_min" in rule and age < rule["age_min"]:
        penalty += 60
    if "age_max" in rule and age > rule["age_max"]:
        penalty += 60
    if "occupation" in rule:
        if occupation not in rule["occupation"]:
            penalty += 40
    if "gender" in rule and gender != rule["gender"]:
        penalty += 60
    if "land_required" in rule and rule["land_required"] and not land:
        penalty += 30
    if "caste" in rule:
        if caste not in rule["caste"]:
            penalty += 30

    score = max(0, score - penalty)
    return score


def pre_filter_schemes(profile: dict) -> list[dict]:
    """
    Rule-based pre-filter: Returns candidate schemes with match scores.
    Only returns schemes with score >= 40.
    """
    candidates = []
    for scheme_name, rule in SCHEME_RULES.items():
        score = compute_match_score(profile, rule)
        if score >= 40:
            candidates.append(
                {
                    "name": scheme_name,
                    "match_score": score,
                    "rule": rule,
                }
            )

    # Sort by match score descending
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return candidates[:10]  # Return top 10 candidates for AI scoring
