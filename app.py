from flask import Flask, render_template, request, jsonify
from llmbackend import make_query

app = Flask(__name__)
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
    return jsonify({'chat_history':chat_history, 'result':result})

if __name__ == '__main__':
    app.run(debug=True)
