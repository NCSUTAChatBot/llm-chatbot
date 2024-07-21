'''
@file courseEvaluationRoutes.py
This file contains the routes for the course evaluation API
@author Sanjit Verma (skverma)
'''

from flask import Blueprint, request, jsonify, send_file, stream_with_context, Response
import pandas as pd
import secrets
from langchain_community.vectorstores import FAISS         
from langchain_openai import OpenAIEmbeddings    
from flask import current_app

from langchain_openai import OpenAIEmbeddings              
from langchain_community.llms import OpenAI                 # OpenAI is an open-source library for natural language understanding.
from langchain.chains import ConversationalRetrievalChain   # The one popular chain from langchain, which concatenates the previous model's output to the new model's input.


eval_bp = Blueprint('courseEvaluation', __name__)

# In-memory storage for session data
sessions = {}

class Document:
    def __init__(self, text, embedding=None):
        self.text = text
        self.embedding = embedding
        self.page_content = text
        self.metadata = {}  

@eval_bp.route('/upload', methods=['POST'])
def upload_file():
    session_id = request.form.get('session_id', secrets.token_urlsafe(16))
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
        
        if session_id in sessions:
            vector_store = sessions[session_id]['vector_store']
            vector_store.add_documents(documents)
        else:
            vector_store = FAISS.from_documents(documents, embedding_model)
            sessions[session_id] = {'vector_store': vector_store}
            
    except Exception as e:
        return jsonify({"error": "Failed to create vector store: " + str(e)}), 500

    return jsonify({"message": "File processed successfully", "session_id": session_id, "filename": file.filename})
@eval_bp.route('/ask', methods=['POST'])
def ask():
    input_data = request.json
    if not input_data or 'session_id' not in input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    session_id = input_data['session_id']
    question = input_data['question']

    session_data = sessions.get(session_id)
    if not session_data:
        return jsonify({"error": "Session not found"}), 404
    chat_history = session_data.get('chat_history', [])
    def generate_response():
        try:
            vector_store = session_data.get('vector_store')
            retriever = vector_store.as_retriever()
            # Assuming ConversationalRetrievalChain is set up correctly to use with OpenAI and FAISS
            qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), retriever, verbose=True) 
            response = qa({"chat_history": chat_history, "question": question})
            
            chat_history.append({"question": question, "answer": response['answer']})
            session_data['chat_history'] = chat_history
            current_app.logger.info("Current Chat History:", chat_history)
        
            # Yields the response in streaming fashion
            yield response['answer'] if 'answer' in response else request.json.dumps(response)

        except Exception as e:
            yield f"Error: {str(e)}"
            return
    
    return Response(stream_with_context(generate_response()), content_type='text/plain')

@eval_bp.route('/end_session', methods=['POST'])
def end_session():
    input_data = request.json
    session_id = input_data.get('session_id')

    if session_id in sessions:
        del sessions[session_id]
        return jsonify({'message': 'Session ended and data cleared'})
    return jsonify({'error': 'Session not found'}), 404

# Set up CORS to allow requests from the frontend
from flask_cors import CORS
CORS(eval_bp, resources={r"/*": {"origins": "http://localhost:3000"}})
