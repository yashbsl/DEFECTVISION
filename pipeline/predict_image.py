
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    ROOT
    / "outputs"
    / "training"
    / "neu_det_improved"
    / "weights"
    / "best.pt"
)

INPUT_DIR = ROOT / "outputs" / "test_images"
OUTPUT_DIR = ROOT / "outputs" / "image_predictions"


def main():
    if not MODEL_PATH.exists():
        print(f"Model not found: {MODEL_PATH}")
        return

    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    images = [
        file for file in INPUT_DIR.iterdir()
        if file.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}
    ]

    if not images:
        print(f"No images found in: {INPUT_DIR}")
        print("Is folder mein JPG ya PNG image paste karo.")
        return

    model = YOLO(str(MODEL_PATH))

    results = model.predict(
        source=[str(image) for image in images],
        imgsz=320,
        conf=0.15,
        iou=0.45,
        max_det=10,   
        save=True,
        project=str(OUTPUT_DIR),
        name="results",
        exist_ok=True
    )

    for image, result in zip(images, results):
        print(f"\nImage: {image.name}")

        if len(result.boxes) == 0:
            print("No defects detected.")
        else:
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                class_name = model.names[class_id]

                print(
                    f"Defect: {class_name} | "
                    f"Confidence: {confidence:.1%}"
                )

    print(f"\nAnnotated images saved to: {OUTPUT_DIR / 'results'}")


if __name__ == "__main__":
    main()
