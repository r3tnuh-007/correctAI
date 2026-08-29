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

async def generate_summary_from_process(payload):
    """
    Generates a summary for the entire validation process using an LLM.
    """
    prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", """You are an Orchestrator Agent. Your one and only task is to generate a narrative summary of a document validation process.
You MUST strictly adhere to the tone, structure, and narrative style of the example provided in the user prompt.
Your response MUST be from the first-person perspective of the orchestrator.
You MUST use Markdown for bolding on transition words (e.g., "**First,**", "**Next,**", "**Finally,**").
DO NOT list the documents or rules individually. Instead, you MUST describe the process in a high-level narrative, explaining the actions you took (e.g., "I invoked classification agents...", "I delegated the assessment...").
The output MUST be a single, well-written paragraph. It must be concise and professionally formatted."""),
            ("user", """Your response MUST follow the narrative style of this exact example:
"The user submitted a set of documents for validation in the mortgage application process. **First,** I automatically identified the type of each file using classification agents, with enough confidence to proceed without manual intervention. **Next,** I invoked extraction agents to pull key dates and other relevant fields from the images and PDFs, building a structured context that enhances accuracy in subsequent steps. With those data consolidated, I fed them into a natural-language rules engine that converts each guideline into formal logic, and I delegated the final assessment to specialized validation agents. **Finally,** I aggregated their findings, automatically prioritized any non-compliant items, and generated a single report for the user detailing the current status of all documents and recommended actions."

Now, use the following data to generate a new summary for the current process.
REMEMBER: Do not just list the data. Synthesize it into a narrative that mirrors the example's style and tone precisely, including the bold formatting for transition words.

**Process Data:**
- **Process Information:** {process_info}
- **Document Checklist Status:** {checklist_status}
- **Details of Documents Processed:** {documents_processed}
"""),
        ]
    )

    documents_summary = []
    for doc in payload.documents:
        documents_summary.append(f"""- Document: {doc.document}
  - Classification: {doc.classification}
  - Classification Rationale: {doc.classification_explanation or 'N/A'}
  - Extracted Data: {doc.extracted_data or 'N/A'}
  - Validation Result: {doc.validationResult}
  - Validation Rules Applied: {doc.validation_details['Rules'] if doc.validation_details and 'Rules' in doc.validation_details else 'N/A'}""")

    chain = prompt_template | gpt_4o

    response = await chain.ainvoke({
        "process_info": str(payload.processInfo),
        "checklist_status": str(payload.checklist),
        "documents_processed": "\n".join(documents_summary)
    })

    return response.content



