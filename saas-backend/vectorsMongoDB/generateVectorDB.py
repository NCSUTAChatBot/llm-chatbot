'''
This file is responsible for generating the vector database from the text chunks. 

Needs to be run once to load the DB with embeddings and text chunks.

Run this script from the command line using python generateVectorDB.py

***IMPORTANT*** You can't query your index yet. You must create a vector search index in MongoDB's UI now. 
See Create the Atlas Vector Search Index in https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/"""

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

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Retrieve environment variables 
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MONGODB_URI = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DATABASE')

vector_collection_vars = {key: value for key, value in os.environ.items() if 'MONGODB_VECTORS' in key and value.strip()}
vector_index_vars = {key: value for key, value in os.environ.items() if 'MONGODB_VECTOR_INDEX' in key and value.strip()}

if not all([OPENAI_KEY, MONGODB_URI, db_name, vector_collection_vars, vector_index_vars]):
    logger.error("One or more environment variables are missing or empty.")
    exit(1)

def display_menu():
    print("1) Generate Vector DB")
    print("2) Exit")
    choice = input("Select an option: ")
    return choice

def select_collection_name():
    print("\nSelect collection name:")
    for idx, (key, name) in enumerate(vector_collection_vars.items(), start=1):
        print(f"{idx}) {name}")
    selected_idx = int(input("Enter your choice: ")) - 1
    selected_key = list(vector_collection_vars.keys())[selected_idx]
    return vector_collection_vars[selected_key]

def select_vector_search_idx():
    print("\nSelect vector search index:")
    for idx, (key, name) in enumerate(vector_index_vars.items(), start=1):
        print(f"{idx}) {name}")
    selected_idx = int(input("Enter your choice: ")) - 1
    selected_key = list(vector_index_vars.keys())[selected_idx]
    return vector_index_vars[selected_key]

# Menu loop
while True:
    choice = display_menu()
    if choice == '1':
        collection_name = select_collection_name()
        vector_search_idx = select_vector_search_idx()
        break
    elif choice == '2':
        print("Exiting...")
        exit(0)
    else:
        print("Invalid option. Please try again.")

# Connect to db
client = MongoClient(MONGODB_URI)
db = client[db_name]
collection = db[collection_name]

# Loading in the PDF and making some chunks
current_script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_script_dir)  # navigate to the parent directory
pdf_directory = os.path.join(base_dir, 'pdfData')  # navigate to the pdfData directory

# suppress INFO logs from httpx, suppress not critical pdf reader formatting warnings
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('pypdf._reader').setLevel(logging.ERROR)

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

    print("\n")
    logger.info(f"Successfully created embeddings in {collection_name}")
    logger.info("""***IMPORTANT*** You can't query your index yet. You must create a vector search index in MongoDB's UI now. See Create the Atlas Vector Search Index in https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/""")
except Exception as e:
    logger.error(f"Failed to create embeddings: {str(e)}")
