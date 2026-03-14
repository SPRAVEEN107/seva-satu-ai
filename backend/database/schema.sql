-- SAVASETU AI — NeonDB PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Citizens table
CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE,
  state VARCHAR(50),
  district VARCHAR(50),
  age INTEGER,
  gender VARCHAR(10),
  occupation VARCHAR(50),
  annual_income DECIMAL,
  caste_category VARCHAR(20),
  land_ownership BOOLEAN DEFAULT FALSE,
  family_size INTEGER,
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  ministry VARCHAR(100),
  category VARCHAR(50),
  description TEXT,
  benefit_amount VARCHAR(100),
  eligibility_criteria JSONB,
  apply_url TEXT,
  state_specific VARCHAR(50) DEFAULT 'ALL',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'submitted',
  reference_number VARCHAR(50) UNIQUE,
  applied_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  category VARCHAR(50),
  description TEXT,
  department VARCHAR(100),
  tracking_id VARCHAR(20) UNIQUE,
  status VARCHAR(30) DEFAULT 'received',
  priority VARCHAR(10) DEFAULT 'normal',
  estimated_days INTEGER DEFAULT 30,
  district VARCHAR(50),
  state VARCHAR(50),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  message TEXT,
  response TEXT,
  language VARCHAR(20) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Grievance timeline table
CREATE TABLE IF NOT EXISTS grievance_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
  event_text TEXT,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SEED DATA: 10 Real Indian Government Schemes
-- ─────────────────────────────────────────────

INSERT INTO schemes (name, ministry, category, description, benefit_amount, eligibility_criteria, apply_url, state_specific) VALUES

('PM Kisan Samman Nidhi', 'Ministry of Agriculture', 'Agriculture',
 'Direct income support of ₹6000/year to small and marginal farmers across India.',
 '₹6,000/year (₹2,000 per installment)',
 '{"occupation": ["farmer"], "income_max": 600000, "land_required": true, "land_max_acres": 2}',
 'https://pmkisan.gov.in', 'ALL'),

('Pradhan Mantri Awas Yojana (PMAY)', 'Ministry of Housing', 'Housing',
 'Financial assistance for construction/purchase of pucca house for economically weaker sections.',
 'Up to ₹2.67 lakh subsidy',
 '{"income_max": 1800000, "housing_status": "no_house", "first_time_buyer": true}',
 'https://pmaymis.gov.in', 'ALL'),

('Ayushman Bharat PM-JAY', 'Ministry of Health', 'Health',
 'Health insurance coverage of ₹5 lakh per family per year for secondary/tertiary care.',
 '₹5,00,000 health cover/year',
 '{"income_max": 500000, "family_size_min": 1, "ration_card": true}',
 'https://pmjay.gov.in', 'ALL'),

('PM MUDRA Yojana', 'Ministry of Finance', 'Business',
 'Micro-finance loans for non-corporate, non-farm small/micro enterprises.',
 'Loans up to ₹10 lakh (Shishu/Kishore/Tarun)',
 '{"occupation": ["business", "self_employed", "trader", "artisan"], "no_collateral": true}',
 'https://mudra.org.in', 'ALL'),

('Sukanya Samriddhi Yojana', 'Ministry of Finance', 'Women',
 'Savings scheme for girl child with attractive interest rate and tax benefits.',
 '8.2% interest rate + tax exemption',
 '{"gender": "female", "age_max": 10, "guardian_required": true}',
 'https://www.india.gov.in/sukanya-samriddhi-yojana', 'ALL'),

('National Social Assistance Programme (Senior Pension)', 'Ministry of Rural Development', 'Senior Citizen',
 'Monthly pension for old age, widows, and disabled persons below poverty line.',
 '₹200-₹500/month pension',
 '{"age_min": 60, "income_max": 100000, "bpl_card": true}',
 'https://nsap.nic.in', 'ALL'),

('PM Ujjwala Yojana', 'Ministry of Petroleum', 'Women',
 'Free LPG connection to women from below poverty line households.',
 'Free LPG connection + cylinder',
 '{"gender": "female", "income_max": 200000, "bpl_card": true, "no_lpg_connection": true}',
 'https://pmuy.gov.in', 'ALL'),

('MGNREGA (Mahatma Gandhi NREGA)', 'Ministry of Rural Development', 'Employment',
 '100 days guaranteed wage employment per year to rural households.',
 '100 days employment + ₹267/day wages',
 '{"area": "rural", "age_min": 18, "willing_to_work": true}',
 'https://nrega.nic.in', 'ALL'),

('Pradhan Mantri Fasal Bima Yojana', 'Ministry of Agriculture', 'Agriculture',
 'Crop insurance scheme providing financial support to farmers suffering crop loss.',
 'Up to full sum insured for crop loss',
 '{"occupation": ["farmer"], "has_crop": true, "kisan_credit_card": false}',
 'https://pmfby.gov.in', 'ALL'),

('PM Scholarship Scheme (PMSS)', 'Ministry of Education', 'Education',
 'Scholarships for wards of ex-servicemen and coast guard personnel for professional education.',
 '₹2,500-₹3,000/month scholarship',
 '{"guardian_ex_serviceman": true, "enrolled_professional_course": true, "min_percentage": 60}',
 'https://ksb.gov.in/pm-scholarship.htm', 'ALL'),

('Pradhan Mantri Matru Vandana Yojana (PMMVY)', 'Ministry of Women and Child Development', 'Women',
 'Financial incentive for pregnant and lactating mothers for the first living child of the family.',
 '₹5,000 in three installments',
 '{"gender": "female", "is_pregnant": true, "is_lactating": true, "first_child": true}',
 'https://pmmvy-cas.nic.in', 'ALL'),

('PM Vishwakarma Yojana', 'Ministry of MSME', 'Rural',
 'Support for traditional artisans and craftspeople in rural and urban areas with training and credit.',
 '₹15,000 toolkit incentive + ₹3 lakh collateral-free loan',
 '{"occupation": ["artisan", "craftsperson", "carpenter", "blacksmith", "potter"], "age_min": 18}',
 'https://pmvishwakarma.gov.in', 'ALL'),

('Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)', 'Ministry of Rural Development', 'Unemployed',
 'Placement-linked skill development program for rural poor youth.',
 'Free skill training + guaranteed placement',
 '{"area": "rural", "age_min": 15, "age_max": 35, "employment_status": "unemployed"}',
 'http://ddugky.gov.in', 'ALL'),

('Lakhpati Didi Scheme', 'Ministry of Rural Development', 'Women',
 'Empowering women in Self-Help Groups (SHGs) to earn a sustainable income of at least ₹1 lakh per year.',
 'Interest-free loans + technical training',
 '{"gender": "female", "is_shg_member": true, "area": "rural"}',
 'https://nrlm.gov.in', 'ALL'),

('Stand Up India Scheme', 'Ministry of Finance', 'Business',
 'Bank loans to at least one SC/ST and one woman borrower per bank branch for setting up a greenfield enterprise.',
 'Loans between ₹10 lakh and ₹1 crore',
 '{"gender": "female", "caste_category": ["SC", "ST"], "is_entrepreneur": true}',
 'https://www.standupmitra.in', 'ALL'),

('PM Kaushal Vikas Yojana (PMKVY)', 'Ministry of Skill Development', 'Unemployed',
 'Flagship skill certification scheme to enable Indian youth to take up industry-relevant skill training.',
 'Free skill training + certification + monetary reward',
 '{"age_min": 15, "age_max": 45, "employment_status": "unemployed"}',
 'https://www.pmkvyofficial.org', 'ALL'),

('PM-KUSUM Scheme', 'Ministry of New & Renewable Energy', 'Rural',
 'Financial support to farmers to install solar water pumps and grid-connected solar power plants.',
 '60% subsidy on solar pumps',
 '{"occupation": ["farmer"], "land_ownership": true, "irrigation_need": true}',
 'https://pmkusum.mnre.gov.in', 'ALL'),

('PM SVANidhi', 'Ministry of Housing and Urban Affairs', 'Unemployed',
 'Special micro-credit facility for street vendors to facilitate collateral-free working capital loans.',
 'Initial working capital loan of ₹10,000',
 '{"occupation": ["street_vendor", "trader"], "is_marginalized": true}',
 'https://pmsvanidhi.mohua.gov.in', 'ALL'),

('Mahila Coir Yojana', 'Ministry of MSME', 'Women',
 'Training and distribution of spinning raths/motorized ratt to rural women artisans in the coir sector.',
 '75% subsidy on motorized ratt/spinning wheels',
 '{"gender": "female", "area": "rural", "industry": "coir"}',
 'https://coirboard.gov.in', 'ALL'),

('Mission Shakti (Samarthya)', 'Ministry of Women and Child Development', 'Women',
 'Unified scheme for safety, security, and empowerment of women including skill development and credit.',
 'Integrated support services + credit linkage',
 '{"gender": "female", "needs_support": true}',
 'https://wcd.nic.in', 'ALL');

-- Add sample citizen
INSERT INTO citizens (aadhaar_number, name, phone, state, district, age, gender, occupation, annual_income, caste_category, land_ownership, family_size)
VALUES ('123456789012', 'Ramesh Kumar', '9876543210', 'Uttar Pradesh', 'Lucknow', 45, 'male', 'farmer', 120000, 'OBC', true, 4);
