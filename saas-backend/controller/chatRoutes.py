'''
@file chatRoutes.py
This file contains the routes for the chat API.

@author Sanjit Verma (skverma)
'''

from flask import Blueprint, request, jsonify, send_file, stream_with_context, Response
import json
from json import JSONDecodeError 
from datetime import datetime
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
import secrets
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from flask_cors import CORS
import vectorsMongoDB.queryManager as queryManager

# a blueprint named 'chat'
chat_bp = Blueprint('chat', __name__)
CORS(chat_bp, resources={r"/*": {"origins": "http://localhost:3000"}})

chat_history = []  # Initialize an empty list to keep track of the chat history.

# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_USERS = os.getenv('MONGODB_USERS')
MONGODB_DB = os.getenv('MONGODB_DATABASE')

if MONGODB_URI is None or MONGODB_USERS is None or MONGODB_DB is None:
    raise ValueError("MongoDB URI, database name, or collection name is not set.")

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
user_collection = db[MONGODB_USERS]

chatReset = False

@chat_bp.route('/createSession', methods=['POST'])
def new_chat():
    """
    This method creates a new chat session for a user.
    Genreates a secure random session key and initializes the chat session in the user's savedChats.
    """
    input_data = request.get_json()
    if input_data is None or 'email' not in input_data:
        return jsonify({"error": "Email is required"}), 400

    email = input_data['email']
    chat_title = input_data.get('chatTitle', '')  
    session_key = secrets.token_urlsafe(16) 


    user_document = user_collection.find_one({"email": email})
    if not user_document:
        return jsonify({"error": "User not found"}), 404
    

    if 'savedChats' in user_document:
        updates = {}
        for key, value in user_document['savedChats'].items():
            if value.get('chatTitle') == '':
                updates[f"savedChats.{key}"] = ""

        if updates:
            user_collection.update_one(
                {"email": email},
                {"$unset": updates}
            )

    return jsonify({"sessionKey": session_key})


@chat_bp.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    if request.method == 'OPTIONS':
        return '', 200
    
    input_data = request.json
    if not input_data or 'email' not in input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    session_key = input_data.get('sessionKey')
    question = input_data['question']
    user = user_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not session_key:
        session_key = secrets.token_urlsafe(16)
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{session_key}": {
                "chatTitle": question, 
                "messages": []
            }}}
        )

    chat_session = user.get('savedChats', {}).get(session_key, {})

    user_message = {
        "sender": "user",
        "text": question,
        "timestamp": datetime.now().isoformat()
    }

    # Update the user message to MongoDB
    user_collection.update_one(
        {"email": email},
        {"$push": {f"savedChats.{session_key}.messages": user_message}}
    )

    def generate_response():
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

                            bot_response = {
                                "sender": "bot",
                                "text": bot_response_text,
                                "timestamp": datetime.now().isoformat()
                            }

                            user_collection.update_one(
                                {"email": email},
                                {"$push": {f"savedChats.{session_key}.messages": bot_response}}
                            )
                else:
                    yield f"{chunk}"

                    bot_response = {
                        "sender": "bot",
                        "text": chunk,
                        "timestamp": datetime.now().isoformat()
                    }
                    user_collection.update_one(
                        {"email": email},
                        {"$push": {f"savedChats.{session_key}.messages": bot_response}}
                    )
        except Exception as e:
            yield f"Error: {str(e)}"

    return Response(stream_with_context(generate_response()), content_type='text/plain')

    


@chat_bp.route('/clear_chat', methods=['POST'])
def clear_chat():
    """
    This method clears the chat history for the current session.
    """
    global chat_history, chat_reset
    chat_history = []
    return jsonify({'status': 'Chat history cleared'}), 200


@chat_bp.route('/get_saved_chats', methods=['GET'])
def get_saved_chats():
    """
    This method gets the list off all saved chat sessions for a user.
    """
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Required data (email) is missing"}), 400
    user = user_collection.find_one({"email": email}, {"_id": 0, "savedChats": 1})
    if user and 'savedChats' in user:
        saved_chats = user['savedChats']
        sorted_sessions = sorted(
            saved_chats.items(),
            key=lambda item: datetime.strptime(
                item[1]['messages'][0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f'
            ) if item[1]['messages'] else datetime.min,
            reverse=True
        )
        # get the sesison title for each key
        sessions_info = [{"sessionKey": key, "chatTitle": value.get("chatTitle", "Untitled Chat")} for key, value in sorted_sessions]
        return jsonify({"savedChatSessions": sessions_info}), 200
    else:
        return jsonify({"error": "User not found or no saved chats"}), 404
    

@chat_bp.route('/delete_chat', methods=['POST'])
def delete_chat():
    """
    This method deletes a specific chat session for a user based on the session key.
    """
    input_data = request.json
    if not input_data or 'email' not in input_data or 'sessionKey' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    session_key = input_data['sessionKey']

    # Find and update the user's saved chats by removing the specific chat using the session key
    result = user_collection.update_one(
        {"email": email},
        {"$unset": {f"savedChats.{session_key}": ""}} 
    )
    if result.matched_count == 0:
        return jsonify({"error": "User or session key not found"}), 404
    return jsonify({"success": True, "message": f"Chat with session key '{session_key}' deleted"}), 200

@chat_bp.route('/get_chat_by_session', methods=['POST'])
def get_chat_by_session_key():
    """
    This method retrieves a specific chat session for a user based on the session key.
    gets all the messages for the yser and bot with the given session key.
    """
    # Parse request data
    input_data = request.json
    if not input_data or 'email' not in input_data or 'sessionKey' not in input_data:
        return jsonify({"error": "Required data (email or sessionKey) is missing"}), 400

    email = input_data['email']
    session_key = input_data['sessionKey']

    # Find the user and specific chat by session key
    user = user_collection.find_one({"email": email}, {"_id": 0, f"savedChats.{session_key}": 1})
    if user:
        chat_data = user.get('savedChats', {}).get(session_key, None)
        if chat_data:
            return jsonify({"email": email, "sessionKey": session_key, "messages": chat_data['messages']}), 200
        else:
            return jsonify({"error": "Session key not found"}), 404
    else:
        return jsonify({"error": "User not found"}), 404
    

def generate_pdf(email, chat_sessions):
    """
    Generate a PDF file containing the chat history for a user.
    This function takes the user's email and a list of chat sessions, and generates a PDF file with the chat history.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    for session in chat_sessions:
        p.setFont("Helvetica-Bold", 16)
        p.drawString(40, height - 40, f"Chat Title: {session['chatTitle']}")
        p.setFont("Helvetica", 12)
        p.drawString(40, height - 60, f"Session Key: {session['sessionKey']}")
        p.drawString(40, height - 80, f"Chat History for {email}")
        p.drawString(40, height - 100, "="*80)

        # Begin text object for chat history
        text_object = p.beginText(40, int(height) - 120)
        text_object.setFont("Helvetica", 12)
        text_object.setWordSpace(0.5)
        text_object.setLeading(14)

        # Iterate through each message
        for message in session['messages']:
            timestamp = message.get('timestamp', 'Unknown Time')
            sender = message.get('sender', 'Unknown Sender')
            text = message.get('text', 'No Text')
            # Prepare and wrap text
            full_text = f"{timestamp} - {sender}: {text}"
            while full_text:
                # Find space to break line
                space_index = full_text.rfind(' ', 0, 100)
                if space_index == -1 or len(full_text) < 100:  # No space or short text
                    space_index = len(full_text)
                # Add line and update text
                text_object.textLine(full_text[:space_index])
                full_text = full_text[space_index:].strip()


        p.drawText(text_object)
        p.showPage()

    p.save()
    buffer.seek(0)
    return buffer



@chat_bp.route('/export_single_chat_to_pdf', methods=['POST'])
def export_single_chat_to_pdf():
    """
    export a specific chat session to a PDF.
    """
    input_data = request.json
    if not input_data or 'email' not in input_data or 'sessionKey' not in input_data:
        return jsonify({"error": "Email and session key are required"}), 400

    email = input_data['email']
    session_key = input_data['sessionKey']

    # Fetch the user and t chat sessio
    user = user_collection.find_one({"email": email}, {"_id": 0, f"savedChats.{session_key}": 1})
    if not user:
        return jsonify({"error": "User not found or no saved chats"}), 404

    # retrieve the specific chat session
    chat_session = user.get('savedChats', {}).get(session_key, None)
    if not chat_session:
        return jsonify({"error": "Session key not found"}), 404

    # Format the single chat session for the PDF
    chat_sessions = [{
        "sessionKey": session_key,
        "chatTitle": chat_session.get("chatTitle", "Untitled Chat"),
        "messages": chat_session.get("messages", [])
    }]

    # Generate the PDF for the single chat session
    pdf_buffer = generate_pdf(email, chat_sessions)

    # Send the pdf as a response
    return send_file(pdf_buffer, as_attachment=True, download_name=f"{chat_sessions[0]['chatTitle']}.pdf", mimetype='application/pdf')

