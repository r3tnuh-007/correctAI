import fitz
import asyncio
from PIL import Image
import base64
from io import BytesIO
from agent import gpt_4o as llm


# Códigos ANSI para cores
VERMELHO = "\033[91m"
VERDE = "\033[92m"
AZUL = "\033[94m"
RESET = "\033[0m"


def encode_pil_image(pil_image: Image) -> str:
    """Function that encodes a PIL image into base 64 string
    Args:
        pil_image (Image): PIL image to be converted
    Returns:
        str: image converted into base 64 string
    """
    buffered = BytesIO()
    pil_image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def generate_query(page: Image) -> str:
    """Function that generates the query for the document
    Args:page
        chunk (Image): page to be processed
    Returns:
        str: Query for the document
    """
    encoded_image = encode_pil_image(page)
    query = [
        {
            "role": "system",
            "content": [
                {"type": "text", "text": "Tu és um extrator. Extrai todo o texto na imagem. Retorna o texto, não incluas bounding boxes"},
            ]
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Extrai o texto da seguinte imagem:"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{encoded_image}"}}
            ]
        }
    ]
    return query


def queryExtractText(query):
        response = llm.invoke(query)
        return response

"""
def process_pdf(local_path: str) -> str:
    ""Function that converts some PDF pages to text
    Returns:
        list[Page]: List of the pages
    ""
    print(f"{local_path}: Processing")
    # Open the temporary PDF file with PyMuPDF
    MAX_PAGES = 5
    pages_queries = {}
    with fitz.open(local_path) as pdf_document:
        pages_index = [i for i in range(min(MAX_PAGES, len(pdf_document)))]
        for page_num in pages_index:
            page = pdf_document.load_page(page_num)
            # Improve resolution
            pix = page.get_pixmap(dpi=500)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            # img.save(f"debug/debug-{page_num}.png", "PNG")
            # This will return a list of strings corresponding to each chunk extracted text.
            page_query = generate_query(img)
            pages_queries[page_num] = queryExtractText(page_query)
            pages_queries[page_num].add_task()
    pages_text = generate_responses_text(pages_queries)
    print(f"{local_path}: Processing - DONE")
    return "\n".join([text for _, text in pages_text.items() if text is not None])
"""


async def process_image(img_pth: str):
    try:
        img = Image.open(img_pth)
        #img.show()
    except:
        print(f"{VERMELHO}[LOG (process_image)]\n{RESET}{AZUL}nao abriu a imagem: {img_pth}!{RESET}")
        return None
    page_query = generate_query(img)
    response = queryExtractText(page_query)
    print(f"{VERMELHO}[LOG (process_image)]\n{RESET}{AZUL}{response.content}{RESET}")
    return response.content