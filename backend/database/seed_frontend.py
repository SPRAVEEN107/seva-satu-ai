import asyncio
import json
from services.db_service import get_pool
from dotenv import load_dotenv

load_dotenv()

STATE_SCHEMES = {
  "Uttar Pradesh": [
    {"name": "Kanya Sumangala Yojana", "desc": "Financial support for girl child from birth to graduation", "category": "Women", "benefit": "₹15,000 total"},
    {"name": "UP Pension Yojana", "desc": "Old age, widow and divyang pension scheme", "category": "BPL", "benefit": "₹500/month"},
    {"name": "Mukhyamantri Awas Yojana UP", "desc": "Housing for BPL families in rural areas", "category": "Housing", "benefit": "₹1.2 Lakh"},
    {"name": "UP Scholarship", "desc": "Scholarship for SC/ST/OBC students", "category": "Education", "benefit": "₹8,000-25,000"},
    {"name": "Vishwakarma Shram Samman", "desc": "Skill development for artisans", "category": "Employment", "benefit": "₹10,000-10 Lakh"}
  ],
  "Maharashtra": [
    {"name": "Majhi Kanya Bhagyashri", "desc": "Scheme for girl child education and welfare", "category": "Women", "benefit": "₹50,000"},
    {"name": "Atal Mahila Shakti Yojana", "desc": "Financial assistance to women entrepreneurs", "category": "Women", "benefit": "₹3 Lakh loan"},
    {"name": "Ramai Awas Yojana", "desc": "Housing for SC/BPL families", "category": "BPL", "benefit": "₹1.5 Lakh"},
    {"name": "Shiv Bhojan Thali", "desc": "Affordable meals at ₹10 for BPL citizens", "category": "BPL", "benefit": "₹10 meal"}
  ],
  "Bihar": [
    {"name": "Mukhyamantri Kanya Utthan Yojana", "desc": "₹50,000 for every girl from birth to graduation", "category": "Women", "benefit": "₹50,000"},
    {"name": "Bihar Har Ghar Bijli", "desc": "Electricity connection to every household", "category": "BPL", "benefit": "Free connection"},
    {"name": "Student Credit Card", "desc": "Education loan for higher studies", "category": "Education", "benefit": "₹4 Lakh"}
  ],
  "Tamil Nadu": [
    {"name": "Kalaignar Magalir Urimai Thittam", "desc": "₹1,000/month cash transfer to women", "category": "Women", "benefit": "₹1,000/month"},
    {"name": "Amma Unavagam", "desc": "Subsidised meals for public", "category": "BPL", "benefit": "₹5-20 meals"},
    {"name": "Chief Minister's Girl Child Protection Scheme", "desc": "Welfare of girl children in BPL families", "category": "Women", "benefit": "₹50,000"}
  ],
  "Rajasthan": [
    {"name": "Indira Gandhi Matritva Poshan Yojana", "desc": "Nutrition support to pregnant women", "category": "Women", "benefit": "₹6,000"},
    {"name": "Rajasthan Jan Aadhaar", "desc": "Single identity card for all government benefits", "category": "BPL", "benefit": "All schemes"},
    {"name": "Mukhyamantri Rajshri Yojana", "desc": "Girl child welfare from birth to class 12", "category": "Women", "benefit": "₹50,000"}
  ],
  "Karnataka": [
    {"name": "Gruha Jyothi", "desc": "Free 200 units electricity to households", "category": "BPL", "benefit": "Free electricity"},
    {"name": "Anna Bhagya", "desc": "Free rice to BPL families", "category": "BPL", "benefit": "10kg rice free"},
    {"name": "Shakti Scheme", "desc": "Free bus travel for women", "category": "Women", "benefit": "Free travel"}
  ],
  "West Bengal": [
    {"name": "Lakshmir Bhandar", "desc": "Monthly cash assistance to homemakers", "category": "Women", "benefit": "₹500-1,000/month"},
    {"name": "Kanyashree Prakalpa", "desc": "Financial incentive for girl children education", "category": "Women", "benefit": "₹25,000"},
    {"name": "Krishak Bandhu", "desc": "Financial support to farmers", "category": "Agriculture", "benefit": "₹10,000/year"}
  ],
  "Andhra Pradesh": [
    {"name": "YSR Cheyutha", "desc": "Financial assistance to women from BC/SC/ST/Minority", "category": "Women", "benefit": "₹18,750/year"},
    {"name": "Jagananna Amma Vodi", "desc": "₹15,000 per year for mothers of school-going children", "category": "Women", "benefit": "₹15,000/year"},
    {"name": "YSR Pension Kanuka", "desc": "Enhanced pension for old age/widow/divyang", "category": "BPL", "benefit": "₹2,750/month"}
  ],
  "Gujarat": [
    {"name": "Mukhyamantri Mahila Utkarsh Yojana", "desc": "Interest-free loans for women's groups", "category": "Women", "benefit": "₹1 Lakh"},
    {"name": "PMEGP Gujarat", "desc": "Employment generation for rural/urban poor", "category": "Employment", "benefit": "₹25-50 Lakh"},
    {"name": "Vatsalya - Maa Amrutam Yojana", "desc": "Health insurance for BPL families", "category": "Health", "benefit": "₹5 Lakh health cover"}
  ]
}

PM_SCHEMES = [
  {"name": "PM Awas Yojana (PMAY)", "desc": "Housing for all by 2024 - Rural & Urban", "category": "Housing", "benefit": "₹1.2-2.5 Lakh", "level": "Central"},
  {"name": "PM Kisan Samman Nidhi", "desc": "₹6,000/year direct income support to farmers", "category": "Agriculture", "benefit": "₹6,000/year", "level": "Central"},
  {"name": "PM Jan Dhan Yojana", "desc": "Financial inclusion for unbanked citizens", "category": "BPL", "benefit": "Zero-balance account + ₹2L insurance", "level": "Central"},
  {"name": "Ayushman Bharat - PMJAY", "desc": "₹5 Lakh health insurance for BPL families", "category": "Health", "benefit": "₹5 Lakh/year", "level": "Central"},
  {"name": "PM Mudra Yojana", "desc": "Loans for micro & small enterprises up to ₹10L", "category": "Business", "benefit": "₹50K-10 Lakh loan", "level": "Central"},
  {"name": "PM Ujjwala Yojana", "desc": "Free LPG connections to BPL women", "category": "Women", "benefit": "Free LPG + subsidy", "level": "Central"},
  {"name": "PM Matru Vandana Yojana", "desc": "Maternity benefit program for pregnant women", "category": "Women", "benefit": "₹5,000", "level": "Central"},
  {"name": "Beti Bachao Beti Padhao", "desc": "Welfare of girl child - education & protection", "category": "Women", "benefit": "Multiple benefits", "level": "Central"},
  {"name": "PM Vishwakarma Scheme", "desc": "Support to traditional artisans and craftsmen", "category": "Employment", "benefit": "₹15,000 toolkit + loan", "level": "Central"},
  {"name": "Sukanya Samriddhi Yojana", "desc": "Savings scheme for girl child", "category": "Women", "benefit": "High interest 8.2%", "level": "Central"},
  {"name": "MGNREGS", "desc": "100 days guaranteed employment for rural workers", "category": "Employment", "benefit": "100 days/year wages", "level": "Central"},
  {"name": "PM Garib Kalyan Ann Yojana", "desc": "Free food grains to 80 crore beneficiaries", "category": "BPL", "benefit": "5 kg grain/month free", "level": "Central"}
]

BPL_SCHEMES = [
  {"name": "Antyodaya Anna Yojana (AAY)", "desc": "Cheapest ration for poorest of poor families", "category": "BPL", "benefit": "35 kg grain at ₹2-3/kg"},
  {"name": "National Social Assistance Programme", "desc": "Social security for BPL elderly, widows, disabled", "category": "BPL", "benefit": "₹200-500/month"},
  {"name": "Pradhan Mantri Jeevan Jyoti Bima", "desc": "Life insurance at just ₹436/year", "category": "BPL", "benefit": "₹2 Lakh life cover"},
  {"name": "PM Suraksha Bima Yojana", "desc": "Accidental insurance at ₹20/year", "category": "BPL", "benefit": "₹2 Lakh accident cover"}
]

async def seed_frontend():
    pool = await get_pool()
    queries = []
    
    for state, schemes in STATE_SCHEMES.items():
        for s in schemes:
            queries.append((s["name"], f"State Govt ({state})", s["category"], s["desc"], s["benefit"], "{}", "N/A", state))

    for s in PM_SCHEMES:
        queries.append((s["name"], "Central Government", s["category"], s["desc"], s["benefit"], "{}", "N/A", "ALL"))

    for s in BPL_SCHEMES:
        queries.append((s["name"], "Central Government", s["category"], s["desc"], s["benefit"], "{}", "N/A", "ALL"))
    
    async with pool.acquire() as conn:
        for q in queries:
            try:
                # Check if scheme exists
                exists = await conn.fetchval("SELECT id FROM schemes WHERE name = $1", q[0])
                if not exists:
                    await conn.execute(
                        """INSERT INTO schemes (name, ministry, category, description, benefit_amount, eligibility_criteria, apply_url, state_specific)
                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
                        *q
                    )
                    print(f"Inserted: {q[0]} [{q[2]}]")
            except Exception as e:
                pass
                
if __name__ == "__main__":
    asyncio.run(seed_frontend())
