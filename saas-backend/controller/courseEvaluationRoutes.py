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
from langchain_community.llms import OpenAI                 
from langchain.chains import ConversationalRetrievalChain  
from vectorsMongoDB.loadEvaluation import LoadEvaluation
from vectorsMongoDB.generateEvaluationEmbedding import GenerateEvaluation
import vectorsMongoDB.CEqueryManager as queryManager 
import time
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import markdown2
import io
from werkzeug.utils import secure_filename
import mimetypes
import chardet

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
CORS(eval_bp, resources={r"/*": {"origins": "*"}})


# sessions = {}

# Global variables
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx', 'pdf'}
ALLOWED_MIME_TYPES = {
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel',
    'application/pdf'
}

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
    
    # sessions[session_id] = {'vector_store': None}  
    return jsonify({'session_id': session_id})

def allowed_file(filename, mimetype):
    """Check if the file type is allowed"""
    ext = filename.rsplit('.', 1)[-1].lower()
    # Some browsers/systems might send slightly different MIME types
    base_mimetype = mimetype.split(';')[0].strip()
    return ext in ALLOWED_EXTENSIONS and base_mimetype in ALLOWED_MIME_TYPES

@eval_bp.route('/upload', methods=['POST'])
def upload_file():
    session_id = request.form.get('session_id')
    file = request.files.get('file')

    if request.method == 'OPTIONS':
        return Response(status=200, headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        })
    
    if not file:
        return jsonify({"error": "File is required"}), 400

    filename = secure_filename(file.filename)
    file_type = filename.rsplit('.', 1)[-1].lower()

    if not allowed_file(filename, file.mimetype):
        return jsonify({"error": "Unsupported file type"}), 400

    try:
        # Detect encoding
        file.stream.seek(0)
        raw_data = file.stream.read(10000)
        result = chardet.detect(raw_data)
        encoding = result['encoding'] if result['encoding'] else 'utf-8'
        file.stream.seek(0)

        loader = LoadEvaluation()
        try:
            documents = loader.load_from_stream(file.stream, file_type, encoding=encoding)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500

        if not documents:
            return jsonify({"error": "No content could be extracted from the file"}), 400

        if not session_id:
            session_id = secrets.token_urlsafe(16)

        generator = GenerateEvaluation()
        success = generator.generate_embeddings(session_id, documents)

        if success:
            return jsonify({"message": "File processed successfully", "session_id": session_id}), 200
        else:
            return jsonify({"error": "Failed to process file"}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@eval_bp.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    if request.method == 'OPTIONS':
        return '', 200
    
    input_data = request.json
    if not input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    question = input_data.get('question')
    session_id = input_data.get('session_id') 
    history = input_data.get('history', [])

    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    session_data = user_collection.find_one({'session_id': session_id})

    if not session_data:
        return jsonify({"error": "Session not found or has expired"}), 404
    
    # Initialize chat_history in session if not present
    if 'chat_history' not in session_data:
        session_data['chat_history'] = []

    # Store the user's question
    user_message = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'sender': 'user',
        'text': question
    }
    session_data['chat_history'].append(user_message)

    def generate_response():
        full_response = "" 
        try:
            for chunk in queryManager.make_query(question, session_id, history):
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
                else:
                    yield f"{chunk}"
                    full_response += chunk  

        except Exception as e:
            yield f"Error: {str(e)}"
            return
        finally:
            # After the response is fully generated, store it in the session
            bot_message = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'sender': 'bot',
                'text': full_response
            }
            session_data['chat_history'].append(bot_message)
    
    return Response(stream_with_context(generate_response()), content_type='text/plain')

def generate_pdf(chat_sessions):
    """
    Generate a PDF file containing the chat history.
    This function takes a list of chat sessions and generates a PDF file with the chat history.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()

    # Custom style for chat messages
    message_style = ParagraphStyle(
        name='MessageStyle',
        fontName='Helvetica',
        fontSize=10,
        leading=12,
        spaceAfter=6,
        textColor=colors.black,
        wordWrap='CJK',
    )

    # Custom style for table headings to allow wrapping
    heading_style = ParagraphStyle(
        name='HeadingStyle',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=12,
        textColor=colors.whitesmoke,
        alignment=1,  # Center alignment
    )

    elements = []

    for session in chat_sessions:
        # Add the chat title and session key as headings
        elements.append(Paragraph(f"Chat Title: {session['chatTitle']}", styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Session Key: {session['sessionKey']}", styles['Normal']))
        elements.append(Spacer(1, 24))

        # Prepare the table data for the chat messages
        table_data = [[
            Paragraph('Timestamp &<br/>Sender', heading_style),  # Wrapped header
            Paragraph('Message', heading_style)
        ]]

        # Iterate through each message
        for message in session['messages']:
            timestamp = message.get('timestamp', 'Unknown Time')
            sender = message.get('sender', 'Unknown Sender')
            # Convert the message text from Markdown to HTML
            markdown_text = message.get('text', 'No Text')
            html_text = markdown2.markdown(markdown_text)

            # Split the HTML into separate paragraphs
            paragraphs = html_text.split('</p>')

            timestamp_sender = Paragraph(f"{timestamp}<br/>{sender}", message_style)

            # Create a list to hold the message Paragraphs
            message_paragraphs = []
            for para in paragraphs:
                clean_para = para.replace('<p>', '').strip()
                if clean_para:
                    message_paragraphs.append(Paragraph(clean_para, message_style))
                    message_paragraphs.append(Spacer(1, 6))

            # Append the timestamp_sender and combined message paragraphs as separate rows
            table_data.append([timestamp_sender, message_paragraphs])

        # Define table style
        table_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ])

        # Create the table with a fixed width for the timestamp_sender column
        message_table = Table(table_data, style=table_style, colWidths=[100, 380])
        elements.append(message_table)
        elements.append(Spacer(1, 24))
        elements.append(PageBreak())

    # Build the PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

@eval_bp.route('/export_single_chat_to_pdf', methods=['POST'])
def export_single_chat_to_pdf():
    """
    Export a specific chat session to a PDF.
    """
    input_data = request.json
    if not input_data or 'session_id' not in input_data:
        return jsonify({"error": "Session ID is required"}), 400

    session_id = input_data['session_id']

    # Fetch the chat session from in-memory sessions
    session_data = sessions.get(session_id)
    if not session_data:
        return jsonify({"error": "Session not found or has expired"}), 404

    # Retrieve the chat messages from the session data
    chat_history = session_data.get('chat_history', [])
    if not chat_history:
        return jsonify({"error": "No chat history found for this session"}), 404

    # Prepare the data for PDF generation
    chat_sessions = [{
        "sessionKey": session_id,
        "chatTitle": "Course Evaluation",
        "messages": chat_history
    }]

    # Generate the PDF for the single chat session
    pdf_buffer = generate_pdf(chat_sessions)

    # Send the PDF as a response
    return send_file(pdf_buffer, as_attachment=True, download_name=f"chat_{session_id}.pdf", mimetype='application/pdf')