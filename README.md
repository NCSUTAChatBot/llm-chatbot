# llm-chatbot  
![Static Badge](https://img.shields.io/badge/slack-channel-000435?link=https%3A%2F%2Fllmchatbotproject.slack.com%2F)


## Contributing

*   Feel free to create your version of this repo by creating a new branch with your name and what you plan to do, e.g. haoze/multi-files

*   Don't directly make any changes on the main branch, this is the "stable" branch for deployment.

*   One more thing, you may need an openai gpt api key to get the response from them. If you only work on UI and front end, you might not need this.

*   Please add your contributions with meaningful change message to the change log below

*   Need help setting up: contact me at skverma@ncsu.edu

## Steps to Run Application

1.  Start the Backend Server: Navigate to the backend directory and run the command to launch the backend server.

2.  Launch the Frontend: Open a new terminal window, go to the saas-frontend directory, and start the frontend application.

3.  Access the Application: Once both servers are running, open your web browser and visit <http://localhost:3000> to access the application.

4.  Access different chatbot streams: Navigate to [http://localhost:3000/virtualTA](http://localhost:3000/virtualTA) for the TA Chatbot and [http://localhost:3000/courseEvaluation](http://localhost:3000/courseEvaluation) for the Course Evaluation Chatbot


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
REACT_APP_MODALBODYTEXT="Virtual TA answers your basic questions, giving you more support for your learning journey."
REACT_APP_BACKGROUND_IMAGE_URL="/_MAH0122.jpg"
REACT_APP_LFOOTER=""
REACT_APP_RFOOTER=""
REACT_APP_FRONT_LOGO="/ncstate-brick-4x1-blk-max.png"

# CHAT PAGE
REACT_APP_CHAT_WELCOME="Hello, "
REACT_APP_CHAT_WELCOME_TEXT="How can I help you today?"


# NAVBAR CE
REACT_APP_CENAVBAR_HEADER="Course Evaluation LLM"

# CHAT PAGE CE
REACT_APP_CECHAT_WELCOME="Hello, "
REACT_APP_CECHAT_WELCOME_TEXT="Please upload your course evaluation."

# COURSE ENVIRONMENT
REACT_APP_COURSE_NUMBER="COURSE_NUMBER_HERE"
REACT_APP_COURSE_TITLE="COURSE_TITLE_HERE"

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
MONGODB_SUGGESTIONS= MONGODB_SUGGESTIONS

MONGODB_VECTORS_COURSEEVAL = MONGODB_VECTORS_COURSEEVALUATION
MONGODB_VECTOR_INDEX_COURSEEVAL = MONGODB_VECTOR_INDEX_COURSEEVALUATION

MONGODB_VECTORS_COURSEEVALUATION_DOCS = MONGODB_VECTORS_COURSEEVALUATION_DOCS
MONGODB_VECTOR_INDEX_TEMPUSER_DOC = vector_index

MONGODB_TEMPUSER = MONGODB_TEMPUSER
MONGODB_VECTOR_INDEX_TEMPUSER = MONGODB_VECTOR_INDEX_TEMPUSER

MONGODB_WHITELIST_USERS = MONGODB_WHITELIST_USERS
MONGODB_ACCESSCODES = MONGODB_ACCESSCODES

MONGODB_VECTORS_COURSEWEBSITE= MONGODB_VECTORS_COURSEWEBSITE
MONGODB_VECTOR_INDEX_WEBSITE= Course_Website

OPENAI_API_KEY= <YOU API KEY HERE>
LANGFUSE_PUBLIC_KEY = <YOU API KEY HERE>
LANGFUSE_SECRET_KEY = <YOU API KEY HERE>
LANGFUSE_HOST = "https://us.cloud.langfuse.com"
MAIL_USERNAME = "ncsutachatbot@gmail.com"
MAIL_PASSWORD = "uoop ghkv iaom cfna" 

```

4.  Start the server.

```python
python app.py
```

## Setting up LangFuse
We track our LLM performance using Langfuse. 

What it is: Langfuse is a platform designed for logging, monitoring, and observability of large language models (LLMs). It is not a testing framework. Instead, Langfuse provides tools for tracking the performance, usage, and behavior of LLMs in real-time. Use it to optimize models perfomance, cost and debug issues.

Please contact Nirmal Joji (nsjoji@ncsu.edu) to be added to the project on LangFuse and get the API Keys or if you need assistance with LangFuse

## Authenticating Users
Contact Sanjit Verma (skverma@ncsu.edu) for assistance. Users can be authenticated through the Virtual TA Admin Panel

To access the panel:

1. Navigate to the folder auth
2. Add the following .env File under the auth folder 
```
MONGODB_URI="mongodb+srv://<username>:<password>@chatbot.3zncvhn.mongodb.net/?retryWrites=true&w=majority&appName=chatbot"
MONGODB_DATABASE=chatbot
MONGODB_WHITELIST_USERS = MONGODB_WHITELIST_USERS
MONGODB_ACCESSCODES = MONGODB_ACCESSCODES
```
3. Run the tachatbotWhiteList.py app, install any required python libraries
4. Either add the user directly via email through the Authenticated Users tab or generate an access code to send to the user (no email required)






  
