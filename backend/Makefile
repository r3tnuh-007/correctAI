NAME = correctAI


all: $(NAME)


$(NAME):
	@python main.py


install:
	@pip install -r requirements.txt
	@sleep 1.5s
	@clear
	@python main.py


clean_venv:
	@rm -fr .venv
	@deactivate


.PHONY: $(NAME) install clean_venv
