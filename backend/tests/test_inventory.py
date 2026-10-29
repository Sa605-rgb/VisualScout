from inventory import other_objects, status_for, stock_rows, summary


class Product:
    def __init__(self, id, name, yolo_class, min_count, description=""):
        self.id = id
        self.name = name
        self.yolo_class = yolo_class
        self.min_count = min_count
        self.description = description


PRODUCTS = [
    Product(1, "Bottles", "bottle", 4, "Drink bottles"),
    Product(2, "Cups", "cup", 2, "Cups"),
]


def test_low_only_when_the_object_is_visible():
    assert status_for(0, 4) == "Not in photo"
    assert status_for(1, 4) == "Low"
    assert status_for(4, 4) == "OK"


def test_dashboard_before_any_scan():
    rows, alerts = stock_rows(PRODUCTS, {}, scanned=False)
    assert alerts == []
    assert rows[0]["status"] == "Not scanned"
    assert rows[0]["count"] is None


def test_one_bottle_alerts_and_cups_are_ok():
    rows, alerts = stock_rows(PRODUCTS, {"bottle": 1, "cup": 6, "chair": 2}, scanned=True)
    assert alerts[0]["name"] == "Bottles"
    assert rows[1]["status"] == "OK"
    others = other_objects(PRODUCTS, {"bottle": 1, "cup": 6, "chair": 2})
    assert others == [{"name": "chair", "count": 2}]
    assert summary({"bottle": 1, "cup": 6}) == "1 bottle, 6 cups"
