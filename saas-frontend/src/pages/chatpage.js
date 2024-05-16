import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
    const navigate = useNavigate();
    const handleExit = () => {
        navigate('/');
    };
    const handleFeedback = () => {
        window.open('https://forms.gle/5swJdyyfSdQxGww69');
    };
    return (
        <div className='chat-page'>
            <div className="top-bar">
                <h1 className="title">SAAS Chatbot</h1>
                <div class="buttons">
                    <button className="help-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style={{ width: '24px', height: '24px' }}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                    <button class="start-chat">Start New Chat </button>
                    <button class="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                    <button type="submit" class="exit" onClick={handleExit}>Exit</button>
                </div>
            </div>
            <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div id="conversation" className='chat-container'></div>
            </main>

            <div className="input-row" >
                <input type="text" id="question" placeholder="Type a prompt" className="input-field" />
                <button type="submit" className="submit-chat">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
                    </svg>
                </button>

            </div>
        </div>



    );
};

export default ChatPage;
