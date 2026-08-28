import torch
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image

# 1. Defina o caminho do modelo e a imagem
MODEL_PATH = "zai-org/GLM-OCR"  # O modelo será baixado do Hugging Face
IMAGE_PATH = "caminho/para/sua/imagem_manuscrita.jpg"  # Substitua pelo caminho da sua imagem

# 2. Carregue o processador e o modelo
print("Carregando o modelo... Isso pode levar alguns minutos na primeira execução.")
processor = AutoProcessor.from_pretrained(MODEL_PATH, trust_remote_code=True)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
    trust_remote_code=True
).eval()

# 3. Prepare a mensagem com a imagem
try:
    image = Image.open(IMAGE_PATH).convert("RGB")
except FileNotFoundError:
    print(f"Erro: Arquivo de imagem não encontrado em {IMAGE_PATH}")
    exit()

# O prompt específico para reconhecimento de texto é "Text Recognition:" [citation:2]
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": "Text Recognition:"}
        ]
    }
]

# 4. Processe a entrada
inputs = processor.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_dict=True,
    return_tensors="pt"
).to(model.device)

# Remove token_type_ids se presente para evitar erros
inputs.pop("token_type_ids", None)

# 5. Execute o modelo e gere o texto
print("Reconhecendo o texto...")
with torch.inference_mode():
    generated_ids = model.generate(**inputs, max_new_tokens=4096)  # Ajuste de tokens conforme necessário [citation:2]

# 6. Decodifique e exiba o resultado
output_text = processor.decode(
    generated_ids[0][inputs["input_ids"].shape[1]:],
    skip_special_tokens=True
)

print("\n--- Texto Reconhecido ---")
print(output_text)
