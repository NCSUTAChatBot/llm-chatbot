'''
This file tests the course evaluation API by uploading files and asking a question.

@author Sanjit Verma (skverma)
'''
import requests

def test_upload_and_ask():
    # URL of the upload endpoint
    upload_url = 'http://127.0.0.1:8000/courseEvaluation/upload'
    # URL of the ask endpoint
    ask_url = 'http://127.0.0.1:8000/courseEvaluation/ask'

    # Prepare the first file for upload
    filepath1 = r"C:\Users\sanji\Downloads\Copy of Comments for CSC 216 002 (Term 2108).xlsx"
    with open(filepath1, 'rb') as file1:
        files = {
            'file': (
                'Copy of Comments for CSC 216 002 (Term 2108).xlsx',
                file1,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        }
        # Simulate file upload
        upload_response1 = requests.post(upload_url, files=files)

    # Check if the first upload was successful
    if upload_response1.status_code == 200:
        upload_data1 = upload_response1.json()
        session_id = upload_data1['session_id']
        
        # Prepare the second file for upload
        filepath2 = r"C:\Users\sanji\Downloads\this is a test course evaluation.xlsx"
        with open(filepath2, 'rb') as file2:
            files = {
                'file': (
                    'Copy of Comments for CSC 216 002 (Term 2108).xlsx',
                    file2,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            }
            data = {'session_id': session_id}
            # Simulate file upload
            upload_response2 = requests.post(upload_url, files=files, data=data)
        
        # Check if the second upload was successful
        if upload_response2.status_code == 200:
            upload_data2 = upload_response2.json()
            
            # Prepare data for asking a question
            question_data = {
                "session_id": session_id,
                "question": "Who is the professor?", 
            }
            headers = {'Content-Type': 'application/json'}
            ask_response = requests.post(ask_url, json=question_data, headers=headers)

            # Print or assert the response
            print("Ask Response:", ask_response.text)
        else:
            print("Second upload failed:", upload_response2.status_code, upload_response2.text)
    else:
        print("First upload failed:", upload_response1.status_code, upload_response1.text)

# Run the test
test_upload_and_ask()
