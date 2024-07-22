'''
@file courseEvaluationRoutes.py
This file contains the routes for the course evaluation API
@author Sanjit Verma (skverma)
'''

from flask import Blueprint, request, jsonify, send_file, stream_with_context, Response, session
import pandas as pd
import secrets
from langchain_community.vectorstores import FAISS         
from langchain_openai import OpenAIEmbeddings    
from flask import current_app
from flask_cors import CORS
from langchain_openai import OpenAIEmbeddings              
from langchain_community.llms import OpenAI                 
from langchain.chains import ConversationalRetrievalChain   
import time

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
    sessions[session_id] = {'chat_history': [], 'vector_store': None}
    return jsonify({'session_id': session_id})

@eval_bp.route('/upload', methods=['POST'])
def upload_file():
    session_id = request.form.get('session_id')
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    print(f"Session ID: {session_id}") 
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "File is required"}), 400
    
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file.stream)
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(file.stream)
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    texts = df.to_string(header=True, index=False).split('\n')
    try:
        embedding_model = OpenAIEmbeddings()
        documents = [Document(text, embedding) for text, embedding in zip(texts, embedding_model)]
        
        vector_store = FAISS.from_documents(documents, embedding_model)
        sessions[session_id]['vector_store'] = vector_store
        print(f"Vector store successfully created and stored for session: {session_id}")
        print(f"Vector store contents: {vector_store}")
        
    except Exception as e:
        return jsonify({"error": "Failed to create vector store: " + str(e)}), 500

    return jsonify({"message": "File processed successfully", "session_id": session_id, "filename": file.filename})


@eval_bp.route('/ask', methods=['POST'])
def ask():
    input_data = request.json
    session_id = input_data.get('session_id')
    question = input_data.get('question')
    print(f"Session ID: {session_id}, Question: {question}")

    session_data = sessions.get(session_id)
    if not session_data:
        return jsonify({"error": "Session not found"}), 404

    vector_store = session_data['vector_store']
    chat_history = session_data['chat_history']

    formatted_chat_history = [{"role": "user", "content": entry['question']} for entry in chat_history]

    def generate_response():
        full_response = ""
        try:
            retriever = vector_store.as_retriever()
            qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), retriever, verbose=True)
            response = qa({"chat_history": formatted_chat_history, "question": question})
            current_app.logger.info("Current Chat History:", chat_history)

            answer = response.get('answer', 'No answer available')

            for chunk in answer:
                yield chunk
                full_response += chunk
                time.sleep(0.01) 

        except Exception as e:
            yield f"Error: {str(e)}"

    return Response(stream_with_context(generate_response()), content_type='text/plain')

