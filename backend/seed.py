from auth import hash_password
from models import Product, User

PRODUCTS = [
    {
        "name": "Bottles",
        "yolo_class": "bottle",
        "min_count": 4,
        "description": "Drink bottles on the shelf",
    },
    {
        "name": "Cups",
        "yolo_class": "cup",
        "min_count": 2,
        "description": "Cups or mugs",
    },
    {
        "name": "Books",
        "yolo_class": "book",
        "min_count": 2,
        "description": "Books in the display",
    },
    {
        "name": "Apples",
        "yolo_class": "apple",
        "min_count": 3,
        "description": "Loose apples",
    },
    {
        "name": "Bananas",
        "yolo_class": "banana",
        "min_count": 3,
        "description": "Banana bunch",
    },
    {
        "name": "Oranges",
        "yolo_class": "orange",
        "min_count": 2,
        "description": "Loose oranges",
    },
]


def seed_data(db):
    if db.query(Product).count() == 0:
        db.add_all(Product(**item) for item in PRODUCTS)
    email = "samavia.demo@example.com"
    if db.query(User).filter(User.email == email).first() is None:
        db.add(User(name="Samavia", email=email, password=hash_password("secret12")))
    db.commit()
