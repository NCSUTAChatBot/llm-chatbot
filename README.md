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

1.  Install the packages from `requirements.txt`.

```python
pip install -r requirements.txt
```

1.  (Optional) The `requirments.txt` might be out of date. Install the package prompted from the terminal.

2.  Start the server.

```python
python app.py
```

### Running the FrontEnd

1.  Navigate to the folder saas-frontend
   
```
cd saas-frontend
```

2.  Install the packages for the frontend.

```node
npm install
```

2.  Start the server.

```node
npm start
```

## Version Update 2024/4/22

*   Supports loading indicator when waiting for a response from openai gpt backend.

## Version Update 2024/5/16

*   @author sanjit verma

*   Revised REACT Frontend and code commenting

*   Backend API Integration

