'''
@file chatRoutes.py
This file contains the routes for the chat API.

@author Sanjit Verma
'''

from flask import Blueprint, request, jsonify
from llmbackend import make_query
from datetime import datetime
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
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
    if input_text is None:
        raise ValueError("No input provided")
    try:
        response = make_query(chat_history, input_text)

        # Check if the response is a dictionary and contains the 'answer' key
        if isinstance(response, dict):
            # Safely access the 'answer' key using .get()
            return response.get('answer', "No answer found in response")
        elif isinstance(response, str):
            return response
        else:
            raise RuntimeError("Unexpected response format from the language model.")
    except Exception as e:
        raise RuntimeError(f"An error occurred while processing the query: {e}")
    
def generate_unique_title(base_title: str, saved_chats: dict) -> str:
    """
    Generate a unique title by appending the current timestamp if the title already exists.
    """
    if base_title not in saved_chats:
        return base_title
    
    # Append current timestamp to make the title unique
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{base_title} {timestamp}"

@chat_bp.route('/ask', methods=['POST'])
def ask():
    input_data = request.json
    if not input_data or 'email' not in input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    question = input_data['question']
    base_chat_title = input_data.get('chatTitle', question)

    # Find or create the user in the collection
    user = user_collection.find_one({"email": email})
    if not user:
        user = user_collection.find_one_and_update(
            {"email": email},
            {"$setOnInsert": {"email": email, "savedChats": {}}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
    
    saved_chats = user.get('savedChats', {})

    # Generate a unique title if the base title already exists
    chat_title = generate_unique_title(base_chat_title, saved_chats)

    # Load chat history if a title is provided and exists, else start a new chat
    if chat_title in saved_chats:
        chat_history = saved_chats[chat_title]['messages']
    else:
        chat_history = []

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
    if chat_title in saved_chats:
        # Append to the existing chat session
        user_collection.update_one(
            {"email": email},
            {"$push": {f"savedChats.{chat_title}.messages": {"$each": [user_message, bot_response]}}}
        )
    else:
        # If it's a new chat or chat_title was not provided
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{chat_title}": {"messages": [user_message, bot_response]}}}
        )

    return jsonify({"userMessage": user_message, "botMessage": bot_response, "chatTitle": chat_title})



@chat_bp.route('/clear_chat', methods=['POST'])
def clear_chat():
    global chat_history, chat_reset
    chat_history = []
    chat_reset = True  
    return jsonify({'status': 'Chat history cleared'}), 200

@chat_bp.route('/get_saved_chats', methods=['GET'])
def get_saved_chats():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Required data (email) is missing"}), 400
    user = user_collection.find_one({"email": email}, {"_id": 0, "savedChats": 1})
    if user and 'savedChats' in user:
        saved_chats = user['savedChats']
        sorted_titles = sorted(
            saved_chats.keys(),
            key=lambda title: datetime.strptime(
                saved_chats[title]['messages'][0]['timestamp'], '%Y-%m-%dT%H:%M:%S.%f'
            ) if saved_chats[title]['messages'] else datetime.min,
            reverse=True
        )

        return jsonify({"savedChatTitles": sorted_titles}), 200
    else:
        return jsonify({"error": "User not found or no saved chats"}), 404
    

@chat_bp.route('/delete_chat', methods=['POST'])
def delete_chat():
    input_data = request.json
    if not input_data or 'email' not in input_data or 'chatTitle' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    chat_title = input_data['chatTitle']

    # Find and update the user's saved chats by removing the specific chat title
    result = user_collection.update_one(
        {"email": email},
        {"$unset": {f"savedChats.{chat_title}": ""}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "User or chat title not found"}), 404

    return jsonify({"success": True, "message": f"Chat '{chat_title}' deleted"}), 200

@chat_bp.route('/get_chat_by_title', methods=['POST'])
def get_chat_by_title():
    # Parse request data
    input_data = request.json
    if not input_data or 'email' not in input_data or 'chatTitle' not in input_data:
        return jsonify({"error": "Required data (email or chatTitle) is missing"}), 400

    email = input_data['email']
    chat_title = input_data['chatTitle']

    # Find the user and specific chat by title
    user = user_collection.find_one({"email": email}, {"_id": 0, f"savedChats.{chat_title}": 1})
    if user:
        chat_data = user.get('savedChats', {}).get(chat_title, None)
        if chat_data:
            return jsonify({"email": email, "chatTitle": chat_title, "messages": chat_data['messages']}), 200
        else:
            return jsonify({"error": "Chat title not found"}), 404
    else:
        return jsonify({"error": "User not found"}), 404

