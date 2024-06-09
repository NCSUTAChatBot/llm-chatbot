'''
This file contains the routes for the user API.

@author Sanjit Verma
'''
from flask import Blueprint, request, jsonify, session
from pymongo import MongoClient
from flask_jwt_extended import create_access_token, unset_jwt_cookies
from flask_mail import Mail, Message
from service.user_service import UserService
from repository.user_repository import UserRepository
from pydantic import ValidationError
from dotenv import load_dotenv
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
def login_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        valid, message , user = user_service.authenticate_user(email, password)
        if valid:
            session['user_email']= email
            access_token = create_access_token(identity=email)
            user_info={'name': user['first_name'], 'email': user['email']}
            return jsonify({"access_token":access_token, "message":message, "user_info": user_info} ), 200
        else:
            return jsonify({'error': message}), 401
    except ValidationError as e:
        return jsonify({'error': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    session.pop('user_email', None)
    return response

@user_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        user= user_repository.find_user_by_email(email)
        if not user:
            return jsonify({"error":"no user found with that email address"}), 404
        reset_token=user_repository.password_reset_token_generator(email)
        #reset_link=f"http://localhost:3000/reset_password?token={reset_token}&email={email}"
        #message= Message('Reset Your Password', sender='your-email@example.com', recipients=[email])
        #message.body = f"Please click on the link to reset your password: {reset_link}"
        #mail.send(message)
        return jsonify({"message": "Please check your email for the password reset link"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
