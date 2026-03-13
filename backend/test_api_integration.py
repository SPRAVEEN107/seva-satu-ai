import requests

def test_api():
    base_url = "http://localhost:8001"
    
    print("Testing Eligibility Check...")
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
        print(f"Data: {r.json()['eligible_schemes'][:2]}...") # Show first 2 results
        
    print("\nTesting AI Chat...")
    chat_data = {
        "message": "What schemes are available for farmers in UP?",
        "language": "en"
    }
    r = requests.post(f"{base_url}/ai-chat/message", json=chat_data)
    print(f"Chat Response: {r.status_code}")
    if r.status_code == 200:
        print(f"Reply: {r.json()['reply'][:100]}...")

if __name__ == "__main__":
    test_api()
