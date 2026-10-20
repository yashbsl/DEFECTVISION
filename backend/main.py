from pathlib import Path
import base64
import hashlib
import hmac
import json
import os
import re
import shutil
import sqlite3
import time
import uuid
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "outputs" / "training" / "neu_det_improved" / "weights" / "best.pt"
UPLOAD_DIR = ROOT / "outputs" / "web_uploads"
RESULT_DIR = ROOT / "outputs" / "web_results"
AUTH_DB_PATH = ROOT / "outputs" / "defectvision_users.db"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)
AUTH_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Set DEFECTVISION_SECRET_KEY in your environment before deploying.
SECRET_KEY = os.getenv("DEFECTVISION_SECRET_KEY", "dev-only-change-this-secret-before-deployment")
TOKEN_EXPIRE_SECONDS = 60 * 60 * 8
PBKDF2_ITERATIONS = 310_000

app = FastAPI(
    title="Steel Surface Defect Detection API",
    description="DefectVision API for NEU-DET surface defect detection and operator authentication",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")

model = None
startup_timestamp = time.time()


def db_connect():
    conn = sqlite3.connect(AUTH_DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db():
    with db_connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


@app.on_event("startup")
def startup():
    global model
    init_auth_db()
    if MODEL_PATH.exists():
        model = YOLO(str(MODEL_PATH))
        print(f"[READY] YOLO Defect Detection Model loaded from: {MODEL_PATH}")
    else:
        print(f"[WARN] Model not found at: {MODEL_PATH}")


def public_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "created_at": row["created_at"]}


def hash_password(password: str, salt: Optional[bytes] = None):
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return base64.b64encode(digest).decode("ascii"), base64.b64encode(salt).decode("ascii")


def verify_password(password: str, stored_hash: str, stored_salt: str) -> bool:
    try:
        salt = base64.b64decode(stored_salt.encode("ascii"))
        calculated, _ = hash_password(password, salt)
        return hmac.compare_digest(calculated, stored_hash)
    except (ValueError, TypeError):
        return False


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def create_access_token(user_id: int, email: str) -> str:
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(user_id), "email": email, "iat": now, "exp": now + TOKEN_EXPIRE_SECONDS}
    head = b64url(json.dumps(header, separators=(",", ":")).encode())
    body = b64url(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{head}.{body}".encode("ascii")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{head}.{body}.{b64url(signature)}"


def decode_access_token(token: str):
    try:
        head, body, signature = token.split(".")
        signing_input = f"{head}.{body}".encode("ascii")
        expected = b64url(hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Bad signature")
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if int(payload.get("exp", 0)) <= int(time.time()):
            raise ValueError("Expired token")
        if not payload.get("sub") or not payload.get("email"):
            raise ValueError("Invalid token payload")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")


def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Bearer access token required")
    payload = decode_access_token(authorization.split(" ", 1)[1].strip())
    with db_connect() as conn:
        row = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (int(payload["sub"]),)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="User account no longer exists")
    return public_user(row)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def normalize_email(email: str) -> str:
    value = email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    return value


@app.post("/auth/register", status_code=201, tags=["authentication"])
def register(payload: RegisterRequest):
    name = payload.name.strip()
    email = normalize_email(payload.email)
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Name must contain at least 2 characters")
    password_hash, password_salt = hash_password(payload.password)
    try:
        with db_connect() as conn:
            cursor = conn.execute(
                "INSERT INTO users (name, email, password_hash, password_salt) VALUES (?, ?, ?, ?)",
                (name, email, password_hash, password_salt),
            )
            conn.commit()
            row = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    return {"message": "Account created successfully. You can now sign in.", "user": public_user(row)}


@app.post("/auth/login", tags=["authentication"])
def login(payload: LoginRequest):
    email = normalize_email(payload.email)
    with db_connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email,)).fetchone()
    if row is None or not verify_password(payload.password, row["password_hash"], row["password_salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = public_user(row)
    return {
        "access_token": create_access_token(row["id"], row["email"]),
        "token_type": "bearer",
        "expires_in": TOKEN_EXPIRE_SECONDS,
        "user": user,
    }


@app.get("/auth/me", tags=["authentication"])
def auth_me(user=Depends(get_current_user)):
    return {"user": user}


def calculate_verdict(detections: list) -> dict:
    if not detections:
        return {"grade": "GRADE A", "verdict": "PASS", "summary": "100% CLEARANCE // ZERO DEFECTS", "action": "Coil passed metallurgical standards. Dispatched to automated strapping."}
    has_critical = any(d.get("defect") in ["crazing", "inclusion"] for d in detections)
    if has_critical or len(detections) >= 3:
        return {"grade": "GRADE C", "verdict": "REJECT", "summary": "CRITICAL ANOMALY ISOLATED", "action": "Coil marked with orange dye. Automated re-mill diversion executed."}
    return {"grade": "GRADE B", "verdict": "WARNING", "summary": "CONDITION B // SECONDARY REVIEW", "action": "Surface marks within tolerance. Routed to finishing stand for mechanical grinding."}


def execute_inference_on_file(image_path: Path, original_filename: str, conf_threshold: float = 0.15) -> dict:
    global model
    t0 = time.time()
    predictions = model.predict(source=str(image_path), imgsz=320, conf=max(0.01, min(0.99, conf_threshold)), iou=0.45, max_det=15, verbose=False)
    latency_ms = round((time.time() - t0) * 1000, 2)
    result = predictions[0]
    output_name = f"{uuid.uuid4().hex}_result.jpg"
    output_path = RESULT_DIR / output_name
    result.save(filename=str(output_path))
    detections = []
    for box in result.boxes:
        class_id = int(box.cls[0].item())
        detections.append({
            "defect": model.names[class_id],
            "confidence": round(float(box.conf[0].item()), 4),
            "box": [round(float(v), 2) for v in box.xyxy[0].tolist()],
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
            "health": "/health", "model_info": "/model-info",
            "single_predict": "/predict [POST]", "batch_predict": "/predict-batch [POST]",
            "register": "/auth/register [POST]", "login": "/auth/login [POST]", "current_user": "/auth/me [GET]",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None, "model_path": str(MODEL_PATH), "uptime_seconds": round(time.time() - startup_timestamp, 1), "defect_classes": list(model.names.values()) if model else [], "total_classes": len(model.names) if model else 0}


@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not initialized")
    return {"architecture": "YOLOv11 Defect Detector", "classes": model.names, "imgsz": 320, "default_conf": 0.15, "default_iou": 0.45, "model_path": str(MODEL_PATH)}


@app.post("/predict")
async def predict(file: UploadFile = File(...), conf: float = Form(0.15)):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model not found")
    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, BMP, or WEBP image")
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"
    try:
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return execute_inference_on_file(temp_path, file.filename or "specimen.jpg", conf)
    finally:
        await file.close()
        temp_path.unlink(missing_ok=True)


@app.post("/predict-batch")
async def predict_batch(files: List[UploadFile] = File(...), conf: float = Form(0.15)):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model not found")
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    results = []
    total_latency = 0.0
    passed_count = warning_count = rejected_count = total_defects = 0
    for upload in files:
        extension = Path(upload.filename or "").suffix.lower()
        if extension not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
            await upload.close()
            continue
        temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"
        try:
            with temp_path.open("wb") as buffer:
                shutil.copyfileobj(upload.file, buffer)
            item = execute_inference_on_file(temp_path, upload.filename or "specimen.jpg", conf)
            results.append(item)
            total_latency += item["latency_ms"]
            total_defects += item["count"]
            if item["verdict"] == "PASS": passed_count += 1
            elif item["verdict"] == "WARNING": warning_count += 1
            else: rejected_count += 1
        finally:
            await upload.close()
            temp_path.unlink(missing_ok=True)
    if not results:
        raise HTTPException(status_code=400, detail="No valid image files could be processed")
    return {
        "batch_id": f"BATCH-{uuid.uuid4().hex[:8].upper()}",
        "total_files": len(results), "passed_count": passed_count,
        "warning_count": warning_count, "rejected_count": rejected_count,
        "success_rate": round((passed_count / len(results)) * 100, 1),
        "total_defects": total_defects, "avg_latency_ms": round(total_latency / len(results), 2),
        "results": results,
    }
