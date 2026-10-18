
from pathlib import Path
from ultralytics import YOLO

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_YAML = PROJECT_ROOT / "training" / "data.yaml"
PRETRAINED_MODEL = PROJECT_ROOT / "yolo11n.pt"

if not DATA_YAML.exists():
    raise FileNotFoundError(f"Dataset config not found: {DATA_YAML}")

if not PRETRAINED_MODEL.exists():
    raise FileNotFoundError(f"Pretrained model not found: {PRETRAINED_MODEL}")


def main():
    print("Starting defect detection training...")
    print(f"Dataset: {DATA_YAML}")
    print("Device: CPU")
    print("Image size: 320")

    model = YOLO(str(PRETRAINED_MODEL))

    model.train(
        data=str(DATA_YAML),
        epochs=30,
        imgsz=320,
        batch=4,
        device="cpu",
        workers=0,
        patience=10,
        optimizer="AdamW",
        lr0=0.001,
        weight_decay=0.0005,
        project=str(PROJECT_ROOT / "outputs" / "training"),
        name="neu_det_improved",
        exist_ok=True,
        plots=True,
        seed=42,
        deterministic=True,
        pretrained=True,
        cache=False,
    )

    print("\nTraining finished.")
    print(
        "Best model:",
        PROJECT_ROOT
        / "outputs"
        / "training"
        / "neu_det_improved"
        / "weights"
        / "best.pt",
    )


if __name__ == "__main__":
    main()
