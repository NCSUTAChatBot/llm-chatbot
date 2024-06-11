'''
@file chatRoutes.py
This file contains the routes for the chat API.

@author Sanjit Verma
'''

from flask import Blueprint, request, jsonify, send_file
from llmbackend import make_query
from datetime import datetime
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
import secrets
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

# a blueprint named 'chat'
chat_bp = Blueprint('chat', __name__)

chat_history = []  # Initialize an empty list to keep track of the chat history.

# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_USERS = os.getenv('MONGODB_USERS')
MONGODB_DB = os.getenv('MONGODB_DATABASE')

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
user_collection = db[MONGODB_USERS]

chatReset = False

def make_query_wrapper(chat_history, input_text: str | None) -> str:
    """
    Wrapper function to handle the processing of user queries using the language model.
    This function takes the chat history and the new question as input, and returns the response from the language model.
    """
    if input_text is None:
        raise ValueError("No input provided")
    # Ensure chat_history is in the expected format (list of tuples)
    if isinstance(chat_history, list) and all(isinstance(item, dict) for item in chat_history):
        # Convert list of message dictionaries to a list of tuples 
        formatted_history = []
        it = iter(chat_history)
        try:
            while True:
                user_msg = next(it)  # User message
                bot_msg = next(it)  # Bot response
                formatted_history.append((user_msg['text'], bot_msg['text']))
        except StopIteration:
            # End of iteration occur if there's an unmatched user message without a bot response
            pass

    elif isinstance(chat_history, list):
        # If chat_history is already in the correct format (tuples), use it directly
        formatted_history = chat_history
    else:
        raise TypeError("Unsupported chat history format: Expected a list of message dictionaries or tuples.")

    try:
        # Pass the properly formatted chat history and the new question to the make_query function
        response = make_query(formatted_history, input_text)
        # Process the response
        if isinstance(response, dict):
            # Check if the response is a dictionary and contains the 'answer' key
            return response.get('answer', "No answer found in response")
        elif isinstance(response, str):
            return response
        else:
            raise RuntimeError("Unexpected response format from the language model.")
    except Exception as e:
        raise RuntimeError(f"An error occurred while processing the query: {e}")


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
    chat_title = input_data.get('chatTitle', '')  # Get chatTitle if provided, else default to empty string
    session_key = secrets.token_urlsafe(16)  # Generate a secure random session key

    # Check if the user exists
    user_document = user_collection.find_one({"email": email})
    if not user_document:
        return jsonify({"error": "User not found"}), 404

    # Initialize the chat session in the user's savedChats
    user_collection.update_one(
        {"email": email},
        {"$set": {f"savedChats.{session_key}": {
            "chatTitle": chat_title,
            "messages": []
        }}}
    )

    return jsonify({"sessionKey": session_key})


@chat_bp.route('/ask', methods=['POST'])
def ask():
    """
    This method processes a user's question and generates a response using the language model.
    It also updates the chat history with the user's question and the bot's response.
    Handless the creation of a new chat session if no session key is provided.

    """
    input_data = request.json
    if not input_data or 'email' not in input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    session_key = input_data.get('sessionKey')
    question = input_data['question']

    # If no session key is provided, create a new session and set the chat title to the question
    if not session_key:
        session_key = secrets.token_urlsafe(16)
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{session_key}": {
                "chatTitle": question,  # Set initial chat title to the question
                "messages": []
            }}}
        )

    # Find the user in the collection
    user = user_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Retrieve the chat session
    chat_session = user.get('savedChats', {}).get(session_key, {})
    chat_history = chat_session.get('messages', [])

    # Processing the question through the model
    response_text = make_query_wrapper(chat_history, question)

    # Create message objects for user and bot
    user_message = {
        "sender": "user",
        "text": question,
        "timestamp": datetime.now().isoformat()
    }
    bot_response = {
        "sender": "bot",
        "text": response_text,
        "timestamp": datetime.now().isoformat()
    }

    # Append new messages to the chat history
    user_collection.update_one(
        {"email": email},
        {"$push": {f"savedChats.{session_key}.messages": {"$each": [user_message, bot_response]}}}
    )

    # fail safe to update the chat title if it is not set or if it's the first message
    if not chat_session.get("chatTitle"):
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{session_key}.chatTitle": question}}
        )
    return jsonify({"userMessage": user_message, "botMessage": bot_response, "sessionKey": session_key})


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
        p.drawString(40, int(height) - 40, f"Chat Title: {session['chatTitle']}")
        p.setFont("Helvetica", 12)
        p.drawString(40, int(height) - 60, f"Session Key: {session['sessionKey']}")
        p.drawString(40, int(height) - 80, f"Chat History for {email}")
        p.drawString(40, int(height) - 100, "="*80)
        text_object = p.beginText(int(40), int(height) - 140)
        text_object.setFont("Helvetica", 12)
        for message in session['messages']:
            timestamp = message.get('timestamp', 'Unknown Time')
            sender = message.get('sender', 'Unknown Sender')
            text = message.get('text', 'No Text')
            text_object.textLine(f"{timestamp} - {sender}: {text}")
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

