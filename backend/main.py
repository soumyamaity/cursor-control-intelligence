from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from typing import List, Dict, Optional
from datetime import datetime
import json
from pydantic import BaseModel

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
META_FILE = os.path.join(UPLOAD_DIR, 'meta.json')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper to load/save metadata

def load_meta() -> Dict[str, dict]:
    if os.path.exists(META_FILE):
        with open(META_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_meta(meta: Dict[str, dict]):
    with open(META_FILE, 'w', encoding='utf-8') as f:
        json.dump(meta, f)

app = FastAPI()

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

class DocumentUpdate(BaseModel):
    label: Optional[str] = None
    selected: Optional[bool] = None

@app.get("/")
def read_root():
    return {"message": "SRO Control Intelligence Backend is running."}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), label: Optional[str] = None, selected: Optional[bool] = False):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    meta = load_meta()
    meta[file.filename] = {
        "label": label or "",
        "selected": selected or False
    }
    save_meta(meta)
    return JSONResponse(content={"filename": file.filename, "status": "uploaded"})

@app.get("/documents")
def list_documents():
    files = []
    meta = load_meta()
    for filename in os.listdir(UPLOAD_DIR):
        path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(path) and filename != 'meta.json':
            stat = os.stat(path)
            files.append({
                "filename": filename,
                "size": stat.st_size,
                "upload_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "url": f"/uploads/{filename}",
                "label": meta.get(filename, {}).get("label", ""),
                "selected": meta.get(filename, {}).get("selected", False)
            })
    return files

@app.patch("/documents/{filename}")
def update_document(filename: str, update: DocumentUpdate):
    meta = load_meta()
    if filename not in meta:
        meta[filename] = {}
    if update.label is not None:
        meta[filename]["label"] = update.label
    if update.selected is not None:
        meta[filename]["selected"] = update.selected
    save_meta(meta)
    return {"status": "updated", "filename": filename, "label": meta[filename].get("label", "")}

@app.delete("/documents/{filename}")
def delete_document(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    meta = load_meta()
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(file_path)
    if filename in meta:
        del meta[filename]
        save_meta(meta)
    return {"status": "deleted", "filename": filename}

@app.get("/labels")
def get_labels():
    meta = load_meta()
    labels = set()
    for v in meta.values():
        if v.get("label"):
            labels.add(v["label"])
    return sorted(labels)

@app.post("/consolidate")
def consolidate_documents(filenames: List[str] = Body(...)):
    merged_content = ""
    for filename in filenames:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                merged_content += f"\n--- {filename} ---\n"
                merged_content += f.read()
        else:
            merged_content += f"\n--- {filename} (not found) ---\n"
    # Mock standardization: just return merged content for now
    return {"consolidated": merged_content.strip()} 