# TAChatBot

## TODO: some description

## For Collaborators

*   Feel free to create your version of this repo by creating a new branch with your name and what you plan to do, e.g. haoze/multi-files

*   Don't directly make any changes on the main branch, this is the "stable" branch for deployment.

*   One more thing, you may need an openai gpt api key to get the response from them. If you only work on UI and front end, you might not need this.

## Steps to Run Application

1.  Start the Backend Server: Navigate to the backend directory and run the command to launch the backend server.

2.  Launch the Frontend: Open a new terminal window, go to the saas-frontend directory, and start the frontend application.

3.  Access the Application: Once both servers are running, open your web browser and visit <http://localhost:3000> to access the application.

### Running the Backend
1.  Navigate to the folder saas-backend
2.  Install the packages from `requirements.txt`.

```python
pip install -r requirements.txt
```
(Optional) The `requirments.txt` might be out of date. Install the package prompted from the terminal.

3. Add the following .env File under the saas-backend folder (replace username and password with your unity ID, I have set this up please me skverma@ncsu.edu if there is an connection error)
```
MONGODB_URI="mongodb+srv://skverma:skverma@chatbot.3zncvhn.mongodb.net/?retryWrites=true&w=majority&appName=chatbot"
MONGODB_DATABASE=chatbot
MONGODB_VECTORS= MONGODB_VECTORS
MONGODB_VECTOR_INDEX= MONGODB_VECTOR_INDEX
MONGODB_USERS= MONGODB_USERS
OPENAI_API_KEY= <YOU API KEY HERE>

```

4.  Start the server.

```python
python app.py
```

### Running the FrontEnd

1.  Navigate to the folder saas-frontend
   
```
cd saas-frontend
```
2. Add the following .env File under the saas-frontend folder (optional: customize for your school)
```
# .env file for NC State University
# @author Sanjit Verma

# NAVBAR
REACT_APP_NAVBAR_HEADER="SAAS Chatbot @2024 NCSU CSC Dept"
REACT_APP_FEEDBACK_FORM_URL="https://forms.gle/5swJdyyfSdQxGww69"

# LANDING PAGE
REACT_APP_MODALBODYTEXT="Please login or create an account. This Chatbot supports asking questions from the textbook: Engineering SAAS: An Agile Approach Using Cloud Computing"
REACT_APP_BACKGROUND_IMAGE_URL="/_MAH0122.jpg"
REACT_APP_LFOOTER="SAAS beta v1.0.0"
REACT_APP_RFOOTER="@2024 NCSU CSC Dept"
REACT_APP_FRONT_LOGO="/ncstate-brick-4x1-blk-max.png"

# CHAT PAGE
REACT_APP_CHAT_WELCOME="Ask the SAAS Chatbot"
REACT_APP_CHAT_WELCOME_TEXT="Please wait patiently after asking a question. The chatbot may take a moment to generate a response."
REACT_APP_LEFT_IMAGE_URL="/ncstate-brick-2x2-blk.png"
REACT_APP_RIGHT_IMAGE_URL="/openAI.png"

```
3.  Install the packages for the frontend.

```node
npm install
```

4.  Start the server.

```node
npm start
```

## Version Update 2024/4/22

*   Supports loading indicator when waiting for a response from openai gpt backend.

## Version Update 2024/5/16

*   @author sanjit verma

*   Revised REACT Frontend and code commenting

*   Backend API Integration

## Version Update 2024/5/31

*   @author sanjit verma

*   Added Static chat history sidebar in chat page 

*   Added env configs for frontend

## Version Update 2024/6/01

*   @author sanjit verma

*   restructured backend into saas-backend along with model, repo, service and controller strcuture

*   added support API endpoint for login and create user

## Version Update 2024/6/05

*  @author dinesh kannan

*  Created Login and Signup pages and connected it to the database
