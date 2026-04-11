import requests # type: ignore
import sys

# Ensure UTF-8 output for emojis in Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    print(f"--- Testing Backend at {base_url} ---")
    
    print("\n1. Testing Health Check...")
    r = requests.get(f"{base_url}/health")
    print(f"Health Response: {r.status_code}")
    if r.status_code == 200:
        print(f"Status: {r.json()}")

    print("\n2. Testing Admin Login (/auth/login)...")
    login_data = {
        "email": "19792@apsrkpuram.edu.in",
        "password": "123456789"
    }
    r = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"Login Response: {r.status_code}")
    if r.status_code == 200:
        print("Login Success! Token received.")

    print("\n3. Testing Eligibility Check...")
    eligibility_data = {
        "age": 25,
        "gender": "female",
        "state": "Uttar Pradesh",
        "occupation": "farmer",
        "annual_income": 150000,
        "caste_category": "General",
        "land_ownership": True
    }
    r = requests.post(f"{base_url}/eligibility/check", json=eligibility_data)
    print(f"Eligibility Response: {r.status_code}")
    if r.status_code == 200:
        print(f"Found {r.json()['total_matched']} eligible schemes.")
        
    print("\n4. Testing AI Chat...")
    chat_data = {
        "message": "What schemes are available for farmers in UP?",
        "language": "en"
    }
    r = requests.post(f"{base_url}/ai-chat/message", json=chat_data)
    print(f"Chat Response: {r.status_code}")
    if r.status_code == 200:
        print(f"Reply Preview: {r.json()['reply'][:50]}...")

if __name__ == "__main__":
    test_api()
