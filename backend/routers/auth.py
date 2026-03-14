from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from services import auth_service
from services.db_service import get_pool
from pydantic import BaseModel, constr
from typing import Optional
import random

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify-otp")

class PhoneRequest(BaseModel):
    phone: constr(min_length=10, max_length=10)
    name: Optional[str] = None # Name is required only for first time
    aadhaar_number: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    phone: constr(min_length=10, max_length=10)
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str

# In-memory store for simulated OTPs (in production this would be Redis)
# Format: { 'phone': '123456' }
simulated_otp_store = {}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth_service.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    phone: str = payload.get("sub")
    if phone is None:
        raise credentials_exception
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT id, name, phone FROM citizens WHERE phone = $1", phone)
        if user is None:
            raise credentials_exception
        return user

@router.post("/generate-otp")
async def generate_otp(request: PhoneRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Check if citizen exists
        existing_user = await conn.fetchval("SELECT id FROM citizens WHERE phone = $1", request.phone)
        
        # If new user and name is missing, ask for registration details
        if not existing_user and not request.name:
            return {"message": "New User. Registration required.", "requires_registration": True}
        
        if not existing_user:
            if not request.aadhaar_number:
                raise HTTPException(status_code=400, detail="Aadhaar number is required for registration.")
                
            try:
                await conn.execute(
                    """
                    INSERT INTO citizens (phone, name, aadhaar_number)
                    VALUES ($1, $2, $3)
                    """,
                    request.phone, request.name, request.aadhaar_number
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

        # Print OTP to console for debugging, return it for seamless testing
        otp = str(random.randint(100000, 999999))
        simulated_otp_store[request.phone] = otp
        print(f"Generated OTP for {request.phone}: {otp}")
        
        # In a real app we'd SMS this. Here, we return it to auto-fill the frontend.
        return {"message": "OTP sent successfully", "simulated_otp": otp}

@router.post("/verify-otp", response_model=Token)
async def verify_otp(request: OTPVerifyRequest):
    # Verify the OTP against our in-memory store
    stored_otp = simulated_otp_store.get(request.phone)
    
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT id, phone FROM citizens WHERE phone = $1", request.phone)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # OTP is verified, create the real access token
        access_token = auth_service.create_access_token(data={"sub": user["phone"], "id": str(user["id"])})
        
        # Clear the OTP
        simulated_otp_store.pop(request.phone, None)
        
        return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(request: dict):
    # This is a simplified login for admin/official access as used in admin/login/page.tsx
    # In a real app, this would verify against a database
    email = request.get("email")
    password = request.get("password")
    
    # Official admin access from the frontend code
    if email == "19792@apsrkpuram.edu.in" and password == "123456789":
         access_token = auth_service.create_access_token(data={"sub": email, "role": "admin"})
         return {"access_token": access_token, "token_type": "bearer"}
         
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["id"]),
        "name": current_user["name"],
        "phone": current_user["phone"]
    }
