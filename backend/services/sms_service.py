import os
import random
import httpx
from typing import Optional

# To use a real SMS service, set these in your .env file
# Examples: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
# Or local Indian providers like Msg91: MSG91_AUTH_KEY, etc.

async def send_sms(phone: str, message: str) -> bool:
    """
    Sends an SMS message to the specified phone number.
    This is currently a simulated service. To make it 'live', 
    integrate with a provider like Twilio, Vonage, or Msg91.
    """
    print(f"--- SMS OUTGOING ---")
    print(f"TO: {phone}")
    print(f"MESSAGE: {message}")
    print(f"---------------------")
    
    # SIMULATION: In a real app, you would do something like this:
    # 
    # if os.getenv("TWILIO_ACCOUNT_SID"):
    #     return await _send_via_twilio(phone, message)
    # elif os.getenv("MSG91_AUTH_KEY"):
    #     return await _send_via_msg91(phone, message)
    
    # For now, we simulate success
    return True

async def _send_via_twilio(phone: str, message: str) -> bool:
    # Placeholder for Twilio integration
    # url = f"https://api.twilio.com/2010-04-01/Accounts/{os.getenv('TWILIO_ACCOUNT_SID')}/Messages.json"
    # data = {
    #     "To": f"+91{phone}",
    #     "From": os.getenv("TWILIO_PHONE_NUMBER"),
    #     "Body": message
    # }
    # async with httpx.AsyncClient() as client:
    #     response = await client.post(url, data=data, auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')))
    #     return response.status_code == 201
    return False

def generate_otp_code() -> str:
    """Generates a 6-digit numeric OTP."""
    return str(random.randint(100000, 999999))
