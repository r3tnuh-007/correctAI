# correctAI
correctAI will be our application powered by AI for the Hackathon Prometheus August AI Challenge
# Exam correction system - correctAI 🌕
## Project Info

**Nome:** ***correctAI*** 🌕

**Developers:** ***Antero F. Luís(r3tnuh-007), Bruno Sebastião (bsebasti9)*** 🥶

**Architecture Pattern:** ***MVC - Model(Midleware) View Controller ⚠️***

**Description:** _Uma plataforma que ajuda os usuários a localizarem alguém perdido por meio de reconhecimento <br>
facial. Se alguém desapareceu, na vida real, o usuário vai na plataforma e publica uma foto da pessoa desaparecida<br>
e as suas informações de contacto. Se alguém encontrar alguém perdido que por algum motivo não consiga se comunicar, <br>
ou os responsáveis por essa pessoa não aparecem basta tirar uma foto da pessoa e colocar ela na categoria de encontrada, <br>
o sistema por meio de reconhecimento facial fará o match do rosto, caso o rosto perdido esteja na base de dados de <br>
rostos encontrados notifica os usuários._


## Instalation
```bash
cd backend
python3 -m venv .venv
source .venv/bin/active
pip install -r requirements.txt
python3 main.py
```


## Uvicorn Instrutions

### Development mode (with auto reload)
```bash
# Reload automatically some file changes
uvicorn main:app --reload

# Specifying the host and the port
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# With more log details
uvicorn main:app --reload --log-level debug
```
### Explanation
```text
uvicorn main:app
         │    │
         │    └─ Variable's name/FastAPI instancy inside the file
         └────── Python filename (without the .py)
```


### Performance parameters



## Emojis that will be used on the project

``` bash
🫥☠️👾🥶🥵🌍🌕💤🚫⛔⁉️‼️♊🇦🇴🟢⚠️❌😔😞😇
```
