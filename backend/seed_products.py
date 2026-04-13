import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

sample_products = [
    {
        "id": str(uuid.uuid4()),
        "name": "Elegant Maroon Anarkali Kurti",
        "description": "Beautiful maroon anarkali kurti with intricate golden embroidery. Perfect for festive occasions.",
        "price": 2499,
        "discount_price": 1999,
        "images": [
            "https://images.unsplash.com/photo-1756483509164-e9e652cb51bb?w=500",
            "https://images.unsplash.com/photo-1756483509177-bbabd67a3234?w=500"
        ],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Maroon", "Gold"],
        "fabric": "Cotton Silk",
        "category": "kurtis",
        "stock": 50,
        "featured": True,
        "is_new": True,
        "care_instructions": "Hand wash separately in cold water. Do not bleach. Dry in shade.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Floral Print Ethnic Dress",
        "description": "Vibrant floral print ethnic dress with comfortable fit. Ideal for casual and formal events.",
        "price": 1899,
        "discount_price": 1499,
        "images": [
            "https://images.unsplash.com/photo-1768651925875-d1523ed07cb6?w=500",
            "https://images.unsplash.com/photo-1768803968260-3dab844c1476?w=500"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Multicolor"],
        "fabric": "Cotton",
        "category": "ethnic-dresses",
        "stock": 40,
        "featured": True,
        "is_new": True,
        "care_instructions": "Machine wash cold. Tumble dry low.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pink Festive Kurti Set with Dupatta",
        "description": "Stunning pink kurti set with embellished dupatta. Makes a statement at any celebration.",
        "price": 3499,
        "discount_price": 2799,
        "images": [
            "https://images.unsplash.com/photo-1756483510859-c0ab4c45782c?w=500"
        ],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Pink", "Gold"],
        "fabric": "Georgette",
        "category": "ethnic-sets-dupatta",
        "stock": 30,
        "featured": True,
        "is_new": False,
        "care_instructions": "Dry clean only.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Golden Embroidered Ethnic Set",
        "description": "Luxurious golden embroidered ethnic set for special occasions and weddings.",
        "price": 4999,
        "discount_price": 3999,
        "images": [
            "https://images.unsplash.com/photo-1756483509164-e9e652cb51bb?w=500"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Golden", "Cream"],
        "fabric": "Silk",
        "category": "festive",
        "stock": 25,
        "featured": False,
        "is_new": True,
        "care_instructions": "Dry clean only.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Contemporary Co-ord Set",
        "description": "Modern co-ord set with printed top and palazzo pants. Comfortable and stylish.",
        "price": 1699,
        "discount_price": None,
        "images": [
            "https://images.unsplash.com/photo-1768803968260-3dab844c1476?w=500"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Multicolor"],
        "fabric": "Rayon",
        "category": "coord-sets",
        "stock": 60,
        "featured": False,
        "is_new": True,
        "care_instructions": "Machine wash cold. Do not iron directly on print.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Traditional Printed Kurti",
        "description": "Classic printed kurti with traditional motifs. Versatile for everyday wear.",
        "price": 999,
        "discount_price": 799,
        "images": [
            "https://images.unsplash.com/photo-1768651925875-d1523ed07cb6?w=500"
        ],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Beige", "Brown"],
        "fabric": "Cotton",
        "category": "kurtis",
        "stock": 80,
        "featured": False,
        "is_new": False,
        "care_instructions": "Machine wash cold.",
        "created_at": datetime.now(timezone.utc)
    }
]

async def seed_products():
    existing_count = await db.products.count_documents({})
    if existing_count > 0:
        print(f"Products already exist ({existing_count}). Skipping seed.")
        return
    
    result = await db.products.insert_many(sample_products)
    print(f"Seeded {len(result.inserted_ids)} products successfully!")

if __name__ == "__main__":
    asyncio.run(seed_products())
    client.close()
