'''
@file queryManager.py
This file contains the code to perform vector search on a MongoDB collection using the OpenAI embeddings and the MongoDB Atlas Vector Search.
The code uses the langchain_openai, langchain_mongodb, langchain_core libraries to perform the vector search and retrieve the most relevant documents.

IMPORTANT: Be sure to generate the embeddings using the generateVectorDB.py script before and be sure to intialize the MongoDB Atlas Vector Search index before running this script.

@author Sanjit Verma (skverma)
@modified by Dinesh Kannan (dkannan)

'''
import os
import logging
from typing import List
from pymongo import MongoClient
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.schema.runnable import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from langfuse.callback import CallbackHandler
from tqdm import tqdm
from datetime import date


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Environment variables
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MONGODB_URI = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DATABASE')
collection_name = os.getenv('MONGODB_VECTORS')
vector_search_idx = os.getenv('MONGODB_VECTOR_INDEX')


# Connect to MongoDB
client = MongoClient(MONGODB_URI)
langfuse_handler = CallbackHandler()
langfuse_handler.auth_check()

if db_name is None or collection_name is None:
    raise ValueError("Database name or collection name is not set.")

db = client[db_name]
collection = db[collection_name]

if vector_search_idx is None:
    raise ValueError("Vector search index is not set.")

# Setup MongoDB Atlas Vector Search
vector_search = MongoDBAtlasVectorSearch(
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=collection,
    index_name=vector_search_idx,
)

# Configure the retriever
# STEP 2
retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 10, "score_threshold": 0.8}
)

# Define the template for the language model
template = """
Use the following pieces of context to answer the question at the end.
User's initial guess: {first_guess}

If asked a question not in the context, previous conversation, or additional context, do not answer it and say I'm sorry, I do not know the answer to that question.
If the answer is not in the context, previous conversation, or additional context, just say that you don't know, don't try to make up an answer.
If the user asks what you can help with, say you are a Teaching Assistant chatbot and can help with questions related to the course material.
If the user greets you, say hello back. If they provide their name remeber the name.
If asked to provide a code example, provide a code snippet that is relevant to the question from the textbook.
Please provide a detailed explanation and if applicable, give examples or historical context.
If a homework or practice problem question is asked, don't give the answer or solve it directly, instead help the student reach the answer.

Context:
{context}

Previous conversation:
{history}

Additional context:
Today is {date}

Question: {question}

Answer:
"""

# Create a prompt template
custom_rag_prompt = PromptTemplate(
    input_variables=["context", "question", "history", "first_guess"],
    template = template)

llm = ChatOpenAI(
    model="gpt-4o-mini",
)

# Function to format documents
# STEP 3
def format_docs(docs):
   return "\n\n".join(doc.page_content for doc in docs) 

def format_response(response, context):
    """
    This function formats the response by adding bullet points to list items.
    """
    lines = response.split('\n')
    formatted_response = []
    
    for line in lines:
        # Check if the line starts with a numbered list item
        if line.strip().startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.")):
            # Replace numbered list with bullet points
            line = line.replace(".", ".", 1)
            formatted_response.append(f"- {line.strip()}")
        else:
            formatted_response.append(line.strip())
    
    if "```" in context:
        code_snippets = context.split("```")
        for i in range(1, len(code_snippets), 2):
            formatted_response.append("\n\nHere is the relevant code snippet:\n")
            formatted_response.append(f"```{code_snippets[i]}```")


    return "\n".join(formatted_response)

# Define the retrieval and response chain
rag_chain = (
    {
        "context": lambda x: x.get("context", ""),
        "history": lambda x: x.get("history", ""),
        "question": lambda x: x.get("question", ""),
        "date": lambda x: x.get("date", ""),
        "first_guess": lambda x: x.get("first_guess", "")
    }
    | custom_rag_prompt # STEP 5
    | llm # STEP 6
    | StrOutputParser() # STEP 7
)

# Function to process a query

def process_query(question, history: List[dict],first_guess: str = ''):
    '''
    This function processes a query by invoking the RAG chain with the given question.
    It returns a generator that yields the response in chunks.
    The function iterates over stream_response and yields each chunk of the response
    '''
    if not isinstance(question, str):
        raise ValueError("The question must be a string.")

    try:
        # Retrieve the relevant documents
        context_docs = retriever.invoke(question)
        context = format_docs(context_docs)
        history_formatted = ""
        

        today = date.today()
        human_readable_date = today.strftime("%B %d, %Y")

        for chat in history:
            chat_sender = chat.get("sender", "User")
            chat_message = chat.get("text", '-')
            history_formatted += f"{chat_sender}: {chat_message}\n"

        stream_response = rag_chain.stream(
                    {
                        "question" : question,
                        "context": context,
                        "history": history_formatted,
                        "date": human_readable_date,
                        "first_guess": first_guess
                    }, 
            config={"callbacks":[langfuse_handler]})

        for chunk in stream_response: #chunking allows user to see response as processed,  
            yield chunk

    except Exception as e:
        raise RuntimeError(f"An error occurred while processing the query: {e}")

def make_query(input_text: str | None, history: List[dict] | None = None, first_guess: str | None = ''):
    '''
    This is the entry function that processes a given query from payload
    '''
    if input_text is None or not isinstance(input_text, str):
        raise ValueError("No valid input provided")

    if history is None:
        history = []

    try:
        response_generator = process_query(input_text, history, first_guess)
        return response_generator
    except Exception as e:
        raise RuntimeError(f"An error occurred while processing the query: {e}")

'''
STEPS THAT OCCUR IN THE BACKGROUND when .invoke() is called on the rag_chain instance 
Please email me skverma@ncsu.edu if you have any further questions

Step 1 INVOCATION: Invocation of rag chain with the question. Method call triggers the chains operation starting with the retriever

Step 2 RETRIEVER FUNC: The retriever retrieves the most relevant documents from the MongoDB collection based on the question. Converts question into embedding and 
uses this to perform a similarity search in the database, retrieving documents that are contextually similar to the query.

Step 3 DOC FORMATTING: The retrieved documents are passed to the next step in the chain, which is the format_docs function. This function formats the documents 
into a single string with each document separated by double newlines (basically processing output from retriever)

Step 4 CONTEXT ASSEMBLY: The formatted documents and the question are passed to the custom_rag_prompt function to from complete context. RunnablePassthrough 
is highly important here to make sure no mods occur to question. 

Step 5 PROMPT TEMPLATE: template recieves step 4 and fills it out where context is replaced by the output from format_docs and question is replaced by the output from RunnablePasst

Step 6 LANGUAGE MODEL: templated string are passed to the language model, which generates a response based on the input.model generates a response based on the input prompt, 
considering the provided context and directly addressing the query.

Step 7 POST PARSE: Takes output and converts it into a string. If it is already a string, return it otherwise if it is a structured object, convert it to a string.

'''
