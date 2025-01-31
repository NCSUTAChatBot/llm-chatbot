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
MONGODB_VECTOR_INDEX_WEBSITE= MONGODB_VECTOR_INDEX_WEBSITE

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
| 2024/7/4  | Sanjit Verma   | Updated Signup page, Added LangFuse User logging                                                           |
| 2024/7/6  | Sanjit Verma   | Added Guest Mode for Users                                                       |
| 2024/7/7  | Sanjit Verma   | Improved Reset password UI and setup mail account                                                    |
| 2024/7/18  | Sanjit Verma   | Fixed chat routing for Virtual TA and Course Evaluations, added CE landing page                                          |
| 2024/7/22  | Sanjit Verma   | Implemented basic backend RAG Chain for Course Eval stream, created chatpage for stream                                        |
| 2024/7/27  | Sanjit Verma   | TaChatbot UI refactoring to use MUI                                        |
| 2024/8/15  | Sanjit Verma   | CE Stream, Implemented basic version with session ID                                      |
| 2024/8/15  | Nirmal Joji   | CE Stream, Implemented CE stream refactor                                      |
| 2024/8/25  | Nirmal Joji   | CE Stream, Implemented CE stream refactor                                      |
| 2024/9/1  | Nirmal Joji + Deepak Rajendran | Markdown Interpreter refactor + UI styling fixes                                     |
| 2024/9/3  | Sanjit Verma | TA Chatbot User authentication and permissions portal, removed guest mode, website auth refactoring                                   |
| 2024/9/15 | Deepak | Chatbot History Context                               |
| 2024/9/15 | Nirmal Joji | pause stream option and button, scrolling issue resolved, streaming issue fix                               |
| 2024/9/15 | Amrita Visalam | pdf generation and download chat improvements                              |
| 2024/9/30 | Nirmal Joji | Sidebar design improved and added swagger documentation                              |
| 2024/9/30 | Deepak | Added Css formatting for tables + Chat History context fix                             |
| 2024/9/30 | Amrita Visalam | Upload sanitization Course Evaluation                              |
| 2024/10/22 | Nirmal joji | Sidebar design improved and added swagger documentation                            |
| 2024/10/22 | Dinesh Kannan | Course Evaluation web scraping and adding information into database                            |
| 2024/10/22 | Amrita Visalam | CE Warning Banner for users                            |
| 2024/10/22 | Deepak | Configurable suggestions for landing page                          |
| 2024/10/23 | Sanjit Verma | Bug and UI Fixes, Renames Chatbot and Deployed new release                          |
| 2024/10/23 | Sanjit Verma & Deepak | New Sidebar modification + styling                         |
| 2024/10/23 | Amrita + Dinesh | CE Chatbot Bug fixes                      |
| 2024/10/23 | Sanjit Verma | Setup Github Actions Automatic Deployment Pipeline                    |





  
