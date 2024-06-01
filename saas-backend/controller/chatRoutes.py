'''
@file chatRoutes.py
This file contains the routes for the chat API.

@author Sanjit Verma
'''

from flask import Blueprint, request, jsonify
from llmbackend import make_query

# a blueprint named 'chat'
chat_bp = Blueprint('chat', __name__)

chat_history = []  # Initialize an empty list to keep track of the chat history.

# Define a wrapper function for the make_query function to handle potential input errors and manage chat history.
def make_query_wrapper(chat_history, input_text: str | None) -> str:
    if input_text is None:
        raise ValueError("No input provided")
    else:
        return make_query(chat_history, input_text)

# Define a route to handle POST requests on '/ask'
@chat_bp.route('/ask', methods=['POST'])
def ask():
    # Extract the JSON data from the request, which includes the user's query.
    input_text = request.json
    print(f"Received input: {str(input_text)}")
    if input_text is not None:
        # Process the query using the wrapper function and append the response to chat history.
        result = make_query_wrapper(chat_history, input_text["question"])
    else:
        # Raise an error if the JSON data is missing the 'question' key.
        raise ValueError("No input provided")
    print(f"Result: {result}")
    print(f"Type: {type(result)}")
    # Return the result as a JSON response to the client.
    return jsonify({'chat_history': chat_history, 'answer': result})

# Define a route to handle POST requests on '/clear_chat', which resets the chat history.
@chat_bp.route('/clear_chat', methods=['POST'])
def clear_chat():
    global chat_history
    chat_history = []
    return jsonify({'status': 'Chat history cleared'}), 200
