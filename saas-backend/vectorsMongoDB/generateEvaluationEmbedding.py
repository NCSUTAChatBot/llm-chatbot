"""
@file generateEvaluationEmbedding.py
This file is responsible for generating the embeddings for on the fly course evaluations and storing them in MongoDB.

@Author: Sanjit Verma
"""
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pymongo import MongoClient
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
import os
import datetime
import time
from langchain.schema import Document


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()
class GenerateEvaluation:
    def __init__(self):
        self.OPENAI_KEY = os.getenv("OPENAI_API_KEY")
        self.MONGODB_URI = os.getenv('MONGODB_URI')
        self.db_name = os.getenv('MONGODB_DATABASE')
        self.user_collection_name = os.getenv('MONGODB_VECTORS_COURSEEVALUATION_DOCS')
        self.vector_index_name = os.getenv('MONGODB_VECTOR_INDEX_TEMPUSER_DOC')
        
        self.client = MongoClient(self.MONGODB_URI)
        # self.db = self.client[self.db_name]
        # self.user_collection = self.db[self.user_collection_name]
        self.embedding_model = OpenAIEmbeddings(disallowed_special=())
        self.MONGODB_COLLECTION = self.client[self.db_name][self.user_collection_name]

        self.vector_store = MongoDBAtlasVectorSearch(
            collection=self.MONGODB_COLLECTION,
            embedding=self.embedding_model,
            index_name=self.vector_index_name,
            relevance_score_fn="cosine",
        )

    def generate_embeddings(self, session_id, documents):
        try:
            if not documents:
                logger.warning("No documents provided for embedding generation.")
                return False

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=2000,
                chunk_overlap=20,
                length_function=len,
                is_separator_regex=False,
            )

            all_docs = []
            for doc in documents:
                # Split each document's content
                splits = text_splitter.split_text(doc.page_content)
                for split_content in splits:
                    new_doc = Document(
                        page_content=split_content,
                        metadata={
                            "source": session_id,
                            "createdAt": datetime.datetime.utcnow()
                        }
                    )
                    all_docs.append(new_doc)

            self.vector_store.add_documents(documents=all_docs)
            logger.info(f"Embeddings stored for session {session_id}")

            return True

        except Exception as e:
            logger.exception(f"Failed to create or store embeddings: {str(e)}")
            return False

        