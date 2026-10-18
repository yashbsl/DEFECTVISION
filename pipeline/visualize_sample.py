
from pathlib import Path
import cv2

ROOT = Path("dataset/processed/neu_det")
IMAGE_DIR = ROOT / "images" / "train"
LABEL_DIR = ROOT / "labels" / "train"
OUTPUT = Path("outputs/sample_bbox.jpg")

label_path = LABEL_DIR / "crazing_1.txt"
image_candidates = [
    p for p in IMAGE_DIR.glob("crazing_1.*")
    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}
]

if not image_candidates:
    raise FileNotFoundError("Image crazing_1 not found")

image_path = image_candidates[0]
image = cv2.imread(str(image_path))

if image is None:
    raise RuntimeError(f"Could not read image: {image_path}")

height, width = image.shape[:2]

for line in label_path.read_text(encoding="utf-8").splitlines():
    parts = line.split()
    if len(parts) != 5:
        continue

    class_id = int(parts[0])
    x_center, y_center, box_width, box_height = map(float, parts[1:])

    x1 = int((x_center - box_width / 2) * width)
    y1 = int((y_center - box_height / 2) * height)
    x2 = int((x_center + box_width / 2) * width)
    y2 = int((y_center + box_height / 2) * height)

    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(
        image,
        f"class {class_id}",
        (max(0, x1), max(20, y1 - 8)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1,
    )

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
cv2.imwrite(str(OUTPUT), image)

print("Image:", image_path)
print("Image dimensions:", width, "x", height)
print("Saved visualization:", OUTPUT.resolve())
