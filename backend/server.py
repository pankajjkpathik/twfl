from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, status, Query
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import razorpay
import secrets
from datetime import datetime, timezone, timedelta
from enum import Enum

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']

razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class AddressType(str, Enum):
    BILLING = "billing"
    SHIPPING = "shipping"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    images: List[str]
    sizes: List[str]
    colors: Optional[List[str]] = None
    fabric: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    stock: int
    featured: bool = False
    is_new: bool = False
    care_instructions: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    images: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    fabric: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    is_new: Optional[bool] = None
    care_instructions: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int
    size: str
    color: Optional[str] = None

class AddressCreate(BaseModel):
    type: AddressType
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False

class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    shipping_address_id: str
    billing_address_id: str
    payment_method: str
    coupon_code: Optional[str] = None

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_value: Optional[float] = None
    expiry_date: Optional[datetime] = None
    usage_limit: Optional[int] = None

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    tracking_id: Optional[str] = None

@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    email = req.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(req.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": req.name,
        "phone": req.phone,
        "role": UserRole.USER,
        "wishlist": [],
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response = JSONResponse(content={"user": {"_id": user_id, "email": email, "name": req.name, "role": UserRole.USER}})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    user_data = {"_id": user_id, "email": user["email"], "name": user["name"], "role": user.get("role", UserRole.USER)}
    response = JSONResponse(content={"user": user_data})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return response

@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return response

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token not found")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_id = str(user["_id"])
        new_access_token = create_access_token(user_id, user["email"])
        response = JSONResponse(content={"message": "Token refreshed"})
        response.set_cookie(key="access_token", value=new_access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
        return response
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "If the email exists, a reset link will be sent"}
    
    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "email": email,
        "token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False
    })
    
    reset_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    logger.info(f"Password reset link: {reset_link}")
    return {"message": "If the email exists, a reset link will be sent"}

@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    token_doc = await db.password_reset_tokens.find_one({"token": req.token, "used": False})
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    if token_doc["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token has expired")
    
    hashed = hash_password(req.new_password)
    await db.users.update_one({"email": token_doc["email"]}, {"$set": {"password_hash": hashed}})
    await db.password_reset_tokens.update_one({"_id": token_doc["_id"]}, {"$set": {"used": True}})
    
    return {"message": "Password reset successfully"}

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    size: Optional[str] = None,
    color: Optional[str] = None,
    fabric: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    query = {}
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if size:
        query["sizes"] = size
    if color:
        query["colors"] = color
    if fabric:
        query["fabric"] = fabric
    
    sort_options = {
        "newest": [("created_at", -1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
        "popular": [("created_at", -1)]
    }
    sort_by = sort_options.get(sort, [("created_at", -1)])
    
    skip = (page - 1) * limit
    products = await db.products.find(query, {"_id": 0}).sort(sort_by).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    
    return {"products": products, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/products/featured/list")
async def get_featured_products():
    products = await db.products.find({"featured": True}, {"_id": 0}).limit(8).to_list(8)
    return {"products": products}

@api_router.get("/products/new-arrivals/list")
async def get_new_arrivals():
    products = await db.products.find({"is_new": True}, {"_id": 0}).limit(8).to_list(8)
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return {"categories": categories}

@api_router.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await db.cart.find_one({"user_id": user["_id"]}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    
    product_ids = [item["product_id"] for item in cart.get("items", [])]
    products_list = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(len(product_ids))
    products_map = {p["id"]: p for p in products_list}
    
    items_with_details = []
    total = 0
    for item in cart.get("items", []):
        product = products_map.get(item["product_id"])
        if product:
            price = product.get("discount_price") or product["price"]
            item_total = price * item["quantity"]
            total += item_total
            items_with_details.append({**item, "product": product, "item_total": item_total})
    
    return {"items": items_with_details, "total": total}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: dict = Depends(get_current_user)):
    cart = await db.cart.find_one({"user_id": user["_id"]})
    if not cart:
        await db.cart.insert_one({"user_id": user["_id"], "items": [item.model_dump()]})
    else:
        existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id and i["size"] == item.size and i.get("color") == item.color), None)
        if existing_item:
            await db.cart.update_one(
                {"user_id": user["_id"], "items.product_id": item.product_id, "items.size": item.size},
                {"$inc": {"items.$.quantity": item.quantity}}
            )
        else:
            await db.cart.update_one({"user_id": user["_id"]}, {"$push": {"items": item.model_dump()}})
    return {"message": "Item added to cart"}

@api_router.put("/cart/update")
async def update_cart_item(item: CartItem, user: dict = Depends(get_current_user)):
    await db.cart.update_one(
        {"user_id": user["_id"], "items.product_id": item.product_id, "items.size": item.size},
        {"$set": {"items.$.quantity": item.quantity}}
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, size: str, user: dict = Depends(get_current_user)):
    await db.cart.update_one(
        {"user_id": user["_id"]},
        {"$pull": {"items": {"product_id": product_id, "size": size}}}
    )
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.cart.update_one({"user_id": user["_id"]}, {"$set": {"items": []}})
    return {"message": "Cart cleared"}

@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user["_id"])})
    wishlist_ids = user_doc.get("wishlist", [])
    if not wishlist_ids:
        return {"products": []}
    products = await db.products.find({"id": {"$in": wishlist_ids}}, {"_id": 0}).to_list(len(wishlist_ids))
    return {"products": products}

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$addToSet": {"wishlist": product_id}})
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$pull": {"wishlist": product_id}})
    return {"message": "Removed from wishlist"}

@api_router.get("/addresses")
async def get_addresses(user: dict = Depends(get_current_user)):
    addresses = await db.addresses.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return {"addresses": addresses}

@api_router.post("/addresses")
async def create_address(address: AddressCreate, user: dict = Depends(get_current_user)):
    address_doc = {"id": str(uuid.uuid4()), "user_id": user["_id"], **address.model_dump(), "created_at": datetime.now(timezone.utc)}
    if address.is_default:
        await db.addresses.update_many({"user_id": user["_id"], "type": address.type}, {"$set": {"is_default": False}})
    await db.addresses.insert_one(address_doc)
    return {"message": "Address created", "id": address_doc["id"]}

@api_router.put("/addresses/{address_id}")
async def update_address(address_id: str, address: AddressCreate, user: dict = Depends(get_current_user)):
    if address.is_default:
        await db.addresses.update_many({"user_id": user["_id"], "type": address.type}, {"$set": {"is_default": False}})
    await db.addresses.update_one({"id": address_id, "user_id": user["_id"]}, {"$set": address.model_dump()})
    return {"message": "Address updated"}

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(get_current_user)):
    await db.addresses.delete_one({"id": address_id, "user_id": user["_id"]})
    return {"message": "Address deleted"}

@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(order: OrderCreate, user: dict = Depends(get_current_user)):
    total_amount = 0
    for item in order.items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            price = product.get("discount_price") or product["price"]
            total_amount += price * item["quantity"]
    
    if order.coupon_code:
        coupon = await db.coupons.find_one({"code": order.coupon_code, "is_active": True})
        if coupon:
            if coupon.get("min_order_value") and total_amount < coupon["min_order_value"]:
                raise HTTPException(status_code=400, detail="Order value below minimum for coupon")
            if coupon["discount_type"] == "percentage":
                total_amount -= (total_amount * coupon["discount_value"] / 100)
            else:
                total_amount -= coupon["discount_value"]
    
    razorpay_order = razorpay_client.order.create({
        "amount": int(total_amount * 100),
        "currency": "INR",
        "payment_capture": 1
    })
    
    order_number = f"ORD{int(datetime.now(timezone.utc).timestamp())}{uuid.uuid4().hex[:8].upper()}"
    order_doc = {
        "id": str(uuid.uuid4()),
        "order_number": order_number,
        "user_id": user["_id"],
        "items": order.items,
        "total_amount": total_amount,
        "shipping_address_id": order.shipping_address_id,
        "billing_address_id": order.billing_address_id,
        "payment_method": order.payment_method,
        "payment_status": PaymentStatus.PENDING,
        "order_status": OrderStatus.PENDING,
        "razorpay_order_id": razorpay_order["id"],
        "coupon_code": order.coupon_code,
        "created_at": datetime.now(timezone.utc)
    }
    await db.orders.insert_one(order_doc)
    
    return {
        "order_id": razorpay_order["id"],
        "amount": total_amount,
        "currency": "INR",
        "key_id": os.environ.get('RAZORPAY_KEY_ID', ''),
        "internal_order_id": order_doc["id"]
    }

@api_router.post("/orders/verify-payment")
async def verify_payment(request: Request, user: dict = Depends(get_current_user)):
    data = await request.json()
    try:
        razorpay_client.utility.verify_payment_signature(data)
        await db.orders.update_one(
            {"razorpay_order_id": data["razorpay_order_id"]},
            {"$set": {"payment_status": PaymentStatus.COMPLETED, "order_status": OrderStatus.PROCESSING, "razorpay_payment_id": data["razorpay_payment_id"]}}
        )
        await db.cart.update_one({"user_id": user["_id"]}, {"$set": {"items": []}})
        return {"message": "Payment verified successfully"}
    except Exception as e:
        await db.orders.update_one(
            {"razorpay_order_id": data.get("razorpay_order_id")},
            {"$set": {"payment_status": PaymentStatus.FAILED}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/orders")
async def get_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    all_product_ids = list(set(item["product_id"] for order in orders for item in order.get("items", [])))
    if all_product_ids:
        products_list = await db.products.find({"id": {"$in": all_product_ids}}, {"_id": 0, "id": 1, "name": 1, "images": 1}).to_list(len(all_product_ids))
        products_map = {p["id"]: p for p in products_list}
        for order in orders:
            for item in order.get("items", []):
                product = products_map.get(item["product_id"])
                if product:
                    item["product"] = product
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    product_ids = [item["product_id"] for item in order.get("items", [])]
    if product_ids:
        products_list = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(len(product_ids))
        products_map = {p["id"]: p for p in products_list}
        for item in order.get("items", []):
            product = products_map.get(item["product_id"])
            if product:
                item["product"] = product
    
    shipping_address = await db.addresses.find_one({"id": order["shipping_address_id"]}, {"_id": 0})
    billing_address = await db.addresses.find_one({"id": order["billing_address_id"]}, {"_id": 0})
    
    order["shipping_address"] = shipping_address
    order["billing_address"] = billing_address
    
    return order

@api_router.get("/admin/dashboard/stats")
async def get_dashboard_stats(admin: dict = Depends(get_current_admin)):
    total_orders = await db.orders.count_documents({})
    revenue_result = await db.orders.aggregate([
        {"$match": {"payment_status": PaymentStatus.COMPLETED}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({"role": UserRole.USER})
    
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "recent_orders": recent_orders
    }

@api_router.get("/admin/products")
async def admin_get_products(admin: dict = Depends(get_current_admin), page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100)):
    skip = (page - 1) * limit
    products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents({})
    return {"products": products, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.post("/admin/products")
async def admin_create_product(product: ProductCreate, admin: dict = Depends(get_current_admin)):
    product_doc = {"id": str(uuid.uuid4()), **product.model_dump(), "created_at": datetime.now(timezone.utc)}
    await db.products.insert_one(product_doc)
    return {"message": "Product created", "id": product_doc["id"]}

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, product: ProductUpdate, admin: dict = Depends(get_current_admin)):
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    return {"message": "Product updated"}

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted"}

@api_router.get("/admin/orders")
async def admin_get_orders(admin: dict = Depends(get_current_admin), page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100)):
    skip = (page - 1) * limit
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents({})
    return {"orders": orders, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, update: OrderStatusUpdate, admin: dict = Depends(get_current_admin)):
    update_data = {"order_status": update.status}
    if update.tracking_id:
        update_data["tracking_id"] = update.tracking_id
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    return {"message": "Order status updated"}

@api_router.get("/admin/coupons")
async def admin_get_coupons(admin: dict = Depends(get_current_admin)):
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(100)
    return {"coupons": coupons}

@api_router.post("/admin/coupons")
async def admin_create_coupon(coupon: CouponCreate, admin: dict = Depends(get_current_admin)):
    existing = await db.coupons.find_one({"code": coupon.code})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_doc = {"id": str(uuid.uuid4()), **coupon.model_dump(), "used_count": 0, "is_active": True, "created_at": datetime.now(timezone.utc)}
    await db.coupons.insert_one(coupon_doc)
    return {"message": "Coupon created", "id": coupon_doc["id"]}

@api_router.put("/admin/coupons/{coupon_id}")
async def admin_update_coupon(coupon_id: str, coupon: CouponCreate, admin: dict = Depends(get_current_admin)):
    await db.coupons.update_one({"id": coupon_id}, {"$set": coupon.model_dump()})
    return {"message": "Coupon updated"}

@api_router.delete("/admin/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, admin: dict = Depends(get_current_admin)):
    await db.coupons.update_one({"id": coupon_id}, {"$set": {"is_active": False}})
    return {"message": "Coupon deactivated"}

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, total_amount: float, user: dict = Depends(get_current_user)):
    coupon = await db.coupons.find_one({"code": code, "is_active": True})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if coupon.get("expiry_date") and coupon["expiry_date"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")
    
    if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    if coupon.get("min_order_value") and total_amount < coupon["min_order_value"]:
        raise HTTPException(status_code=400, detail=f"Minimum order value of {coupon['min_order_value']} required")
    
    discount_amount = 0
    if coupon["discount_type"] == "percentage":
        discount_amount = total_amount * coupon["discount_value"] / 100
    else:
        discount_amount = coupon["discount_value"]
    
    return {"valid": True, "discount_amount": discount_amount, "discount_type": coupon["discount_type"], "discount_value": coupon["discount_value"]}

app.include_router(api_router)

allowed_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.addresses.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    await db.coupons.create_index("code", unique=True)
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@thewomen.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": UserRole.ADMIN,
            "wishlist": [],
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")
    
    categories_data = [
        {"id": "kurtis", "name": "Kurtis", "slug": "kurtis"},
        {"id": "ethnic-dresses", "name": "Ethnic Dresses", "slug": "ethnic-dresses"},
        {"id": "ethnic-sets-dupatta", "name": "Ethnic Sets with Dupatta", "slug": "ethnic-sets-dupatta"},
        {"id": "ethnic-sets", "name": "Ethnic Sets", "slug": "ethnic-sets"},
        {"id": "coord-sets", "name": "Co-ord Sets", "slug": "coord-sets"},
        {"id": "festive", "name": "Festive Collection", "slug": "festive"},
    ]
    for cat in categories_data:
        existing_cat = await db.categories.find_one({"id": cat["id"]})
        if not existing_cat:
            await db.categories.insert_one(cat)
    
    test_creds = f"""# Test Credentials for The Women E-commerce

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
"""
    Path("/app/memory").mkdir(exist_ok=True)
    Path("/app/memory/test_credentials.md").write_text(test_creds)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()