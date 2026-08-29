from llm import gpt_4o as llm
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
import json
from typing import List, Dict, Any
from database.rules import get_rules_for_context
from common.models import Document

class Result(BaseModel):
    rationale: str = Field(description="The reasoning behind the validation decision.")
    validation: bool = Field(description="The validation result for the document.")

SYSTEM_PROMPT = """You are an expert in document validation. Your task is to validate the provided rule using the extracted data from the document, related documents, and the system's information.
You must provide a clear rationale for your validation decision.
When you are comparing names of companies, ensure that you consider variations in capitalization, abbreviations, and common synonyms.
Only compare what is necessary for the validation of the rule, do not include unnecessary information in your response.
"""

def generate_validation_queries(current_doc: Dict[str, Any], system_data: Dict[str, Any], document_definition: Document, context: Dict[str, Any], all_documents: List[Dict[str, Any]]) -> list:
    """
    Generates a validation query for the specified document type and extracted data.
    """
    process_id = context.get('process_id')
    product_id = context.get('product_id')
    guarantee_id = context.get('guarantee_id', 0)
    document_id = document_definition.id

    validation_rules = get_rules_for_context(process_id, product_id, guarantee_id, document_id)

    if not validation_rules:
        return []

    queries = []
    parser = PydanticOutputParser(pydantic_object=Result)

    for rule in validation_rules:
        # Find data from related documents
        related_docs_data = {}
        if rule.related_documents:
            related_docs_data = {}
            for related_doc_model in rule.related_documents:
                for doc in all_documents:
                    if doc.get('classification') == related_doc_model.name and 'extracted_data' in doc:
                        if related_doc_model.name not in related_docs_data:
                            related_docs_data[related_doc_model.name] = []
                        related_docs_data[related_doc_model.name].append(doc['extracted_data'])

        # Build the prompt content
        prompt_content = [
            {"type": "text", "text": SYSTEM_PROMPT},
            {"type": "text", "text": parser.get_format_instructions()},
            {"type": "text", "text": "Rule to Validate:"},
            {"type": "text", "text": rule.rule_description},
            {"type": "text", "text": f"Extracted Data from current document ({document_definition.name}): {current_doc.get('extracted_data', {})}"},
            {"type": "text", "text": f"System Data: {system_data}"}
        ]

        if related_docs_data:
            print("--------------------\n")
            print("Related documents data found for validation:", related_docs_data)
            print("--------------------\n")
            prompt_content.append({"type": "text", "text": f"Extracted Data from related documents: {related_docs_data}"})

        queries.append({
            "role": "user",
            "content": prompt_content
        })

    return queries
