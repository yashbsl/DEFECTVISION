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

# Expected structure: backend/main.py and backend/models/best.pt
BASE_DIR = Path(__file__).resolve().parent
ROOT = BASE_DIR.parent
MODEL_PATH = Path(os.getenv("DEFECTVISION_MODEL_PATH", str(BASE_DIR / "models" / "best.pt"))).expanduser()
UPLOAD_DIR = Path(os.getenv("DEFECTVISION_UPLOAD_DIR", str(ROOT / "outputs" / "web_uploads"))).expanduser()
RESULT_DIR = Path(os.getenv("DEFECTVISION_RESULT_DIR", str(ROOT / "outputs" / "web_results"))).expanduser()
AUTH_DB_PATH = Path(os.getenv("DEFECTVISION_AUTH_DB_PATH", str(ROOT / "outputs" / "defectvision_users.db"))).expanduser()

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)
AUTH_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.getenv("DEFECTVISION_SECRET_KEY", "dev-only-change-this-secret-before-deployment")
if len(SECRET_KEY) < 32:
    print("[WARN] Set DEFECTVISION_SECRET_KEY to a random value of at least 32 characters for deployment.")
TOKEN_EXPIRE_SECONDS = 60 * 60 * 8
PBKDF2_ITERATIONS = 310_000
MAX_UPLOAD_BYTES = int(os.getenv("DEFECTVISION_MAX_UPLOAD_BYTES", str(12 * 1024 * 1024)))

app = FastAPI(
    title="Steel Surface Defect Detection API",
    description="DefectVision API for NEU-DET surface defect detection and operator authentication",
    version="2.2.0",
)

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    item.strip().rstrip("/")
    for item in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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
        conn.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"""
        )
        conn.commit()


@app.on_event("startup")
def startup():
    global model
    init_auth_db()
    if MODEL_PATH.is_file():
        try:
            model = YOLO(str(MODEL_PATH))
            print(f"[READY] YOLO model loaded from: {MODEL_PATH}")
        except Exception as exc:
            model = None
            print(f"[ERROR] Could not load YOLO model at {MODEL_PATH}: {exc}")
    else:
        model = None
        print(f"[WARN] Model file not found: {MODEL_PATH}")
        print("[WARN] Put best.pt in backend/models/best.pt or set DEFECTVISION_MODEL_PATH.")


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
    head = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    body = b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{head}.{body}".encode("ascii")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{head}.{body}.{b64url(signature)}"


def decode_access_token(token: str):
    try:
        head, body, signature = token.split(".")
        header_data = json.loads(base64.urlsafe_b64decode(head + "=" * (-len(head) % 4)))
        if header_data.get("alg") != "HS256":
            raise ValueError("Unsupported token algorithm")
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
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid access token")
    with db_connect() as conn:
        row = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
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
            row = conn.execute(
                "SELECT id, name, email, created_at FROM users WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
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
    return {
        "access_token": create_access_token(row["id"], row["email"]),
        "token_type": "bearer",
        "expires_in": TOKEN_EXPIRE_SECONDS,
        "user": public_user(row),
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
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model is not available")
    start_time = time.time()
    predictions = model.predict(
        source=str(image_path), imgsz=320,
        conf=max(0.01, min(0.99, conf_threshold)), iou=0.45, max_det=15, verbose=False,
    )
    latency_ms = round((time.time() - start_time) * 1000, 2)
    result = predictions[0]
    output_name = f"{uuid.uuid4().hex}_result.jpg"
    result.save(filename=str(RESULT_DIR / output_name))
    detections = []
    for box in result.boxes:
        class_id = int(box.cls[0].item())
        names = model.names
        if isinstance(names, dict):
            defect_name = names.get(class_id, str(class_id))
        else:
            defect_name = names[class_id] if 0 <= class_id < len(names) else str(class_id)
        detections.append({
            "defect": defect_name,
            "confidence": round(float(box.conf[0].item()), 4),
            "box": [round(float(value), 2) for value in box.xyxy[0].tolist()],
        })
    verdict = calculate_verdict(detections)
    return {
        "filename": original_filename,
        "count": len(detections),
        "detections": detections,
        "result_image": f"/results/{output_name}",
        "latency_ms": latency_ms,
        "grade": verdict["grade"],
        "verdict": verdict["verdict"],
        "verdict_summary": verdict["summary"],
        "recommended_action": verdict["action"],
    }


async def save_upload(upload: UploadFile) -> Path:
    extension = Path(upload.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
        await upload.close()
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, BMP, or WEBP image")
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"
    total_bytes = 0
    try:
        with temp_path.open("wb") as destination:
            while True:
                chunk = await upload.read(1024 * 1024)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail=f"Image exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB upload limit")
                destination.write(chunk)
        if total_bytes == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        return temp_path
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()


@app.get("/")
def home():
    return {
        "service": "DefectVision Production Vision API",
        "status": "online",
        "model_loaded": model is not None,
        "endpoints": {
            "health": "/health", "model_info": "/model-info",
            "single_predict": "/predict [POST]", "batch_predict": "/predict-batch [POST]",
            "register": "/auth/register [POST]", "login": "/auth/login [POST]",
            "current_user": "/auth/me [GET]",
        },
    }


@app.get("/health")
def health():
    names = model.names if model is not None else {}
    classes = list(names.values()) if isinstance(names, dict) else list(names) if names else []
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "model_file_exists": MODEL_PATH.is_file(),
        "uptime_seconds": round(time.time() - startup_timestamp, 1),
        "defect_classes": classes,
        "total_classes": len(classes),
    }


@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not initialized")
    names = model.names
    classes = names if isinstance(names, dict) else {index: name for index, name in enumerate(names)}
    return {"architecture": "YOLO defect detector", "classes": classes, "imgsz": 320, "default_conf": 0.15, "default_iou": 0.45, "model_path": str(MODEL_PATH)}


@app.post("/predict")
async def predict(file: UploadFile = File(...), conf: float = Form(0.15)):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model not found or failed to load")
    temp_path = await save_upload(file)
    try:
        return execute_inference_on_file(temp_path, file.filename or "specimen.jpg", conf)
    finally:
        temp_path.unlink(missing_ok=True)


@app.post("/predict-batch")
async def predict_batch(files: List[UploadFile] = File(...), conf: float = Form(0.15)):
    if model is None:
        raise HTTPException(status_code=503, detail="Trained model not found or failed to load")
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    results = []
    total_latency = 0.0
    passed_count = warning_count = rejected_count = total_defects = 0
    for upload in files:
        temp_path = None
        try:
            temp_path = await save_upload(upload)
            item = execute_inference_on_file(temp_path, upload.filename or "specimen.jpg", conf)
            results.append(item)
            total_latency += item["latency_ms"]
            total_defects += item["count"]
            if item["verdict"] == "PASS":
                passed_count += 1
            elif item["verdict"] == "WARNING":
                warning_count += 1
            else:
                rejected_count += 1
        except HTTPException as exc:
            if exc.status_code in (400, 413):
                continue
            raise
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)
    if not results:
        raise HTTPException(status_code=400, detail="No valid image files could be processed")
    total_files = len(results)
    return {
        "batch_id": f"BATCH-{uuid.uuid4().hex[:8].upper()}",
        "total_files": total_files,
        "passed_count": passed_count,
        "warning_count": warning_count,
        "rejected_count": rejected_count,
        "success_rate": round((passed_count / total_files) * 100, 1),
        "total_defects": total_defects,
        "avg_latency_ms": round(total_latency / total_files, 2),
        "results": results,
    }
