
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent


MODEL = ROOT / "outputs" / "training" / "neu_det_30_epochs" / "weights" / "best.pt"
IMAGES = ROOT / "dataset" / "processed" / "neu_det" / "images" / "validation"
OUTPUT = ROOT / "outputs" / "predictions"

def main():
    if not MODEL.exists():
        raise FileNotFoundError(f"Model not found: {MODEL}")

    if not IMAGES.exists() or not any(IMAGES.iterdir()):
        raise FileNotFoundError(f"Validation images not found: {IMAGES}")

    model = YOLO(str(MODEL))

    results = model.predict(
        source=str(IMAGES),
        imgsz=320,
        conf=0.25,
        device="cpu",
        save=True,
        project=str(OUTPUT),
        name="validation_sample",
        exist_ok=True,
        max_det=20,
    )

    print(f"Images processed: {len(results)}")
    print(f"Predictions saved in: {OUTPUT / 'validation_sample'}")

    for result in results[:5]:
        print(
            f"{Path(result.path).name}: "
            f"{len(result.boxes)} detections"
        )

if __name__ == "__main__":
    main()
