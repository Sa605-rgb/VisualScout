import json
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow():
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    scans = relationship("Scan", back_populates="user")


class Product(Base):
    """One shelf item the model can count. yolo_class is a COCO name such as bottle."""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    yolo_class = Column(String(50), unique=True, nullable=False)
    min_count = Column(Integer, nullable=False)
    description = Column(String(255), nullable=False)


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    counts_json = Column(Text, nullable=False)
    image_name = Column(String(100), nullable=False, default="")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="scans")

    def counts(self):
        return json.loads(self.counts_json or "{}")
