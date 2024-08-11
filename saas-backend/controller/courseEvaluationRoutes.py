'''
@file courseEvaluationRoutes.py
This file contains the routes for the course evaluation API
@author Sanjit Verma (skverma)
'''

from flask import Blueprint, request, jsonify, send_file, stream_with_context, Response, session
import pandas as pd
import secrets
import json
from json import JSONDecodeError 
from langchain_community.vectorstores import FAISS         
from langchain_openai import OpenAIEmbeddings    
from flask import current_app
from flask_cors import CORS
from langchain_openai import OpenAIEmbeddings              
from langchain_community.llms import OpenAI                 
from langchain.chains import ConversationalRetrievalChain  
from vectorsMongoDB.loadEvaluation import LoadEvaluation
from vectorsMongoDB.generateEvaluationEmbedding import GenerateEvaluation
import vectorsMongoDB.CEqueryManager as queryManager 
import time
from dotenv import load_dotenv
import os
from pymongo import MongoClient
# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_TEMPUSER = os.getenv('MONGODB_TEMPUSER')
MONGODB_DB = os.getenv('MONGODB_DATABASE')
from bson import ObjectId

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
user_collection = db[MONGODB_TEMPUSER]
eval_bp = Blueprint('courseEvaluation', __name__)
CORS(eval_bp, resources={r"/*": {"origins": "http://localhost:3000"}})
sessions = {}

class Document:
    def __init__(self, text, embedding=None):
        self.text = text
        self.embedding = embedding
        self.page_content = text
        self.metadata = {}  

@eval_bp.route('/start_session', methods=['GET'])
def start_session():
    session_id = secrets.token_urlsafe(16)
    user = {
        '_id': ObjectId(),
        'session_id': session_id,
        'embeddings': []  
    }
    user_collection.insert_one(user)
    
    sessions[session_id] = {'vector_store': None}  
    return jsonify({'session_id': session_id})


@eval_bp.route('/upload', methods=['POST'])
def upload_file():
    session_id = request.form.get('session_id')
    file = request.files.get('file')

    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400
    if not file:
        return jsonify({"error": "File is required"}), 400


    file_type = file.filename.rsplit('.', 1)[-1].lower()
    loader = LoadEvaluation()
    with file.stream:
        documents = loader.load_from_stream(file.stream, file_type)

    if not documents:
        return jsonify({"error": "No documents were processed"}), 500

    generator = GenerateEvaluation()
    success = generator.generate_embeddings(session_id, documents)

    if success:
        return jsonify({"message": "Embeddings successfully created"}), 200
    else:
        return jsonify({"error": "Failed to generate embeddings"}), 500


@eval_bp.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    if request.method == 'OPTIONS':
        return '', 200
    
    input_data = request.json
    if not input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    question = input_data['question']

    def generate_response():
        full_response = "" 
        try:
            for chunk in queryManager.make_query(question):
                try:
                    chunk_data = json.loads(chunk)
                except JSONDecodeError:
                    chunk_data = chunk 

                if isinstance(chunk_data, dict) and "choices" in chunk_data:
                    for choice in chunk_data["choices"]:
                        if "text" in choice:
                            bot_response_text = choice["text"]
                            yield f"{bot_response_text}"
                            full_response += bot_response_text  
                            time.sleep(0.01) # generator needs a short delay to process each chunk in  otherwise generator will process too quickly
                else:
                    yield f"{chunk}"
                    full_response += chunk  
                    time.sleep(0.01)

        except Exception as e:
            yield f"Error: {str(e)}"
            return
    
    return Response(stream_with_context(generate_response()), content_type='text/plain')

