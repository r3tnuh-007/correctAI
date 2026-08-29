from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
import logging
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from dotenv import load_dotenv


# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


# --- Configurations ---
LLAMA_SERVER_URL = os.getenv("LLAMA_SERVER_URL", "http://127.0.0.1:8080/v1")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
TOP_K_RETRIEVALS = int(os.getenv("TOP_K_RETRIEVALS", "3"))


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


# --- Modelos de Dados ---
class QueryRequest(BaseModel):
    pergunta: str
    top_k: Optional[int] = TOP_K_RETRIEVALS

class QueryResponse(BaseModel):
    pergunta: str
    resposta: str
    fontes: List[str] = []


# --- CromaDB Initialization with a simplified embedding function ---
collection = None
try:
    import chromadb
    from sentence_transformers import SentenceTransformer
    # ‼️ SIMPLIFIED: Embedding function as a simple class
    class SimpleEmbedding:
        def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
            self.model = SentenceTransformer(model_name)
            self.model_name = model_name
            logger.info(f"🟢 Embedding model loadded: {model_name}")
        def __call__(self, texts):
            """Generate embeddings for the given text."""
            if not texts:
                return []
            # Convert to a float list
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
    # 🔧 Using the embedding function with the correct name
    embedding_fn = SimpleEmbedding()
    # Inicializing ChromaDB
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    # Create the collection without the embedding first
    try:
        # Try to obtain the existing collection
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
        logger.info(f"🟢 Collection '{COLLECTION_NAME}' founded.")
    except chromadb.errors.NotFoundError:
        # Create a new collection
        collection = chroma_client.create_collection(name=COLLECTION_NAME)
        logger.info(f"🟢 New collection '{COLLECTION_NAME}' created.")
    # Verificar documentos
    if collection:
        count = collection.count()
        logger.info(f"‼️ Collection has {count} documents.")
        if count == 0:
            logger.warning("⚠️ The collection is empty! Execute 'python ingest.py' to index documents.")
except Exception as e:
    logger.error(f"🚫 Error initializing ChromaDB: {e}")
    collection = None


# --- Search function ---
def buscar_contexto(pergunta: str, top_k: int = TOP_K_RETRIEVALS):
    """Search relevant documents on ChromaDB."""
    if collection is None:
        logger.warning("⚠️ ChromaDB not initialized.")
        return [], []
    try:
        # ‼️ Using the embedding function directly on search
        results = collection.query(
            query_texts=[pergunta],
            n_results=top_k
        )
        documentos = results['documents'][0] if results.get('documents') else []
        metadados = results['metadatas'][0] if results.get('metadatas') else []
        logger.info(f"🟢 Found {len(documentos)} relevant documents.")
        return documentos, metadados
    except Exception as e:
        logger.error(f"🚫 Erro na busca: {e}")
        return [], []


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


# --- Health Check ---
@app.get("/health")
async def health_check():
    status = {
        "status": "ok",
        "chromadb": "conectado" if collection else "desconectado",
        "documentos": collection.count() if collection else 0,
    }
    return status


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
