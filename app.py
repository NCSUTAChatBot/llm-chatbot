from flask import Flask, render_template, request, jsonify
from llmbackend import process_question

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

@app.route('/process', methods=['POST'])
def process():
    input_text = request.form.get('input_text')
    result = process_question(input_text)
    # Do something with the input_text, e.g., print it
    print(f"Received input: {input_text}")
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True)
