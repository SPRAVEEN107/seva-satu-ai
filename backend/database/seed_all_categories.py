import asyncio
from services.db_service import get_pool
from dotenv import load_dotenv

load_dotenv()

async def seed_all_categories():
    pool = await get_pool()
    queries = [
        # Minority
        ("Nai Roshni Scheme", "Ministry of Minority Affairs", "Minority", "Leadership development program for minority women to build confidence and knowledge.", "Training and stipend", '{"gender":"female", "community":"minority"}', "https://minorityaffairs.gov.in", "ALL"),
        ("Seekho Aur Kamao", "Ministry of Minority Affairs", "Minority", "Skill development initiative for minorities to upgrade skills and ensure placements.", "Skill training and placements", '{"age_min": 14, "age_max": 35, "community":"minority"}', "https://minorityaffairs.gov.in", "ALL"),
        ("Pre-Matric Scholarship for Minorities", "Ministry of Minority Affairs", "Minority", "Scholarship for minority students from class 1 to 10 to encourage education.", "Admission fee + maintenance allowance", '{"community":"minority", "income_max": 100000}', "https://scholarships.gov.in", "ALL"),
        
        # SC/ST
        ("Venture Capital Fund for SCs", "Ministry of Social Justice", "SC/ST", "Promotes entrepreneurship among Scheduled Castes by providing concessional finance.", "Financial assistance up to 15 Crore", '{"caste_category":["SC"], "is_entrepreneur":true}', "https://vcfsc.in", "ALL"),
        ("National Fellowship for ST Students", "Ministry of Tribal Affairs", "SC/ST", "Financial assistance to ST students for pursuing higher education (M.Phil and Ph.D).", "Fellowship up to ₹35,000/month", '{"caste_category":["ST"], "enrolled_professional_course":true}', "https://tribal.nic.in", "ALL"),
        
        # BPL
        ("Antyodaya Anna Yojana (AAY)", "Ministry of Consumer Affairs", "BPL", "Provides highly subsidized food grains to the poorest of poor families.", "35kg food grains per family/month", '{"bpl_card":true, "income_max": 27000}', "https://dfpd.gov.in", "ALL"),
        ("Pradhan Mantri Jeevan Jyoti Bima Yojana", "Ministry of Finance", "BPL", "Life insurance scheme accessible to BPL families providing financial security to the bereaved family.", "Life cover of ₹2 Lakh", '{"age_min":18, "age_max":50, "bank_account":true}', "https://jansuraksha.gov.in", "ALL"),
        
        # Agriculture
        ("Kisan Credit Card (KCC)", "Ministry of Agriculture", "Agriculture", "Adequate and timely credit support to farmers for their cultivation and other needs.", "Credit up to ₹3 Lakh at 4% interest", '{"occupation":["farmer"], "land_ownership":true}', "https://pmkisan.gov.in", "ALL"),
        ("PM Krishi Sinchayee Yojana", "Ministry of Agriculture", "Agriculture", "Improves on-farm water use efficiency and expands cultivable area under assured irrigation.", "Subsidies for micro-irrigation equipment", '{"occupation":["farmer"], "land_ownership":true}', "https://pmksy.gov.in", "ALL"),
        
        # Health
        ("National Health Mission (NHM)", "Ministry of Health", "Health", "Provides universal access to equitable, affordable, and quality health care.", "Free maternal and child healthcare", '{"needs_support":true}', "https://nhm.gov.in", "ALL"),
        
        # Education
        ("National Means-cum-Merit Scholarship", "Ministry of Education", "Education", "Awarded to meritorious students of economically weaker sections to arrest their dropout at class VIII.", "₹12,000 per annum", '{"income_max": 350000, "min_percentage": 55}', "https://scholarships.gov.in", "ALL"),
        
        # Business
        ("Startup India Scheme", "Ministry of Commerce", "Business", "Supports entrepreneurs in building robust startup ecosystems and drives economic growth.", "Tax exemptions and fast-track patents", '{"is_entrepreneur":true}', "https://www.startupindia.gov.in", "ALL"),
        
        # Employment
        ("Prime Ministers Employment Generation Programme", "Ministry of MSME", "Employment", "Credit-linked subsidy program to generate self-employment in rural/urban areas.", "Subsidy up to 35% on project cost", '{"age_min": 18, "employment_status":"unemployed"}', "https://kviconline.gov.in", "ALL"),
        
        # Housing
        ("Rajiv Awas Yojana", "Ministry of Housing", "Housing", "Aims to create a slum-free India by providing housing to slum dwellers.", "Housing construction subsidy", '{"housing_status": "slum_dweller"}', "https://mohua.gov.in", "ALL"),
        
        # Women
        ("Mahila Samman Savings Certificate", "Ministry of Finance", "Women", "Small savings scheme backed by the government designed explicitly for women.", "7.5% fixed interest rate", '{"gender":"female"}', "https://www.indiapost.gov.in", "ALL")
    ]
    
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
                else:
                    print(f"Already exists: {q[0]}")
            except Exception as e:
                print(f"Failed to insert {q[0]}: {e}")
                
if __name__ == "__main__":
    asyncio.run(seed_all_categories())
