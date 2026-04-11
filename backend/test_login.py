import requests
import json

BASE_URL = "http://localhost:8000" # Assume local backend

def test_login_flow(phone):
    print(f"Testing login for {phone}...")
    
    # 1. Generate OTP
    res = requests.post(f"{BASE_URL}/auth/generate-otp", json={"phone": phone})
    print(f"Generate OTP response: {res.status_code} - {res.text}")
    if res.status_code != 200:
        return
    
    data = res.json()
    otp = data.get("simulated_otp", "123456")
    
    # 2. Verify OTP
    res = requests.post(f"{BASE_URL}/auth/verify-otp", json={"phone": phone, "otp": otp})
    print(f"Verify OTP response: {res.status_code} - {res.text}")
    if res.status_code != 200:
        return
    
    token = res.json().get("access_token")
    print(f"Success! Token: {token[:20]}...")
    
    # 3. Get /me
    res = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"Get /me response: {res.status_code} - {res.text}")

if __name__ == "__main__":
    # Test with a phone number in the DB from check_db.py output
    test_login_flow("9876543210") # Ramesh
    print("-" * 20)
    test_login_flow("8179061056") # S.PRAVEEN
