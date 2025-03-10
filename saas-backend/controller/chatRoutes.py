'''
@file chatRoutes.py
This file contains the routes for the chat API.

@author Sanjit Verma (skverma)
'''

from flask import Blueprint, request, jsonify, send_file, stream_with_context, Response
import json
from json import JSONDecodeError 
from datetime import datetime
from langchain_openai import ChatOpenAI
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
import secrets
import io
from flask_cors import CORS
import vectorsMongoDB.queryManager as queryManager
import time
from langfuse.decorators import observe, langfuse_context
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import markdown2

# a blueprint named 'chat'
chat_bp = Blueprint('chat', __name__)
CORS(chat_bp, resources={r"/*": {"origins": "http://localhost:3000"}})

chat_history = []  # Initialize an empty list to keep track of the chat history.

# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_USERS = os.getenv('MONGODB_USERS')
MONGODB_DB = os.getenv('MONGODB_DATABASE')
MONGODB_SUGGESTIONS = os.getenv('MONGODB_SUGGESTIONS')

if MONGODB_URI is None or MONGODB_USERS is None or MONGODB_DB is None or MONGODB_SUGGESTIONS is None:
    raise ValueError("MongoDB URI, database name, or collection name is not set.")

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
user_collection = db[MONGODB_USERS]
suggestions_collection = db[MONGODB_SUGGESTIONS]

chatReset = False

@chat_bp.route('/createSession', methods=['POST'])
def new_chat():
    """
    This method creates a new chat session for a user.
    Generates a secure random session key and initializes the chat session in the user's savedChats.
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
    first_guess = input_data.get('firstGuess') 
    history = input_data.get('history', [])

    user = user_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not session_key:
        # Generate a new session key and initialize the chat session
        session_key = secrets.token_urlsafe(16)
        user_collection.update_one(
            {"email": email},
            {"$set": {f"savedChats.{session_key}": {
                "chatTitle": question,
                "messages": []
            }}}
        )
        return jsonify({"sessionKey": session_key})

    chat_session = user.get('savedChats', {}).get(session_key)

    # Add the user's message to the session
    user_message = {
        "sender": "user",
        "text": question,
        "timestamp": datetime.now().isoformat()
    }
    if first_guess:  # If a first guess is provided, include it in the session
        user_message["first_guess"] = first_guess
    user_collection.update_one(
        {"email": email},
        {"$push": {f"savedChats.{session_key}.messages": user_message}}
    )

    def generate_response():
        full_response = ""  # To store the complete main response
        analysis_buffer = []  # Buffer for First Guess Analysis
        combined_response = ""  # Combined response for saving to the database
        try:
            # Stream the main response
            for chunk in queryManager.make_query(question, history, first_guess):
                try:
                    chunk_data = json.loads(chunk)
                except JSONDecodeError:
                    chunk_data = chunk

                if isinstance(chunk_data, dict) and "choices" in chunk_data:
                    for choice in chunk_data["choices"]:
                        if "text" in choice:
                            bot_response_text = choice["text"]
                            full_response += bot_response_text
                            yield f"{bot_response_text}"  # Stream main response chunks
                else:
                    full_response += chunk
                    yield f"{chunk}"  # Stream main response chunks

            # Generate and stream analysis after the main response is complete
            if first_guess and first_guess.strip():
                comparison_prompt = f"""
                Compare the user's first guess with the final answer. 
                Highlight key similarities and provide constructive feedback.
                
                First Guess: {first_guess}
                Final Answer: {full_response}
                
                Structure your response:
                - Key Matches: 
                - Suggested Improvements:
                """

                analysis_stream = ChatOpenAI().stream(comparison_prompt)

                # Stream chunks of analysis directly
                yield "\n\n[First Guess Analysis]\n"
                for msg_chunk in analysis_stream:
                    if hasattr(msg_chunk, 'content'):
                        analysis_buffer.append(str(msg_chunk.content))
                        yield str(msg_chunk.content)
                    else:
                        analysis_buffer.append(str(msg_chunk))
                        yield str(msg_chunk)
            
            # Combine main response and analysis into one text block
            combined_response = f"{full_response}\n\n[First Guess Analysis]\n{''.join(analysis_buffer)}"


        except Exception as e:
            yield f"Error: {str(e)}"
            return

        # Save the bot's combined response to the database
        bot_response = {
            "sender": "bot",
            "text": combined_response,
            "timestamp": datetime.now().isoformat()
        }
        user_collection.update_one(
            {"email": email},
            {"$push": {f"savedChats.{session_key}.messages": bot_response}}
        )

    
    return Response(stream_with_context(generate_response()), content_type='text/plain')


@chat_bp.route('/pause_stream', methods=['POST'])
def pause_stream():

    data = request.json
    email = data.get('email')
    session_key = data.get('sessionKey')
    last_message = data.get('lastMessage')

    if not all([email, session_key, last_message]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        max_attempts = 10
        attempt = 0
        while attempt < max_attempts:
            user = user_collection.find_one({"email": email})
            if not user or session_key not in user.get('savedChats', {}):
                return jsonify({"error": "User or session not found"}), 404

            chat_messages = user['savedChats'][session_key].get('messages', [])
            if chat_messages and chat_messages[-1]['sender'] == 'bot':
                # Remove the last bot message
                user_collection.update_one(
                    {"email": email},
                    {"$pop": {f"savedChats.{session_key}.messages": 1}}
                )

                # Add the new bot message
                bot_response = {
                    "sender": "bot",
                    "text": last_message['text'],
                    "timestamp": datetime.now().isoformat()
                }
                user_collection.update_one(
                    {"email": email},
                    {"$push": {f"savedChats.{session_key}.messages": bot_response}}
                )
                return jsonify({"message": "Stream paused and message updated successfully"}), 200

            # If last message is not from bot, wait and try again
            time.sleep(0.5)
            attempt += 1 

        return jsonify({"message": "Stream paused and message updated successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/askGuest', methods=['POST', 'OPTIONS'])
def ask_guest():
    if request.method == 'OPTIONS':
        return '', 200

    input_data = request.json
    if not input_data or 'question' not in input_data:
        return jsonify({"error": "Required data is missing"}), 400

    session_key = input_data.get('sessionKey')
    question = input_data['question']
    history = input_data.get('history', [])

    if not session_key:
        # Generate a new session key
        session_key = secrets.token_urlsafe(16)
        return jsonify({"sessionKey": session_key})

    user_message = {
        "sender": "user",
        "text": question,
        "timestamp": datetime.now().isoformat()
    }
    # Normally save the user_message to a session in a database, but skipping this step

    def generate_response():
        full_response = "" 
        try:
            for chunk in queryManager.make_query(question, history):  # Replace with actual query manager
                try:
                    chunk_data = json.loads(chunk)
                except json.JSONDecodeError:
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

    return Response(stream_with_context(generate_response()), content_type='text/plain')

@chat_bp.route('/update_chat_title', methods=['POST'])
def update_chat_title():
    input_data = request.json
    if not input_data or 'email' not in input_data or 'sessionKey' not in input_data or 'newTitle' not in input_data:
        return jsonify({"error": "Missing required fields"}), 400

    email = input_data['email']
    session_key = input_data['sessionKey']
    new_title = input_data['newTitle']

    user = user_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    chat_session = user.get('savedChats', {}).get(session_key)
    if not chat_session:
        return jsonify({"error": "Session key not found"}), 404

    result = user_collection.update_one(
        {"email": email, f"savedChats.{session_key}": {"$exists": True}},
        {"$set": {f"savedChats.{session_key}.chatTitle": new_title}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Failed to update chat title"}), 500

    return jsonify({"message": "Chat title updated successfully", "sessionKey": session_key}), 200

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
        elements.append(Paragraph(f"Chat History for {email}", styles['Normal']))
        elements.append(Spacer(1, 24))

        # Prepare the table data for the chat messages, combining Timestamp and Sender columns
        # Wrap "Timestamp & Sender" heading using a Paragraph
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

            # Split the HTML into separate paragraphs by splitting on <p> tags
            paragraphs = html_text.split('</p>')

            timestamp_sender = Paragraph(f"{timestamp}<br/>{sender}", message_style)

            # Create a list to hold the message Paragraphs
            message_paragraphs = []
            for para in paragraphs:
                clean_para = para.replace('<p>', '').strip()  # Remove the <p> tag and clean up whitespace
                if clean_para:  # If the paragraph is not empty
                    message_paragraphs.append(Paragraph(clean_para, message_style))
                    message_paragraphs.append(Spacer(1, 6))  # Add a small space between paragraphs

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
        message_table = Table(table_data, style=table_style, colWidths=[100, 380])  # 100 is the width of the timestamp_sender column
        elements.append(message_table)
        elements.append(Spacer(1, 24))
        elements.append(PageBreak())

    # Build the PDF
    doc.build(elements)
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

@chat_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    Fetch prompt suggestions from the database.
    """
    suggestions =  list(suggestions_collection.find({'enabled':True}, {'_id': 0, 'enabled': 0}))
    return jsonify(suggestions), 200

@chat_bp.route('/suggestions', methods=['POST'])
def add_suggestions():
    """
    Add a new prompt suggestion to the database.
    """
    input_data = request.json
    if not input_data or 'question' not in input_data or 'description' not in input_data:
        return jsonify({"error": "Valid input fields not provided"}), 400

    question = input_data['question']
    description = input_data['description']
    enabled = input_data.get('enabled', True)

    # Insert the new suggestion into the database
    result = suggestions_collection.insert_one({
        'question': question,
        'description': description,
        'enabled': enabled
    })

    if result.inserted_id:
        return jsonify({"message": "Suggestion added successfully"}), 201
    else:
        return jsonify({"error": "Failed to add suggestion"}), 500
    
@chat_bp.route('/suggestions/status', methods=['POST'])
def set_suggestion_status():
    """
    Changed the enabled status of a suggestion.
    """
    input_data = request.json
    if not input_data or 'question' not in input_data or 'enabled' not in input_data:
        return jsonify({"error": "Valid input fields not provided"}), 400

    question = input_data['question']
    enabled = input_data['enabled']

    # Update the enabled status of the suggestion in the database
    result = suggestions_collection.update_one(
        {'question': question},
        {'$set': {'enabled': enabled}}
    )

    if result.modified_count:
        return jsonify({"message": "Suggestion status updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update suggestion status"}), 500
