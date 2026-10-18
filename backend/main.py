from pathlib import Path
import shutil
import time
import uuid
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = (
    ROOT / "outputs" / "training" / "neu_det_improved"
    / "weights" / "best.pt"
)
UPLOAD_DIR = ROOT / "outputs" / "web_uploads"
RESULT_DIR = ROOT / "outputs" / "web_results"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Steel Surface Defect Detection API",
    description="Enterprise Vision AI Backend for NEU-DET Surface Defect Detection",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")

model = None
startup_timestamp = time.time()


@app.on_event("startup")
def load_model():
    global model
    if MODEL_PATH.exists():
        model = YOLO(str(MODEL_PATH))
        print(f"[READY] YOLO Defect Detection Model loaded from: {MODEL_PATH}")
    else:
        print(f"[WARN] Model not found at: {MODEL_PATH}")


def calculate_verdict(detections: list) -> dict:
    """Calculate metallurgical pass/warning/reject verdict."""
    if not detections:
        return {
            "grade": "GRADE A",
            "verdict": "PASS",
            "summary": "100% CLEARANCE // ZERO DEFECTS",
            "action": "Coil passed metallurgical standards. Dispatched to automated strapping.",
        }

    has_critical = any(d.get("defect") in ["crazing", "inclusion"] for d in detections)
    if has_critical or len(detections) >= 3:
        return {
            "grade": "GRADE C",
            "verdict": "REJECT",
            "summary": "CRITICAL ANOMALY ISOLATED",
            "action": "Coil marked with orange dye. Automated re-mill diversion executed.",
        }

    return {
        "grade": "GRADE B",
        "verdict": "WARNING",
        "summary": "CONDITION B // SECONDARY REVIEW",
        "action": "Surface marks within tolerance. Routed to finishing stand for mechanical grinding.",
    }


def execute_inference_on_file(image_path: Path, original_filename: str, conf_threshold: float = 0.15) -> dict:
    """Run model prediction on a local saved image file."""
    global model
    t0 = time.time()
    predictions = model.predict(
        source=str(image_path),
        imgsz=320,
        conf=max(0.01, min(0.99, conf_threshold)),
        iou=0.45,
        max_det=15,
        verbose=False,
    )
    latency_ms = round((time.time() - t0) * 1000, 2)
    result = predictions[0]

    output_name = f"{image_path.stem}_result.jpg"
    output_path = RESULT_DIR / output_name

    if not result.save(str(output_path)):
        raise RuntimeError(f"Could not save output image: {output_path}")

    detections = []
    for box in result.boxes:
        class_id = int(box.cls[0].item())
        defect_name = model.names[class_id]
        confidence = round(float(box.conf[0].item()), 4)
        box_coords = [round(float(v), 2) for v in box.xyxy[0].tolist()]
        detections.append({
            "defect": defect_name,
            "confidence": confidence,
            "box": box_coords,
        })

    verdict_info = calculate_verdict(detections)

    return {
        "filename": original_filename,
        "count": len(detections),
        "detections": detections,
        "result_image": f"/results/{output_name}",
        "latency_ms": latency_ms,
        "grade": verdict_info["grade"],
        "verdict": verdict_info["verdict"],
        "verdict_summary": verdict_info["summary"],
        "recommended_action": verdict_info["action"],
    }


@app.get("/")
def home():
    return {
        "service": "DefectVision Production Vision API",
        "status": "online",
        "model_loaded": model is not None,
        "endpoints": {
            "health": "/health",
            "model_info": "/model-info",
            "single_predict": "/predict [POST]",
            "batch_predict": "/predict-batch [POST]",
        },
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "uptime_seconds": round(time.time() - startup_timestamp, 1),
        "defect_classes": list(model.names.values()) if model else [],
        "total_classes": len(model.names) if model else 0,
    }


@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not initialized")
    return {
        "architecture": "YOLOv11 Defect Detector",
        "classes": model.names,
        "imgsz": 320,
        "default_conf": 0.15,
        "default_iou": 0.45,
        "model_path": str(MODEL_PATH),
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    conf: float = Form(0.15),
):
    """Inspect a single steel specimen image."""
    global model
    if model is None:
        raise HTTPException(status_code=500, detail="Trained model not found")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, BMP, or WEBP image")

    temp_image_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"

    try:
        with temp_image_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return execute_inference_on_file(temp_image_path, file.filename or "specimen.jpg", conf)
    finally:
        await file.close()
        temp_image_path.unlink(missing_ok=True)


@app.post("/predict-batch")
async def predict_batch(
    files: List[UploadFile] = File(...),
    conf: float = Form(0.15),
):
    """Inspect multiple steel specimen images in batch."""
    global model
    if model is None:
        raise HTTPException(status_code=500, detail="Trained model not found")

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []
    total_latency = 0.0
    passed_count = 0
    warning_count = 0
    rejected_count = 0
    total_defects = 0

    for upload in files:
        extension = Path(upload.filename or "").suffix.lower()
        if extension not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
            continue

        temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"
        try:
            with temp_path.open("wb") as buffer:
                shutil.copyfileobj(upload.file, buffer)

            item_res = execute_inference_on_file(temp_path, upload.filename or "specimen.jpg", conf)
            results.append(item_res)

            total_latency += item_res["latency_ms"]
            total_defects += item_res["count"]

            if item_res["verdict"] == "PASS":
                passed_count += 1
            elif item_res["verdict"] == "WARNING":
                warning_count += 1
            else:
                rejected_count += 1

        finally:
            await upload.close()
            temp_path.unlink(missing_ok=True)

    if not results:
        raise HTTPException(status_code=400, detail="No valid image files could be processed")

    success_rate = round((passed_count / len(results)) * 100, 1)
    avg_latency = round(total_latency / len(results), 2)

    return {
        "batch_id": f"BATCH-{uuid.uuid4().hex[:8].upper()}",
        "total_files": len(results),
        "passed_count": passed_count,
        "warning_count": warning_count,
        "rejected_count": rejected_count,
        "success_rate": success_rate,
        "total_defects": total_defects,
        "avg_latency_ms": avg_latency,
        "results": results,
    }
