"""
@file generateEvaluationEmbedding.py
This file is responsible for generating the embeddings for on the fly course evaluations and storing them in MongoDB.

@Author: Sanjit Verma
"""
import logging
from pymongo import MongoClient
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()
class GenerateEvaluation:
    def __init__(self):
        self.OPENAI_KEY = os.getenv("OPENAI_API_KEY")
        self.MONGODB_URI = os.getenv('MONGODB_URI')
        self.db_name = os.getenv('MONGODB_DATABASE')
        self.user_collection_name = os.getenv('MONGODB_TEMPUSER')
        self.vector_index_name = os.getenv('MONGODB_VECTOR_INDEX_COURSEEVAL')

        self.client = MongoClient(self.MONGODB_URI)
        self.db = self.client[self.db_name]
        self.user_collection = self.db[self.user_collection_name]
        self.embedding_model = OpenAIEmbeddings(disallowed_special=())

    def generate_embeddings(self, session_id, documents):
        try:
            # Create embeddings for each document
            texts = [doc.page_content for doc in documents]  
            embeddings = self.embedding_model.embed_documents(texts)  

            # Update the specific user's document with new embeddings
            update_result = self.user_collection.update_one(
                {"session_id": session_id},
                {"$push": {"embeddings": {"$each": embeddings}}}
            )

            # Check if the update was successful
            if update_result.modified_count > 0:
                logger.info(f"Successfully updated embeddings for session ID: {session_id}")
                return True
            else:
                logger.warning(f"No document found with session ID: {session_id} or no update made")
                return False

        except Exception as e:
            logger.error(f"Failed to create or store embeddings: {str(e)}")
            return False
        