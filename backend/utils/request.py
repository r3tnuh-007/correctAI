import requests

"""response = requests.post(
	"http://127.0.0.1:8000/perguntar",
	json={"pergunta": "define gardenning?"}
)
print(response.json())
"""


# client.py
import requests

# Upload de imagem
url = "http://10.0.2.15:8000/upload"
files = {"file": ("caligrafia 3.jpg", open("caligrafia 3.jpg", "rb"), "image/jpeg")}
response = requests.post(url, files=files)

if response.status_code == 200:
    data = response.json()
    print(f"🟢 Image saved: {data['data']['filename']}")
    print(f"⚠️ Path: {data['data']['file_path']}")
    print(f"🌕 Content:\n{data['data']['content_text']}")
else:
    print(f"❌ Error: {response.text}")

# Listar imagens
response = requests.get("http://localhost:8000/images")
print()
print()
print(response.json())
