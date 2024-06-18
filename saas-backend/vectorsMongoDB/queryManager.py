'''
@file queryManager.py
This file contains the code to perform vector search on a MongoDB collection using the OpenAI embeddings and the MongoDB Atlas Vector Search.
The code uses the langchain_openai, langchain_mongodb, langchain_core libraries to perform the vector search and retrieve the most relevant documents.

IMPORTANT: Be sure to generate the embeddings using tghe generateVectorDB.py script before and be sure to intialize the MongoDB Atlas Vector Search index before running this script.

@author Sanjit Verma (skverma)

'''
import os
import logging
from pymongo import MongoClient
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

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
    search_kwargs={"k": 5, "score_threshold": 0.75}
)

# Define the template for the language model
template = """
Use the following pieces of context to answer the question at the end.
If asked a question not in the context, do not answer it and say I'm sorry, I do not know the answer to that question.
If you don't know the answer or if it is not provided in the context, just say that you don't know, don't try to make up an answer.
If the answer is in the context, dont say mentioned in the context.
If the user asks you to generate code, say that you cannot generate code.
If the user asks what you can help with, say you are a Teaching Assistant chatbot and can help with questions related to the course material.
If the user greets you, say hello back.
Please provide a detailed explanation and if applicable, give examples or historical context.
If a homework or practice problem question is asked, don't give the answer or solve it directly, instead help the student reach the answer. 
{context}
Question: {question}
"""

# Create a prompt template
custom_rag_prompt = PromptTemplate.from_template(template)
llm = ChatOpenAI()

# Function to format documents
# STEP 3
def format_docs(docs):
   return "\n\n".join(doc.page_content for doc in docs) 

# Define the retrieval and response chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()} # STEP 4
    | custom_rag_prompt # STEP 5
    | llm # STEP 6
    | StrOutputParser() # STEP 7
)

# Function to process a query
def process_query(question):
    # STEP 1
    response = rag_chain.invoke(question)
    return response


def make_query(input_text: str | None) -> str:
    """
    Wrapper function to handle the processing of user queries using the MongoDB-backed language model.
    """
    if input_text is None:
        raise ValueError("No input provided")

    try:
        # Pass the question directly to the process_query function
        response = process_query(input_text)
        return response
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