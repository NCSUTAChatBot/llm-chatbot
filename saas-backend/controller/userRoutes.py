'''
This file contains the routes for the user API.

@authored by Sanjit Verma
'''
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
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
        valid, message = user_service.authenticate_user(email, password)
        if valid:
            return jsonify({'message': message}), 200
        else:
            return jsonify({'error': message}), 401
    except ValidationError as e:
        return jsonify({'error': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
