'''
This module contains the UserService class, which is responsible for handling business logic related to user operations.

@author:
- Sanjit Verma (skverma)
- Dinesh Kannan (added [password_reset_token_generator, reset_password])
'''
from pymongo.collection import Collection
import bcrypt
import secrets
from datetime import datetime, timedelta, timezone
from model.user_model import User
import re

class UserService:
    def __init__(self, collection: Collection):
        """Initialize the UserService with a MongoDB collection."""
        self.collection = collection

    def create_user(self, email, password, first_name, last_name):
        # Validate password
        if not self.validate_password(password):
            return {
                "error": "Password must be at least 8 characters long, contain a number, an uppercase letter, and a special character"
            }, 400

        # Create user instance
        user = User(email=email, password=password, first_name=first_name, last_name=last_name)
        
        # Check if the user already exists
        if self.collection.find_one({"email": user.email}):
            return {"error": "Email already exists"}, 409  

        # Hash the password
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        user_data = user.model_dump(mode='json')
        user_data['password'] = hashed_password

        insert_result = self.collection.insert_one(user_data)
        if insert_result.inserted_id:
            return {"message": "User created successfully"}, 201  
        else:
            return {"error": "Failed to create user"}, 500

    def authenticate_user(self, email, password):
        """Check if a user's email and password are in the DB and authenticate user."""
        user = self.collection.find_one({"email": email})
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return True, "Login successful", user
        return False, "Invalid email or password", None
    
    def find_user_by_email(self, email):
        """Find a user by their email."""
        return self.collection.find_one({"email": email})
    
    def password_reset_token_generator(self, email):
        """Generating password reset token and saving it with an expiration time."""
        token = secrets.token_urlsafe(16)
        expiration_time = datetime.now(timezone.utc) + timedelta(minutes=15) #15 minutes expiration of token
        self.collection.update_one(
            {"email": email},
            {"$set": {"reset_token": token, "token_expiration": expiration_time}}
        )
        return token
    
    def reset_password(self, email, token, new_password):
        """Reseting the password of the user with the new password recieved"""
        user = self.find_user_by_email(email)
        current_time = datetime.now(timezone.utc)

        if user and user.get('reset_token') == token:
            token_expiration = user.get("token_expiration").replace(tzinfo=timezone.utc)
            if token_expiration > current_time:
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
                self.collection.update_one(
                    {"email": email},
                    {"$set": {"password": hashed_password},
                    "$unset": {"reset_token": "", "token_expiration": ""}}
                )
                return "Password changed successfully"
            return "Link expired"
        return "Password could not be changed"

    @staticmethod
    def validate_password(password):
        if len(password) < 8:
            return False
        if not re.search(r"\d", password):
            return False
        if not re.search(r"[A-Z]", password):
            return False
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_]", password):
            return False
        return True
