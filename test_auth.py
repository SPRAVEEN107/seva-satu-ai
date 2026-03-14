import requests

def test_auth():
    # Testing production endpoint as per user request
    base_url = "https://seva-satu-ai.onrender.com/auth"
    
    # Test Registration
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "phone": "9999999999"
    }
    
    print("Testing Registration...")
    reg_res = requests.post(f"{base_url}/register", json=signup_data)
    print(f"Status: {reg_res.status_code}")
    print(f"Response: {reg_res.json()}")
    
    if reg_res.status_code in [200, 400]: # 400 if already exists
        # Test Login
        print("\nTesting Login...")
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        log_res = requests.post(f"{base_url}/login", json=login_data)
        print(f"Status: {log_res.status_code}")
        token = log_res.json().get("access_token")
        
        if token:
            print("\nTesting /me endpoint...")
            me_res = requests.get(f"{base_url}/me", headers={"Authorization": f"Bearer {token}"})
            print(f"Status: {me_res.status_code}")
            print(f"User: {me_res.json()}")

if __name__ == "__main__":
    test_auth()
