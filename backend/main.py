import json
import requests
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Form
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import requests
import os
import logging
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime
import shutil
from pathlib import Path
from process_image import *
from agent import gpt_4o as llm


# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


# --- Configurations ---
IMAGES_DIR = Path("img")
IMAGES_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
MAX_IMAGES = 10  # Image per request limit
EXAM_KEY = Path("exam_key/prova 1.jpg")


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


def validate_student_data(data: dict) -> tuple:
    """Validate student data received in JSON format."""
    # Verify required fields
    if "student_name" not in data:
        return "Student name is required", None
    if "id" not in data:
        return "ID is required", None
    if "submission_time" not in data:
        return "Submission time is required", None
    # Extract fields
    nome_aluno = data.get("student_name")
    aluno_id = data.get("id")
    submission_time = data.get("submission_time")
    observacoes = data.get("observations")
    # Convert submission_time to datetime object
    if submission_time:
        try:
            submission_time = datetime.fromisoformat(submission_time)
        except ValueError:
            return "Format of submission time is invalid. Use ISO format (YYYY-MM-DDTHH:MM:SS)", None
    else:
        submission_time = datetime.now()
    # Return validated data
    dados_validados = {
        "student_name": nome_aluno,
        "id": aluno_id,
        "submission_time": str(submission_time),
        "observations": observacoes
    }
    return None, dados_validados


def validate_image(filename: str) -> bool:
    """Valida se a extensão do arquivo é permitida"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def get_unique_filename(original_filename: str) -> str:
    """Generate a unique name using timestamp"""
    ext = Path(original_filename).suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    return f"image_{timestamp}{ext}"


async def comparator(student_exam: str, exam_key: str) -> str:
    """generate response using the model"""
    if exam_key and len(exam_key.strip()) > 10:
        prompt = f"""You are a teacher and your task is to evaluate a student's answer based
on the provided exam key. You should provide a detailed evaluation, 
highlighting the strengths and weaknesses of the student's answer, and give a score based on 
the exam key(if available, if not, provide a general evaluation with a score between 0 and 100). 
If the student's answer is not related to the exam key or is off-topic,
please indicate that in your evaluation.

**Exam Key:**
{exam_key}

**student's exam Answers:** {student_exam}
Answer:"""
    else:
        prompt = f"""You are a teacher and your task is to evaluate a student's exam. 
You should provide a detailed evaluation, 
highlighting the strengths and weaknesses of the student's answer, and give a score based on 
the exam key(if available, if not, provide a general evaluation with a score between 0 and 100). 
If the student's answer is not related to the exam key or is off-topic,
please indicate that in your evaluation, and an answer cannot be validate if you don't know the question.

**student's exam:** {student_exam}
Answer:"""
    try:
        response = llm.invoke(prompt)
        print(f"{VERMELHO}[LOG]  LLM response: {response.content}{RESET}")
        return response.content
    except Exception as e:
        logger.error(f"🚫 Error calling LLM: {e}")
        return f"Erro: {str(e)}"


async def image_handler(file: UploadFile, student_id: str, submission_time: datetime, index: int) -> dict:
    """Handles the image upload and processing."""
    if not file.filename:
        return {"success": False, "error": "No filename provided"}
    if not validate_image(file.filename):
        return {"success": False, "error": f"Unsupported format. Use: {', '.join(ALLOWED_EXTENSIONS)}"}
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        return {"success": False, "error": f"Image too big. Max: {MAX_FILE_SIZE // (1024*1024)} MB"}
    # Generate unique filename
    unique_filename = get_unique_filename(file.filename)
    file_path = IMAGES_DIR / unique_filename
    # Save the file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    try:
        extracted_text = await process_image(str(file_path))
    except Exception as e:
        return {"success": False, "error": f"Error in OCR: {str(e)}"}
    return {
        "success": True,
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_path": str(file_path),
        "file_size": file_size,
        "file_size_mb": round(file_size / (1024 * 1024), 2),
        "uploaded_at": datetime.now().isoformat(),
        "content_text": extracted_text
    }


# --- Health Check ---
@app.get("/health")
async def health_check():
    status = {
        "status": "ok",
        "chromadb": "conectado",
        "timestamp": str(datetime.now()),
        "documentos": "0",
    }
    return status


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



@app.post("/images-upload")
async def upload_multiple_images(
    student_data: str = Form(..., description="Lista de dados dos alunos em formato JSON"),
    images: List[UploadFile] = File(
        ...,
        description="Lista de imagens para upload (máx. 10)"
    )
):
    """
    Endpoint for uploading multiple images with JSON data
    """
    print(f"\n\n\n{VERDE}[Student Data Received]{RESET} {student_data}\n")
    try:
        try:
            print(f"{VERDE}[Parsing Student Data]{RESET}\n")
            student_data_dict = json.loads(student_data)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON: {str(e)}"
            )
        # Validate student data and images
        print(f"{VERDE}[Validating Student Data]{RESET}\n")
        erro, dados_aluno = validate_student_data(student_data_dict)
        print(f"\n{VERDE} === [Validation Result] ==={RESET}\n{AZUL}{erro, dados_aluno}{RESET}\n")

        if erro:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=erro
            )
        if not images:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No images sent"
            )
        if len(images) > MAX_IMAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum number of images is {MAX_IMAGES}. Sent: {len(images)}"
            )
        resultados = []
        erros = []
        submission_time = dados_aluno["submission_time"]
        exam = ""
        for idx, file in enumerate(images):
            # Process each image
            resultado = await image_handler(
                file, 
                dados_aluno["id"], 
                submission_time, 
                idx
            )
            # If there was an error in processing, add to errors and continue
            if not resultado["success"]:
                erros.append({
                    "index": idx,
                    "filename": file.filename if file.filename else "unknown",
                    "error": resultado["error"]
                })
                continue
            exam = exam + resultado["content_text"] + "\n\n"
            resultados.append(resultado)
        print(f"\n\n\n{VERDE} === [Complete Exam for the student] ==={RESET}\n{AZUL}{exam}{RESET}\n")
        try:
            key_exam = await process_image(str(EXAM_KEY))
        except Exception as e:
            print(f"Error processing exam key: {str(e)}")
            key_exam = ""
        print(f"\n\n\n{VERDE} === [Exam Key] ==={RESET}\n{AZUL}{key_exam}{RESET}\n")
        evaluation = await comparator(exam, key_exam)
        print(f"\n\n\n{VERDE} === [Evaluation] ==={RESET}\n{AZUL}{evaluation}{RESET}\n")
        # Return the response with student data, summary, results, and errors
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "student_data": dados_aluno,
                "summary": {
                    "total_images": len(images),
                    "successful": len(resultados),
                    "errors": len(erros)
                },
                "results": resultados,
                "errors": erros if erros else None,
                "evaluation": evaluation,
                "nota": 15,
                "exam": exam
            }
        )    
    except HTTPException:
        raise
    except Exception as e:
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
