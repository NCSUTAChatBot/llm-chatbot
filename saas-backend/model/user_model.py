'''
This module contains the User model class, which is responsible for defining the user data structure.

@authored by Sanjit Verma
'''
from pydantic import BaseModel, EmailStr, Field
from typing import Dict

class User(BaseModel):
    email: EmailStr
    password: str = Field(...)
    first_name: str
    last_name: str
    savedChats: Dict[str, dict] = {}
