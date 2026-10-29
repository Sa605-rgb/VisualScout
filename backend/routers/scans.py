import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from detector import detect_counts
from inventory import other_objects, stock_rows, summary
from models import Product, Scan, User
from schemas import DashboardOut, ScanListItem, ScanOut, StockRow

router = APIRouter(tags=["Inventory"])
UPLOADS = Path(__file__).resolve().parent.parent / "uploads"


def get_detector():
    return detect_counts


def image_suffix(content_type: str | None, filename: str | None) -> str:
    mapping = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    if content_type in mapping:
        return mapping[content_type]
    lower = (filename or "").lower()
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        if lower.endswith(ext):
            return ".jpg" if ext == ".jpeg" else ext
    return ".jpg"


def latest_scan(db: Session, user_id: int) -> Scan | None:
    return (
        db.query(Scan)
        .filter(Scan.user_id == user_id)
        .order_by(Scan.id.desc())
        .first()
    )


def scan_payload(scan: Scan, products: list[Product]) -> ScanOut:
    counts = scan.counts()
    rows, alerts = stock_rows(products, counts, scanned=True)
    return ScanOut(
        id=scan.id,
        created_at=scan.created_at,
        image_url=f"/uploads/{scan.image_name}" if scan.image_name else "",
        summary=summary(counts),
        low_count=len(alerts),
        products=[StockRow(**row) for row in rows],
        alerts=[StockRow(**row) for row in alerts],
        other=other_objects(products, counts),
    )


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.id).all()
    scan = latest_scan(db, user.id)
    counts = scan.counts() if scan else {}
    rows, alerts = stock_rows(products, counts, scanned=scan is not None)
    return DashboardOut(
        scanned=scan is not None,
        scanned_at=scan.created_at if scan else None,
        alerts=[StockRow(**row) for row in alerts],
        products=[StockRow(**row) for row in rows],
    )


@router.get("/products", response_model=list[StockRow])
def list_products(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.id).all()
    scan = latest_scan(db, user.id)
    counts = scan.counts() if scan else {}
    rows, _alerts = stock_rows(products, counts, scanned=scan is not None)
    return [StockRow(**row) for row in rows]


@router.get("/scans", response_model=list[ScanListItem])
def list_scans(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(Product).all()
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == user.id)
        .order_by(Scan.id.desc())
        .all()
    )
    items = []
    for scan in scans:
        payload = scan_payload(scan, products)
        items.append(
            ScanListItem(
                id=payload.id,
                created_at=payload.created_at,
                image_url=payload.image_url,
                summary=payload.summary,
                low_count=payload.low_count,
            )
        )
    return items


@router.post("/scans", response_model=ScanOut, status_code=201)
async def create_scan(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    detector=Depends(get_detector),
):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Upload a photo")
    try:
        detected = detector(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    suffix = image_suffix(file.content_type, file.filename)
    if isinstance(detected, dict) and "counts" in detected:
        counts = detected["counts"]
        if detected.get("image"):
            raw = detected["image"]
            suffix = ".jpg"
    else:
        counts = detected

    scan = Scan(user_id=user.id, counts_json=json.dumps(counts), image_name="")
    db.add(scan)
    db.flush()
    UPLOADS.mkdir(exist_ok=True)
    filename = f"{scan.id}{suffix}"
    (UPLOADS / filename).write_bytes(raw)
    scan.image_name = filename
    db.commit()
    db.refresh(scan)
    products = db.query(Product).order_by(Product.id).all()
    return scan_payload(scan, products)


@router.get("/scans/{scan_id}", response_model=ScanOut)
def get_scan(
    scan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user.id).first()
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")
    products = db.query(Product).order_by(Product.id).all()
    return scan_payload(scan, products)
