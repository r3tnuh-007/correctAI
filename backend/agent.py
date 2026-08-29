import os
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from dotenv import load_dotenv
load_dotenv()

print("Azure Endpoint:", os.getenv("AZURE_ENDPOINT"))
print("OpenAI API Version:", os.getenv("OPENAI_API_VERSION"))
print("GPT Model Name:", os.getenv("GPT_MODEL_NAME"))
print("GPT Deployment Name:", os.getenv("GPT_DEPLOYMENT_NAME"))

gpt_4o = AzureChatOpenAI(
    deployment_name = os.getenv("GPT_DEPLOYMENT_NAME"),
    model_name = os.getenv("GPT_MODEL_NAME"),
    azure_endpoint = os.getenv("AZURE_ENDPOINT"),
    openai_api_version = os.getenv("OPENAI_API_VERSION"),
    openai_api_key = os.getenv("OPENAI_API_KEY"),
    temperature = 0.1
)
