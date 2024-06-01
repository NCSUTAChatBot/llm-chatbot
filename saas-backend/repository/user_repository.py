'''
This module contains the UserRepository class, which is responsible for handling user data in the database.

@author by Sanjit Verma
'''
from pymongo.collection import Collection
import bcrypt
from model.user_model import User

class UserRepository:
    def __init__(self, collection: Collection):
        """Initialize the UserRepository with a MongoDB collection."""
        self.collection = collection

    def create_user(self, user: User):
        """Create a new user in the database."""
        # Check if the user already exists
        if self.collection.find_one({"email": user.email}):
            return {"error": "User already exists"}, 409  

        # Hash the password
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        user_data = user.dict()
        user_data['password'] = hashed_password

        insert_result = self.collection.insert_one(user_data)
        if insert_result.inserted_id:
            return {"message": "User created successfully"}, 201  
        else:
            return {"error": "Failed to create user"}, 500  

    def authenticate_user(self, email, password):
        """Check if a user's email and password are in thg DB and authenticate user."""
        user = self.collection.find_one({"email": email})
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return True, "Login successful"
        return False, "Invalid email or password"

    def find_user_by_email(self, email):
        """Find a user by their email."""
        return self.collection.find_one({"email": email})
