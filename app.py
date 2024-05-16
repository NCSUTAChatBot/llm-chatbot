from flask import Flask, render_template, request, jsonify
from flask_session import Session
from flask_cors import CORS
from llmbackend import make_query

app = Flask(__name__)

app.config["SECRET_KEY"] = "8zMym2xRX3*wRu&2"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# CORS(app, supports_credentials=True, resources={r"/ask": {"origins": ["192.168.50.58"]}})
CORS(app) 
chat_history = []
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

def make_query_wrapper(chat_history, input_text: str | None) -> str:
    '''
    Wrapper function for make_query.
    '''
    if input_text is None:
        # handle the None case: raise error
        raise ValueError("No input provided")
    else :
        # call the original make_query function
        return make_query(chat_history, input_text)
    
@app.route('/ask', methods=['POST'])
def ask():
    # This function is listening for the /ask POST request after the page is loaded.
    input_text = request.json
    print(f"Received input: {str(input_text)}")
    if input_text is not None:
        result = make_query_wrapper(chat_history, input_text["question"])
    else :
        raise ValueError("No input provided")
    # Do something with the input_text, e.g., print it
    # print(f"Received input: {input_text}")
    print(f"Result: {result}")
    print(f"Type: {type(result)}")
    return jsonify({'chat_history': chat_history, 'answer': result})

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    global chat_history
    chat_history = [] 
    return jsonify({'status': 'Chat history cleared'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000, host="0.0.0.0")
