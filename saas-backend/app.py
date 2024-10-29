'''
This is the main file for the Flask application.
It contains the routes for the frontend and the backend logic for the language model application.
The backend logic includes functions for loading text data, creating a vector database, and interacting with the conversational model.

@author: Haoze Du
@commented by: Sanjit Verma 
'''

from flask import Flask
from flask_session import Session
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from controller.chatRoutes import chat_bp
from controller.userRoutes import user_bp
from controller.courseEvaluationRoutes import eval_bp
from flask_swagger_ui import get_swaggerui_blueprint
import os

MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
# Create a new Flask application instance.
app = Flask(__name__)
# Set the secret key for session management. Used for securely signing the session cookie.
app.config["SECRET_KEY"] = "8zMym2xRX3*wRu&2"
# Configure session to not be permanent, meaning sessions will be cleared when the browser is closed.
app.config["SESSION_PERMANENT"] = False
# Set the session type to filesystem to store session data on the local filesystem.
app.config["SESSION_TYPE"] = "filesystem"

#Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
# Add valid email and app password(which can be generated from google accounts for gmail)
# TODO: Add Admin email and app password using environment variables 
app.config['MAIL_USERNAME'] = MAIL_USERNAME
app.config['MAIL_PASSWORD'] = MAIL_PASSWORD 
# Set the maximum file size for file uploads to 10MB.
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# Initialize session handling for the app.
Session(app)

# CORS(app, supports_credentials=True, resources={r"/ask": {"origins": ["192.168.50.58"]}})
# Enable Cross-Origin Resource Sharing (CORS) for all domains on all routes. This allows AJAX requests from other domains.
CORS(app, resources={r"/*": {"origins": "*"}}) 

JWTManager(app)

mail= Mail(app)


SWAGGER_URL="/swagger"
API_URL="/static/swagger.yaml"

swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': 'Access API'
    }
)

app.register_blueprint(chat_bp, url_prefix='/chat')
app.register_blueprint(eval_bp, url_prefix='/courseEvaluation')
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)


# Specify the entry point of the Flask application, which is only executed when the script is run directly.
if __name__ == '__main__':
    # Run the Flask application on port 8000, accessible from any network interface.
    app.run(debug=True, port=8000, host="0.0.0.0")
