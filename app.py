'''
This is the main file for the Flask application.
It contains the routes for the frontend and the backend logic for the language model application.
The backend logic includes functions for loading text data, creating a vector database, and interacting with the conversational model.

@author: Haoze Du
@commented by: Sanjit Verma 
'''

from flask import Flask, render_template, request, jsonify
from flask_session import Session
from flask_cors import CORS
from llmbackend import make_query


# Create a new Flask application instance.
app = Flask(__name__)
# Set the secret key for session management. Used for securely signing the session cookie.
app.config["SECRET_KEY"] = "8zMym2xRX3*wRu&2"
# Configure session to not be permanent, meaning sessions will be cleared when the browser is closed.
app.config["SESSION_PERMANENT"] = False
# Set the session type to filesystem to store session data on the local filesystem.
app.config["SESSION_TYPE"] = "filesystem"
# Initialize session handling for the app.
Session(app)

# CORS(app, supports_credentials=True, resources={r"/ask": {"origins": ["192.168.50.58"]}})
# Enable Cross-Origin Resource Sharing (CORS) for all domains on all routes. This allows AJAX requests from other domains.
CORS(app) 

# Initialize an empty list to keep track of the chat history.
chat_history = []

# Define the root route which serves the main HTML page.
'''
@app.route('/')
def index():
    return render_template('index.html')
'''

# Define a route for serving a form page.
'''
@app.route('/form')
def form():
    return render_template('form.html')
'''

# Define a wrapper function for the make_query function to handle potential input errors and manage chat history.
def make_query_wrapper(chat_history, input_text: str | None) -> str:
    '''
    Wrapper function for make_query to include error handling and manage chat interaction.
    '''
    if input_text is None:
        # Raise an error if no input text is provided.
        raise ValueError("No input provided")
    else:
        # If input text is provided, process it using the make_query function.
        return make_query(chat_history, input_text)
    

# Define a route to handle POST requests on '/ask', typically called from an AJAX request.
@app.route('/ask', methods=['POST'])
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
@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    global chat_history
    # Clear the global chat history.
    chat_history = [] 
    # Return a success message with a 200 OK status.
    return jsonify({'status': 'Chat history cleared'}), 200

# Specify the entry point of the Flask application, which is only executed when the script is run directly.
if __name__ == '__main__':
    # Run the Flask application on port 8000, accessible from any network interface.
    app.run(debug=True, port=8000, host="0.0.0.0")
