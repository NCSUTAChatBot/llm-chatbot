# ta-chatbot  
![Static Badge](https://img.shields.io/badge/slack-channel-000435?link=https%3A%2F%2Fllmchatbotproject.slack.com%2F)


## Contributing

*   Feel free to create your version of this repo by creating a new branch with your name and what you plan to do, e.g. haoze/multi-files

*   Don't directly make any changes on the main branch, this is the "stable" branch for deployment.

*   One more thing, you may need an openai gpt api key to get the response from them. If you only work on UI and front end, you might not need this.

*   Need help setting up: contact me at skverma@ncsu.edu

## Steps to Run Application

1.  Start the Backend Server: Navigate to the backend directory and run the command to launch the backend server.

2.  Launch the Frontend: Open a new terminal window, go to the saas-frontend directory, and start the frontend application.

3.  Access the Application: Once both servers are running, open your web browser and visit <http://localhost:3000> to access the application.


## Running the FrontEnd

1.  Navigate to the folder saas-frontend
   
```
cd saas-frontend
```
2. Add the following .env File under the saas-frontend folder (optional: customize for your school and IP adress)
```
# .env file for NC State University
# @author Sanjit Verma

#VCL: default set to localhost
REACT_APP_API_URL=http://127.0.0.1:8000 

# NAVBAR
REACT_APP_NAVBAR_HEADER="Virtual TA"
REACT_APP_FEEDBACK_FORM_URL="https://forms.gle/5swJdyyfSdQxGww69"

# LANDING PAGE
REACT_APP_MODALBODYTEXT="Please login or create an account. This Chatbot supports asking questions from the textbook: Fundamentals of Parallel Multicore Architecture by Yan Solihin."
REACT_APP_BACKGROUND_IMAGE_URL="/_MAH0122.jpg"
REACT_APP_LFOOTER="v1.0.0"
REACT_APP_RFOOTER=""
REACT_APP_FRONT_LOGO="/ncstate-brick-4x1-blk-max.png"

# CHAT PAGE
REACT_APP_CHAT_WELCOME="Hello, "
REACT_APP_CHAT_WELCOME_TEXT="How can I help you today?"


```
3.  Install the packages for the frontend.

```node
npm install
```

4.  Start the server.

```node
npm start
```

## Running the Backend
Contact Sanjit Verma (skverma@ncsu.edu) to be added to the MongoDB database for your username and password

1.  Navigate to the folder saas-backend
2.  Install the packages from `requirements.txt`.

```python
pip install -r requirements.txt
```
(Optional) The `requirments.txt` might be out of date. Install the package prompted from the terminal.

3. Add the following .env File under the saas-backend folder 
```
MONGODB_URI="mongodb+srv://<username>:<password>@chatbot.3zncvhn.mongodb.net/?retryWrites=true&w=majority&appName=chatbot"
MONGODB_DATABASE=chatbot
MONGODB_VECTORS= MONGODB_VECTORS
MONGODB_VECTOR_INDEX= MONGODB_VECTOR_INDEX
MONGODB_USERS= MONGODB_USERS
OPENAI_API_KEY= <YOU API KEY HERE>
LANGFUSE_PUBLIC_KEY = <YOU API KEY HERE>
LANGFUSE_SECRET_KEY = <YOU API KEY HERE>
LANGFUSE_HOST = "https://us.cloud.langfuse.com"

```

4.  Start the server.

```python
python app.py
```

## Setting up LangFuse
We track our LLM performance using Langfuse. 

What it is: Langfuse is a platform designed for logging, monitoring, and observability of large language models (LLMs). It is not a testing framework. Instead, Langfuse provides tools for tracking the performance, usage, and behavior of LLMs in real-time. Use it to optimize models perfomance, cost and debug issues.

Please contact Nirmal Joji (nsjoji@ncsu.edu) to be added to the project on LangFuse and get the API Keys or if you need assistance with LangFuse


## Version Updates

| Date       | Author &nbsp; &nbsp;          | Changes                                                                                           |
|------------|----------------|---------------------------------------------------------------------------------------------------|
| 2024/4/22  | Haoze Du       | Supports loading indicator when waiting for a response from OpenAI GPT backend.                   |
| 2024/5/16  | Sanjit Verma   | Revised REACT Frontend and code commenting. Backend API Integration.                               |
| 2024/5/31  | Sanjit Verma   | Added Static chat history sidebar in chat page. Added env configs for frontend.                    |
| 2024/6/01  | Sanjit Verma   | Restructured backend into saas-backend along with model, repo, service, and controller structure. Added support API endpoint for login and create user.  |
| 2024/6/05  | Dinesh Kannan  | Created Login and Signup pages and connected them to the database.                                 |
| 2024/6/08  | Sanjit Verma   | UI changes for login and signup page. Chat history functionality added.                            |
| 2024/6/16  | Sanjit Verma   | New Backend System for LLM. MongoDB Vector Store generate and load implemented.                    |
| 2024/6/18  | Sanjit Verma   | Implemented backend/query system into API and integrated with existing frontend.  UI improvements to the chat page. Added Font packs.                  |
| 2024/6/20  | Sanjit Verma   | Implemented chat streaming support in backend system. Adjusted frontend logic to incorporate chat streaming. |
| 2024/6/21  | Dinesh Kannan  | Guest mode removed, app authentication protection. Input Disabling while chat streaming.           |
| 2024/6/25  | Sanjit Verma   | IP hardcoding removed, added to env file.                                                          |
| 2024/6/27  | Nirmal Joji   | Langfuse integration and project setup                                                          |




  
