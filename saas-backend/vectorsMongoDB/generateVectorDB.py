'''
This file is responsible for generating the vector database from the text chunks. 

@Author: Sanjit Verma
'''
import os
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv
import loadDocuments
import logging
from tqdm import tqdm

# Load environment variables and logger
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Retrieve environment variables 
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MONGODB_URI = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DATABASE')
collection_name = os.getenv('MONGODB_VECTORS')
vector_search_idx = os.getenv('MONGODB_VECTOR_INDEX')

if not all([OPENAI_KEY, MONGODB_URI, db_name, collection_name, vector_search_idx]):
    logger.error("One or more environment variables are missing.")
    exit(1) 

# Connect to db
client = MongoClient(MONGODB_URI)
db = client[db_name]
collection = db[collection_name]

# Loading in the PDF and making some chunks
current_script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_script_dir) # navigate to the parent directory
pdf_directory = os.path.join(base_dir, 'pdfData') # navigate to the pdfData directory

# Suppress INFO logs from httpx
logging.getLogger('httpx').setLevel(logging.WARNING)

docs = loadDocuments.load_pdfs(pdf_directory)
print(f"Total chunks loaded: {len(docs)}\n")

# Initialize the vector store object and create the embeddings
try:
    with tqdm(total=len(docs), desc="Creating Embeddings") as progress_bar:
        vector_search = MongoDBAtlasVectorSearch.from_documents(
            documents=docs,
            embedding=OpenAIEmbeddings(disallowed_special=()),
            collection=collection,
            index_name=vector_search_idx,
        )
        progress_bar.update(len(docs))
    
    logger.info(f"Successfully created embeddings in {collection_name}")
    logger.info(""" ***IMPORTANT*** You can't query your index yet. You must create a vector search index in MongoDB's UI now. See Create the Atlas Vector Search Index in https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/""")
except Exception as e:
    logger.error(f"Failed to create embeddings: {str(e)}")




