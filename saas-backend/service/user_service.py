'''
This module contains the UserService class, which is responsible for handling business logic related to user operations.

@author Sanjit Verma (skverma)
'''
from repository.user_repository import UserRepository
from model.user_model import User
from pydantic import EmailStr, ValidationError
import re

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def create_user(self, email, password, first_name, last_name):
        # Validate password
        if not self.validate_password(password):
            return {
                "error": "Password must be at least 8 characters long, contain a number, an uppercase letter, and a special character"
            }, 400

        # Create user instance
        user = User(email=email, password=password, first_name=first_name, last_name=last_name)
        return self.user_repository.create_user(user)

    def authenticate_user(self, email, password):
        return self.user_repository.authenticate_user(email, password)
    
    def find_user_by_email(self, email):
        """Service method to find a user by their email address."""
        return self.user_repository.find_user_by_email(email)

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
    

