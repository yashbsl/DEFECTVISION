
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent

MODEL = (
    ROOT / "outputs" / "training" / "neu_det_30_epochs"
    / "weights" / "best.pt"
)
DATA = ROOT / "training" / "data.yaml"

def main():
    if not MODEL.exists():
        raise FileNotFoundError(f"Model not found: {MODEL}")

    model = YOLO(str(MODEL))

    metrics = model.val(
        data=str(DATA),
        imgsz=224,
        batch=4,
        device="cpu",
        workers=0,
        plots=True,
        project=str(ROOT / "outputs" / "evaluation"),
        name="neu_det_30_epochs",
        exist_ok=True,
    )

    print("\n--- FINAL VALIDATION METRICS ---")
    print(f"Precision: {metrics.box.mp:.4f}")
    print(f"Recall:    {metrics.box.mr:.4f}")
    print(f"mAP50:     {metrics.box.map50:.4f}")
    print(f"mAP50-95:  {metrics.box.map:.4f}")

if __name__ == "__main__":
    main()
