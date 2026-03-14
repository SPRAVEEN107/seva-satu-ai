-- Migration: Add 10 realistic schemes for Rural, Women, and Unemployed
-- SAVASETU AI

INSERT INTO schemes (name, ministry, category, description, benefit_amount, eligibility_criteria, apply_url, state_specific) VALUES

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

('Nari Shakti Puraskar / Mission Shakti', 'Ministry of Women and Child Development', 'Women',
 'Unified scheme for safety, security, and empowerment of women including skill development and credit.',
 'Integrated support services + credit linkage',
 '{"gender": "female", "needs_support": true}',
 'https://wcd.nic.in', 'ALL');
