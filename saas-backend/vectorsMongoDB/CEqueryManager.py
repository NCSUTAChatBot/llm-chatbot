'''
@file CEqueryManager.py
This file contains the code to perform vector search on a course evaluation MongoDB collection using the OpenAI embeddings and the MongoDB Atlas Vector Search.

IMPORTANT: Be sure to generate the embeddings using the generateVectorDB.py script before and be sure to intialize the MongoDB Atlas Vector Search index before running this script.

@author Sanjit Verma (skverma)
@modifiedby Dinesh Kannan (dkannan)

'''
import os
import logging
from typing import List
from pymongo import MongoClient
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from langfuse.callback import CallbackHandler
from tqdm import tqdm

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Environment variables
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MONGODB_URI = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DATABASE')
#collection_name = os.getenv('MONGODB_VECTORS_COURSEEVAL')
#vector_search_idx = os.getenv('MONGODB_VECTOR_INDEX_COURSEEVAL')

collection_name_eval = os.getenv('MONGODB_VECTORS_COURSEEVALUATION_DOCS')
vector_search_idx_eval = os.getenv('MONGODB_VECTOR_INDEX_TEMPUSER_DOC')

collection_name_website= os.getenv('MONGODB_VECTORS_COURSEWEBSITE')
vector_search_idx_website=os.getenv('MONGODB_VECTOR_INDEX_WEBSITE')

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
langfuse_handler = CallbackHandler()
langfuse_handler.auth_check()

#if db_name is None or collection_name is None:
    #raise ValueError("Database name or collection name is not set.")

if db_name is None or collection_name_website is None:
    raise ValueError("Database name or collection name is not set.")

db = client[db_name]
# collection = db[collection_name]
eval_collection = db[collection_name_eval]
website_collection=db[collection_name_website]

#if vector_search_idx is None:
    #raise ValueError("Vector search index for website is not set.")

if vector_search_idx_website is None:
    raise ValueError("Vector search index for website is not set.")

#Setup MongoDB Atlas Vector Search
# vector_search = MongoDBAtlasVectorSearch(
#     embedding=OpenAIEmbeddings(disallowed_special=()),
#     collection=collection_name,
#     index_name=vector_search_idx,
# )

vector_search_eval = MongoDBAtlasVectorSearch(
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=eval_collection,
    index_name=vector_search_idx_eval,
)

vector_search_website = MongoDBAtlasVectorSearch(
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=website_collection,
    index_name=vector_search_idx_website,
)

# Configure the retriever
# STEP 2

# retriever = vector_search.as_retriever(
#     search_type="similarity",
#     search_kwargs={"k": 10, "score_threshold": 0.8}
# )

retriever = vector_search_website.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 10, "score_threshold": 0.8}
)

# Define the template for the language model
template = """
Use the following pieces of context to answer the question at the end.
If context2 is empty or not provided, prioritize answering the question using context1.
If asked a question that is either in context1 or context2, answer the question using information from both contexts, ensuring that the feedback from context2 is addressed and improvement strategies from context1 are included when possible.
Do not repeat the exact feedback from context2 unless it's necessary to clarify.
If you don't know the answer or if it is not provided in the context, just say that you don't know, don't try to make up an answer.
If the answer is in the context, don't say "mentioned in the context."
If the user asks you to generate code, say that you cannot generate code.
If the user asks any question not related to course evaluations, say, "I'm sorry, I can't assist with that."
If the user asks what you can help with, say you are a Course Evaluation chatbot here to assist with course evaluation feedback.
If the user greets you, say hello back.

You are an assistant for a course evaluation chatbot. You have been provided with two major information sources to assist with the course evaluation feedback.

Use the below information as a reference, the below information provides context on how professors can improve their class:
{context1}

THE BELOW INFORMATION IS IMPORTANT AND CONTAINS THE EVALUATION OF THE COURSE:
{context2}

Previous conversation:
{history}

Question: {question}

Answer the above question using course evaluation feedback, and if needed, suggest actionable strategies or improvements based on the reference material provided.
"""

# Create a prompt template
custom_rag_prompt = PromptTemplate(
    template=template, input_variables=["context1", "context2", "question", "history"]
)
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
    {"context": retriever | format_docs, "question": RunnablePassthrough()} # STEP 4
    | custom_rag_prompt # STEP 5
    | llm # STEP 6
    | StrOutputParser() # STEP 7
)

# Function to process a query

def process_query(question, session_id, history: List[dict]):
    '''
    This function processes a query by invoking the RAG chain with the given question.
    It returns a generator that yields the response in chunks.
    The function iterates over stream_response and yields each chunk of the response
    '''
    if not isinstance(question, str):
        raise ValueError("The question must be a string.")
    
    history_formatted = ""
    for chat in history:
        chat_sender = chat.get("sender", "User")
        chat_message = chat.get("text", '-')
        history_formatted += f"{chat_sender}: {chat_message}\n"

    try:
        # Retrieve the relevant documents
        #Texbook vectors
        retriever_eval = vector_search_eval.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 10, "score_threshold": 0.8},
            pre_filter={"source": {"$eq": session_id}}
        )

        context_ce = format_docs(retriever_eval.invoke(question))
        context_tb = format_docs(retriever.invoke(question))
        
        rag_chain = (
            {
                "context1": lambda x: x.get('context1', ''),
                "context2": lambda x: x.get('context2', ''),
                "question": lambda x: x.get('question', ''),
                "history": lambda x: x.get('history', '')
            }
            | custom_rag_prompt
            | llm
            | StrOutputParser()
        )

        stream_response = rag_chain.stream({
            "question": question,
            "context1": context_tb,
            "context2": context_ce,
            "history": history
            }, config={"callbacks":[langfuse_handler]})


        for chunk in stream_response: #chunking allows user to see response as processed,  
            # formatted_chunk = format_response(chunk, context)
            yield chunk

    except Exception as e:
        raise RuntimeError(f"An error occurred while processing the query: {e}")

def make_query(input_text: str | None, session_id: str | None, history: List[dict] | None = None):
    '''
    This is the entry function that processes a given query from payload
    '''
    if input_text is None or not isinstance(input_text, str):
        raise ValueError("No valid input provided")

    if history is None:
        history = []

    try:
        response_generator = process_query(input_text, session_id, history)
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
