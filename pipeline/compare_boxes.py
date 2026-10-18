
from pathlib import Path
import xml.etree.ElementTree as ET
import cv2
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent


IMAGE = ROOT / "outputs/test_images/crazing_242.jpg"
XML = ROOT / "dataset/raw/archive/NEU-DET/validation/annotations/crazing_242.xml"
MODEL = ROOT / "outputs" / "training" / "neu_det_improved" / "weights" / "best.pt"
OUTPUT = ROOT / "outputs/compare_crazing_242.jpg"

image = cv2.imread(str(IMAGE))
if image is None:
    raise FileNotFoundError(f"Image not found: {IMAGE}")

height, width = image.shape[:2]

# Ground-truth boxes: GREEN
root = ET.parse(XML).getroot()
for obj in root.findall("object"):
    box = obj.find("bndbox")
    x1 = int(float(box.findtext("xmin")))
    y1 = int(float(box.findtext("ymin")))
    x2 = int(float(box.findtext("xmax")))
    y2 = int(float(box.findtext("ymax")))
    name = obj.findtext("name", "defect")
    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(image, f"GT: {name}", (5, 18),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)

# Predictions: RED; use low threshold only for diagnosis
model = YOLO(str(MODEL))
result = model.predict(
    source=str(IMAGE),
    imgsz=320,
    conf=0.05,
    iou=0.45,
    max_det=10,
    verbose=False
)[0]

for box in result.boxes:
    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
    class_id = int(box.cls[0].item())
    confidence = float(box.conf[0].item())
    name = model.names[class_id]
    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 1)
    cv2.putText(image, f"{name} {confidence:.2f}", (x1, max(10, y1)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 0, 255), 1)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
cv2.imwrite(str(OUTPUT), image)
print("Green = original annotation; Red = model predictions")
print("Prediction count:", len(result.boxes))
print("Saved:", OUTPUT)
