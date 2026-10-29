"""YOLOv8n counts COCO objects. The model file downloads on the first scan."""

MIN_CONFIDENCE = 0.35
_model = None


def detect_counts(image_bytes: bytes) -> dict:
    import cv2
    import numpy as np
    from ultralytics import YOLO

    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Upload a real photo")

    global _model
    if _model is None:
        _model = YOLO("yolov8n.pt")

    counts = {}
    scale = max(image.shape[1] / 900, 0.7)
    thickness = max(int(2 * scale), 2)
    for result in _model(image, verbose=False):
        if result.boxes is None:
            continue
        for box in result.boxes:
            confidence = float(box.conf)
            if confidence < MIN_CONFIDENCE:
                continue
            label = result.names[int(box.cls)]
            counts[label] = counts.get(label, 0) + 1
            x1, y1, x2, y2 = [int(value) for value in box.xyxy[0]]
            cv2.rectangle(image, (x1, y1), (x2, y2), (46, 140, 90), thickness)
            caption = f"{label} {confidence:.0%}"
            cv2.putText(
                image,
                caption,
                (x1, max(y1 - 8, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6 * scale,
                (15, 70, 40),
                thickness,
                cv2.LINE_AA,
            )

    ok, encoded = cv2.imencode(".jpg", image)
    if not ok:
        raise ValueError("Could not draw the detection boxes")
    return {"counts": counts, "image": encoded.tobytes()}
