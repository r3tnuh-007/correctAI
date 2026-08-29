from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
import os
import logging
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime
import shutil
from pathlib import Path
from process_image import *


# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


# --- Configurations ---
LLAMA_SERVER_URL = os.getenv("LLAMA_SERVER_URL", "http://127.0.0.1:8080/v1")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
TOP_K_RETRIEVALS = int(os.getenv("TOP_K_RETRIEVALS", "3"))
IMAGES_DIR = Path("img")
IMAGES_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


app = FastAPI(title="correctAI Backend API", version="1.0.0")


# 🌕 CORS CONFIGURATION - Allows requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generating_response(pergunta: str, contexto: str) -> str:
    """Gera resposta usando o modelo com prompt bem formatado."""
    if contexto and len(contexto.strip()) > 10:
        prompt = f"""You are an assistant specializing in agriculture.
Use the context below to answer the question. If the answer is not in the context,
answer the question below using your general knowledge, but only if it is related with agriculture, 
otherwise just say "Seems like this question does not relate with agriculture".
or "I did not find anything on my knowledge base related to this question" without making up information.
Context:
{contexto}

Question: {pergunta}
Answer:"""
    else:
        prompt = f"""You are an assistant specializing in agriculture.
Answer the question below using your general knowledge, but only if it is related with agriculture, 
otherwise just say "Seems like this question does not relate with agriculture".

Question: {pergunta}
Answer:"""
    payload = {
        "prompt": prompt,
        "n_predict": 256,
        "temperature": 0.3,
        "top_p": 0.9,
        "stop": ["\n\n", "Pergunta:", "Contexto:"],
        "echo": False
    }
    try:
        response = requests.post(
            f"{LLAMA_SERVER_URL}/completions",
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        texto = result.get("choices", [{}])[0].get("text", "").strip()
        if "Resposta:" in texto:
            texto = texto.split("Resposta:")[-1].strip()
        return texto if texto else "Sorry, I could not generate an answer."
    except requests.exceptions.Timeout:
        logger.error("⏱️ Timeout calling llama-server")
        return "Sorry, response generation took so long."
    except requests.exceptions.ConnectionError:
        logger.error("⚠️ Conexion error with llama-server")
        return "Sorry, cannot connect to the model server right now."
    except requests.exceptions.RequestException as e:
        logger.error(f"🚫 Error calling llama-server: {e}")
        return f"Erro: {str(e)}"


"""
# --- submitting the images ---
@app.post("/perguntar", response_model=QueryResponse)
async def perguntar(request: QueryRequest):
    pergunta = request.pergunta.strip()
    top_k = request.top_k or TOP_K_RETRIEVALS
    if not pergunta or len(pergunta) < 3:
        raise HTTPException(status_code=400, detail="Pergunta muito curta.")
    try:
        docs, metadados = buscar_contexto(pergunta, top_k)
        contexto = "\n\n".join(docs) if docs else ""
        resposta = gerar_resposta(pergunta, contexto)
        fontes = []
        for meta in metadados:
            fonte = meta.get("source", "Fonte desconhecida")
            if fonte not in fontes:
                fontes.append(fonte)
        return QueryResponse(pergunta=pergunta, resposta=resposta, fontes=fontes)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚫 Erro inesperado: {e}")
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")
"""

# --- Health Check ---
@app.get("/health")
async def health_check():
    status = {
        "status": "ok",
        "chromadb": "conectado" if collection else "desconectado",
        "timestamp": datetime.now().isoformat(),
        "documentos": collection.count() if collection else 0,
    }
    return status




# ============================================
# FUNÇÕES AUXILIARES
# ============================================
def validate_image(filename: str) -> bool:
    """Valida se a extensão do arquivo é permitida"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def get_unique_filename(original_filename: str) -> str:
    """Generate a unique name using timestamp"""
    ext = Path(original_filename).suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    return f"image_{timestamp}{ext}"

# ============================================
# ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "API Working!!",
        "endpoints": {
            "/upload": "POST - Upload the image",
            "/health": "GET - Verify the health of the API",
            "list": "GET - List of all images uploaded"
        }
    }


@app.post("/upload")
async def upload_image(
    file: UploadFile = File(
        ...,
        description="Image file for download",
        example="image.jpg"
    )
):
    """
    Endpoint para upload de imagens
    - Recebe um arquivo de imagem
    - Valida formato e tamanho
    - Salva no diretório 'img/'
    - Retorna informações do arquivo salvo
    """
    try:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No image sent"
            )
        if not validate_image(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format. Use: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        file_size = 0
        file_content = await file.read()
        file_size = len(file_content)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image too big. Max: {MAX_FILE_SIZE // (1024*1024)} MB"
            )
        #Name generated
        unique_filename = get_unique_filename(file.filename)
        file_path = IMAGES_DIR / unique_filename
        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        content_text = await process_image(file_path)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Image saved successfully!",
                "data": {
                    "filename": unique_filename,
                    "original_filename": file.filename,
                    "file_path": str(file_path),
                    "file_size": file_size,
                    "file_size_mb": round(file_size / (1024 * 1024), 2),
                    "uploaded_at": datetime.now().isoformat(),
                    "content_text": content_text
                }
            }
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Trata erros inesperados
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing upload: {str(e)}"
        )


@app.get("/images")
async def list_images():
    """List all images saved at directory"""
    try:
        images = []
        for file_path in IMAGES_DIR.iterdir():
            if file_path.is_file():
                stat = file_path.stat()
                images.append({
                    "filename": file_path.name,
                    "size_bytes": stat.st_size,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
        return {
            "success": True,
            "count": len(images),
            "images": sorted(images, key=lambda x: x["modified"], reverse=True)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing the images: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
