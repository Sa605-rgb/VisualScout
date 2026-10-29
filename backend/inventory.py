def status_for(count, minimum):
    """Low only when the item is actually visible and under the minimum."""
    if count <= 0:
        return "Not in photo"
    if count < minimum:
        return "Low"
    return "OK"


def stock_rows(products, counts, scanned):
    rows = []
    for product in products:
        count = int(counts.get(product.yolo_class, 0)) if scanned else 0
        status = status_for(count, product.min_count) if scanned else "Not scanned"
        rows.append(
            {
                "id": product.id,
                "name": product.name,
                "yolo_class": product.yolo_class,
                "min_count": product.min_count,
                "description": product.description,
                "count": count if scanned else None,
                "status": status,
            }
        )
    alerts = [row for row in rows if row["status"] == "Low"]
    return rows, alerts


def other_objects(products, counts):
    tracked = {product.yolo_class for product in products}
    return [
        {"name": name, "count": count}
        for name, count in sorted(counts.items())
        if name not in tracked and count > 0
    ]


def object_word(name, count):
    if count == 1 or name.endswith("s"):
        return name
    return f"{name}s"


def summary(counts):
    parts = [
        f"{count} {object_word(name, count)}"
        for name, count in sorted(counts.items())
        if count > 0
    ]
    return ", ".join(parts) if parts else "Nothing detected"
