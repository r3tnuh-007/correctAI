NAME = correctAI


all: $(NAME)


$(NAME):
	@cd backend
	@python main.py 


install:
	@cd backend
	@python3 -m venv .venv
	@source .venv/bin/activate
	@pip install -r requirements.txt
	@clear
	@python main.py


clean_venv:
	rm -fr backend/.venv


.PHONY: $(NAME) install clean_venv