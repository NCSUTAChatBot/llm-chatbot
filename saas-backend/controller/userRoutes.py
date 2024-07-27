'''
This file contains the routes for the user API.

@author Sanjit Verma (skverma) and Dinesh Kannan
'''
from flask import Blueprint, request, jsonify, session
from pymongo import MongoClient
from flask_jwt_extended import create_access_token, unset_jwt_cookies
from flask_mail import Message
from service.user_service import UserService
from repository.user_repository import UserRepository
from pydantic import ValidationError
from dotenv import load_dotenv
from langfuse.decorators import observe, langfuse_context
import os

# Load environment variables
load_dotenv()
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_USERS = os.getenv('MONGODB_USERS')
MONGODB_DB = os.getenv('MONGODB_DATABASE')

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
user_collection = db[MONGODB_USERS]

# Initialize UserRepository and UserService
user_repository = UserRepository(user_collection)
user_service = UserService(user_repository)

# a blueprint named 'user'
user_bp = Blueprint('user', __name__)

@user_bp.route('/signup', methods=['POST'])
def create_user():
    """
    This method creates a new user profile.
    """
    try:
        data = request.get_json()
        response, status = user_service.create_user(
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        return jsonify(response), status
    except ValidationError as e:
        return jsonify({'error': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/login', methods=['POST'])
@observe()
def login_user():
    """
    This method allows registed user to login into their profile
    Genreates a secure random access token and authenticates the user .
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        valid, message , user = user_service.authenticate_user(email, password)
        if valid:
            session['user_email']= email
            langfuse_context.update_current_trace(user_id=email)
            access_token = create_access_token(identity=email)
            user_info={'name': user['first_name'], 'last_name': user['last_name'], 'email': user['email']}
            return jsonify({"access_token":access_token, "message":message, "user_info": user_info} ), 200
        else:
            return jsonify({'error': message}), 401
    except ValidationError as e:
        return jsonify({'error': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route("/logout", methods=["POST"])
def logout():
    """
    This method allows user to logout from their profile.
    It unsets any cookie of the user and pops out their email from the local storage to end the session
    """
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    session.pop('user_email', None)
    return response

def get_mail():
    """
    This method allows to import the Mail instance from app.py file to avoid circular import
    """
    from app import mail
    return mail

@user_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    """
    This method allows user to get a mail to reset their password incase they forgot it
    """
    try:
        mail= get_mail()
        data = request.get_json()
        email = data.get('email')
        user= user_repository.find_user_by_email(email)
        if not user:
            return jsonify({"error":"No user found with that email address"}), 404
        reset_token=user_repository.password_reset_token_generator(email)
        reset_link=f"http://localhost:3000/virtualTA/reset_password?token={reset_token}&email={email}"
        message= Message('Virtual TA: Reset Your Password', sender='your-email@example.com', recipients=[email])
        message.body = f"""
Dear Virtual TA User,

Follow this link to reset your password for your account:

{reset_link}

If you didn’t make this request, you can safely ignore this email.

Thanks,

The Virtual TA Team
"""
        mail.send(message)
        return jsonify({"message": "Please check your email for the password reset link"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/reset_password', methods=['POST'])
def reset_password():
    """
    This method allows user to reset their password to a new one
    """
    try:
        data = request.get_json()
        email = data.get('email')
        token = data.get('token')
        new_password = data.get('new_password')

        if not all([email, token, new_password]):
            return jsonify({'error': 'Missing data'}), 400

        result = user_repository.reset_password(email, token, new_password)
        if result == "Password changed successfully":
            return jsonify({'message': result}), 200
        else:
            return jsonify({'error': result}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
