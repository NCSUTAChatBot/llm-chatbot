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


# Define a wrapper function for the make_query function to handle potential input errors and manage chat history.
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
    Generate a unique title by appending a numerical suffix if necessary.
    """
    if base_title not in saved_chats:
        return base_title
    
    suffix = 2
    while f"{base_title} {suffix}" in saved_chats:
        suffix += 1
    
    return f"{base_title} {suffix}"

# Define a route to handle POST requests on '/ask'
@chat_bp.route('/ask', methods=['POST'])
def ask():
    global chat_history
    
    input_data = request.json
    if not input_data or 'email' not in input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    email = input_data['email']
    question = input_data['question']

    # Generate response using the wrapper function
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

    # Determine the chat title (first question in the chat history)
    if len(chat_history) == 0:
        base_title = question
        chat_title = base_title
    else:
        chat_title = chat_history[0][0]

    # Append the current interaction to the local chat history
    chat_history.append((question, response_text))

    # Find or create the user in the collection
    user = user_collection.find_one_and_update(
        {"email": email},
        {"$setOnInsert": {"savedChats": {}}},  # Ensure savedChats exists as a dictionary if the user is new
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    saved_chats = user.get('savedChats', {})

    # If the chat history was just reset, generate a unique title
    if len(chat_history) == 1:
        chat_title = generate_unique_title(chat_title, saved_chats)

    # Check if this chat title already exists for the user
    if chat_title in saved_chats:
        # Append to the existing chat session
        user_collection.update_one(
            {"email": email},
            {"$push": {f"savedChats.{chat_title}.messages": {"$each": [user_message, bot_response]}}}
        )
    else:
        # Create a new chat session
        new_chat = {
            "messages": [user_message, bot_response]
        }
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{chat_title}": new_chat}}
        )

    # Return the result to the client with a clear structure
    return jsonify({"userMessage": user_message, "botMessage": bot_response})

# Define a route to handle POST requests on '/clear_chat', which resets the chat history.
@chat_bp.route('/clear_chat', methods=['POST'])
def clear_chat():
    global chat_history, chat_reset
    chat_history = []
    chat_reset = True  # Set the flag to true indicating the chat was reset
    return jsonify({'status': 'Chat history cleared'}), 200
