NAME = correctAI


all: $(NAME)


$(NAME):
	@python main.py 


install:
	@python3 -m venv .venv
	@source .venv/bin/activate
	@pip install -r requirements.txt
	@sleep 1.5s
	@clear
	@python main.py


clean_venv:
	@rm -fr .venv
	@deactivate


.PHONY: $(NAME) install clean_venv