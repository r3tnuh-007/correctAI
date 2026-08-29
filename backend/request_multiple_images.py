import json
import requests




url = "http://10.0.2.15:8000/images-upload"
# Dados do aluno em JSON
student_data = {
    "student_name": "Antero Luis",
    "id": "2024001",
    "submission_time": "2026-08-29T10:30:00",
    "observations": "Aluno com bom desempenho",
    "class": "A",
    "subject": "Matematica"
}
# Lista de arquivos
files = [
    ("images", ("foto1.jpg", open("caligrafia 1.jpeg", "rb"), "image/jpeg")),
    ("images", ("foto2.png", open("caligrafia 2.jpg", "rb"), "image/jpg")),
    ("images", ("foto3.jpg", open("caligrafia 3.jpg", "rb"), "image/jpg"))
]
# Envia a requisição
response = requests.post(
    url,
    data={"student_data": json.dumps(student_data)},
    files=files
)
print("=== RESULTADO FORM DATA ===")
print(json.dumps(response.json(), indent=2, default=str))
