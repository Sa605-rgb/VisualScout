from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    language: str

    model_config = ConfigDict(from_attributes=True)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class StockRow(BaseModel):
    id: int
    name: str
    yolo_class: str
    min_count: int
    description: str
    count: int | None
    status: str


class SeenObject(BaseModel):
    name: str
    count: int


class DashboardOut(BaseModel):
    scanned: bool
    scanned_at: datetime | None
    alerts: list[StockRow]
    products: list[StockRow]


class ScanOut(BaseModel):
    id: int
    created_at: datetime
    image_url: str
    summary: str
    low_count: int
    products: list[StockRow]
    alerts: list[StockRow]
    other: list[SeenObject]


class ScanListItem(BaseModel):
    id: int
    created_at: datetime
    image_url: str
    summary: str
    low_count: int
