import fitz
import asyncio
from PIL import Image
import base64
from io import BytesIO
from agent import gpt_4o as llm


class QueryExtractText:
    def __init__(self, query):
        self.query = query

        self.task = None
        self.coroutine_index = None
        self.response = None
        self.extracted = False

    def add_task(self):
        self.task = llm.ainvoke(self.query)

    def add_response(self, response):
        self.extracted = True
        if isinstance(response, dict):
            self.response = response.content
        else:
            self.response = response.dict()["content"]

        loop = 0
        while self.response == "" and loop < 5:
            loop += 1
            new_response = llm.invoke(self.query)
            self.response = new_response.content
