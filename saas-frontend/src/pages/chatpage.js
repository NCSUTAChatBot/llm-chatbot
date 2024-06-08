/**
 * @file ChatPage.js is a file that contains the chat page components
 * 
 * @author sanjitkverma (skverma)
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {


    // ENV VARIABLES
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const CHAT_WELCOME = process.env.REACT_APP_CHAT_WELCOME;
    const CHAT_WELCOME_TEXT = process.env.REACT_APP_CHAT_WELCOME_TEXT;
    const LEFT_IMAGE_URL = process.env.REACT_APP_LEFT_IMAGE_URL;
    const RIGHT_IMAGE_URL = process.env.REACT_APP_RIGHT_IMAGE_URL;

    // This hook is used to navigate between different pages
    const navigate = useNavigate();
    // This hook is used to store the user's question
    const [question, setQuestion] = useState('');
    // This hook is used to store the chat messages
    const [messages, setMessages] = useState([]);
    // This hook is used to store the reference to the last message
    const messageEndRef = useRef(null);
    // This hook is used to store the state of the help popup
    const [showHelpPopup, setShowHelpPopup] = useState(false);
    // This hook is used to store the information of the user currently logged in
    const [userInfo, setUserInfo] = React.useState(null);
    // This hook is used to set 
    const [showDropdown, setShowDropdown] = useState(false);


    // This function is called when the user clicks on the Exit button
    const handleClearChat = async () => {
        try {
            // Make the API call to clear the backend chat history (set to localhost for now)
            const response = await fetch('http://127.0.0.1:8000/chat/clear_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            // If the response is successful, clear the chat history on the frontend
            if (response.ok) {
                setMessages([]);
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    // This function is called when the user clicks on the Feedback button
    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    // This function is called when the user clicks on the Help button
    const handleToggleHelpPopup = () => {
        setShowHelpPopup(prev => !prev);
    };

    // This function is called when the user clicks on the Start New Chat button
    const handleNewChat = async () => {
        try {
            // Make the API call to clear the backend chat history (set to localhost for now)
            const response = await fetch('http://127.0.0.1:8000/chat/clear_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            // If the response is successful, clear the chat history on the frontend
            if (response.ok) {
                setMessages([]);
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    const handleLogout = async () => {
        try {
            // Make the API call to clear the backend chat history (set to localhost for now)
            const response = await fetch('http://127.0.0.1:8000/user/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            // If the response is successful, clear the chat history on the frontend
            if (response.ok) {
                setMessages([]);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');
                navigate('/');
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    const handleExit= async () => {
        navigate('/');
    }

    // This function is called when the user submits a question
    const handleSubmit = async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();
        // If the question is empty, return
        if (!question.trim()) return;
        // Add the user's question to the chat
        const userMessage = { text: question, sender: 'user' };
        // Update the chat messages
        setMessages(messages => [...messages, userMessage]);
        // Clear the input field
        setQuestion('');

        // Make the API call to get the chatbot's response
        try {
            // Make the API call to get the chatbot's response (set to localhost for now)
            const response = await fetch('http://127.0.0.1:8000/chat/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question.trim() })
            });
            // If the response is not successful, throw error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the response data
            const data = await response.json();
            // Add the chatbot's response to the chat
            const botMessage = { text: data.answer.answer, sender: 'bot' };
            // Update the chat messages
            setMessages(messages => [...messages, botMessage]);
            // Scroll to the last message
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // This function is called to render the message text and animate it for the bots response
    const renderMessageText = (text, sender) => {
        // If the text is a string and the sender is the bot, split the text into characters and animate them
        if (typeof text === 'string' && sender === 'bot') {
            return text.split('').map((char, index) => (
                // Add a span element for each character with an animation delay
                <span key={index} className="chat-char" style={{ animationDelay: `${index * 0.015}s` }}>
                    {char}
                </span>
            ));
        } else {
            return text;
        }
    };

    // This hook is used to scroll to the last message when a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            // Scroll to the last message with a smooth behavior
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // This hook is used to load and set user information from localStorage
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    const toggleDropdown = () => setShowDropdown(!showDropdown);


    return (
        <div className='chat-page'>
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER}</h1>
                <div className="buttons">
                    {showHelpPopup && (
                        <div className="overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, .8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div className="name-chat-popup">
                                <div className="popup-header">
                                    <span className="popup-title">Need Assistance?</span>
                                    <button onClick={() => setShowHelpPopup(false)} className="popup-cancel-button">X</button>
                                </div>
                                <div className="popup-body">
                                    <p>Type you prompt and patiently wait for the model to generate the response. </p>
                                    <p>Please leave feedback on your responses and report any bugs using the Feedback button so we can improve the chatbot.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="help-button" onClick={handleToggleHelpPopup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                    <button className="start-chat" onClick={handleNewChat}>Start New Chat </button>
                    <button type="submit" className="clearChat" onClick={handleClearChat}>Clear Chat</button>
                    < div classname="userInfo">
                    {userInfo ? (
    <div className="userInfo" onClick={toggleDropdown}>
    Welcome, {userInfo ? userInfo.name : "Guest"}
    {showDropdown && (
        <div className='user-dropdown'>
            <button type="submit" className="user-dropdown-button" onClick={handleLogout}>Logout</button>
            <button className="user-dropdown-button" onClick={handleFeedback}>Leave Feedback</button>
        </div>
    )}
    <svg style = {{paddingLeft: "5"}}xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 24 24" strokeWidth="3" stroke="white" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
    </svg>

</div>

) : (
    <div className="userInfo" onClick={toggleDropdown}>
        Welcome, Guest
        {showDropdown && (
            <div className='user-dropdown'>
                <button onClick={handleExit}>Logout</button>
            </div>
        )}
    </div>
)}
                    </div>
                    
                </div>
            </div>
            <aside className="sidebar">
                <ul>
                    <li> What is DRY?</li>
                    <li> What is SAAS?</li>
                    <li> Who are the authors of the textbook?</li>
                    <li> CSC 517 Project 1 Grading</li>
                </ul>
            </aside>
            <main style={{ flex: 1, overflowY: 'hidden', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-container">
                    {messages.length === 0 ? (
                        <div >
                            <p className="chat-welcome">{CHAT_WELCOME}</p>
                            <p className="chat-welcome-text">{CHAT_WELCOME_TEXT}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={`${process.env.PUBLIC_URL + LEFT_IMAGE_URL}`} alt="NC STATE UNIVERSITY" style={{ width: '200px', height: 'auto', margin: '40px' }} />
                                <img src={`${process.env.PUBLIC_URL + RIGHT_IMAGE_URL}`} alt="Open AI" style={{ width: '190px', height: '98px', margin: '40px' }} />
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="sender">{msg.sender === 'user' ? 'You' : 'SAAS Chatbot'}</div>
                                <div className="text">
                                    {msg.sender === 'bot' ? renderMessageText(msg.text, msg.sender) : msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messageEndRef} />
                </div>
                <div className="input-row">
                    <input
                        type="text"
                        id="question"
                        placeholder="Type a prompt"
                        className="input-field"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className="submit-chat" onClick={handleSubmit}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
                        </svg>
                    </button>

                </div>
                <div className="warning-message">
                    Chatbot can make mistakes. Please verify sensitive information.
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
