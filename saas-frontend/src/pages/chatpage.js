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
    const [currentChatTitle, setCurrentChatTitle] = useState(''); // state for current chat title
    const [savedChatTitles, setSavedChatTitles] = useState([]); // State for saved chat titles
    const [deletingChatTitle, setDeletingChatTitle] = useState(null);
    const [isNewChat, setIsNewChat] = useState(false); // Track if new chat button was clicked
    const [latestChatTitle, setLatestChatTitle] = useState('');

    // This hook is used to set 
    const [showDropdown, setShowDropdown] = useState(false);

    // This function is called when the user clicks on the refresh button
    const handleRefreshChat = async () => {
        try {
            if (!currentChatTitle) {
                console.error("No chat selected to refresh.");
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/chat/get_chat_by_title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    chatTitle: currentChatTitle
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            } else {
                throw new Error('Failed to fetch chat messages.');
            }
        } catch (error) {
            console.error('Error refreshing chat messages:', error);
        }
    };

    const selectChat = async (title) => {
        setCurrentChatTitle(title); // Set the current chat for data operations
        try {
            const response = await fetch('http://127.0.0.1:8000/chat/get_chat_by_title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userInfo.email, chatTitle: title })
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
            } else {
                console.error('Failed to fetch messages for selected chat');
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
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
        const response = await fetch('http://127.0.0.1:8000/chat/clear_chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            setMessages([]);
            setCurrentChatTitle('');
            setIsNewChat(true); // Indicate that a new chat was created
            setLatestChatTitle(''); // Reset the latest chat title
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

    const handleExit = async () => {
        navigate('/');
    }

    const handleDeleteChat = async (chatTitle) => {
        let isMounted = true;
        try {
            // Add class to start animation
            setDeletingChatTitle(chatTitle);

            // Wait for animation to complete (300ms in this case)
            setTimeout(async () => {
                // Make API call to delete chat
                const response = await fetch('http://127.0.0.1:8000/chat/delete_chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userInfo.email, chatTitle })
                });

                if (response.ok) {
                    // Update the state to remove the chat title after deletion
                    setSavedChatTitles(titles => titles.filter(title => title !== chatTitle));
                } else {
                    throw new Error('Failed to delete chat');
                }
            }, 300); // Match this duration with your CSS transition duration
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
        return () => { isMounted = false; };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!question.trim() || !userInfo.email) return;
    
        const email = userInfo.email;
        let newChatTitle = currentChatTitle;
    
        if (!currentChatTitle) {
            newChatTitle = question.trim();
            setCurrentChatTitle(newChatTitle);
            setLatestChatTitle(newChatTitle); 
        }
    
        const userMessage = { text: question, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setQuestion('');
    
        try {
            const response = await fetch('http://127.0.0.1:8000/chat/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, question: question, chatTitle: newChatTitle })
            });
            if (response.ok) {
                const data = await response.json();
                const botMessage = { text: data.botMessage.text, sender: 'bot' };
                setMessages(messages => [...messages, botMessage]);
    
                if (!savedChatTitles.includes(newChatTitle)) {
                    // Add the new chat title to the top of the list
                    setSavedChatTitles(titles => [newChatTitle, ...titles]);
                    setIsNewChat(false); // Reset the state after adding the new chat title
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error submitting question:', error);
            setMessages(prev => prev.slice(0, -1)); // Remove the last message on error
        }
    };
    
    useEffect(() => {
        const fetchSavedChats = async () => {
            if (userInfo) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/chat/get_saved_chats?email=${userInfo.email}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSavedChatTitles(data.savedChatTitles); // Sorted by backend
                    } else {
                        throw new Error('Failed to fetch saved chats');
                    }
                } catch (error) {
                    console.error('Error fetching saved chats:', error);
                }
            }
        };

        fetchSavedChats();
    }, [userInfo]);

    useEffect(() => {
        if (currentChatTitle) {
            selectChat(currentChatTitle);
        }
    }, [currentChatTitle]);

    useEffect(() => {
        const clearChatOnRefresh = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/chat/clear_chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    setMessages([]);
                    setCurrentChatTitle('');
                } else {
                    throw new Error('Failed to clear chat history on the backend.');
                }
            } catch (error) {
                console.error('Error clearing chat history:', error);
            }
        };
        clearChatOnRefresh();
    }, []);

    const renderMessageText = (text, sender) => {
        if (typeof text === 'string' && sender === 'bot') {
            return text.split('').map((char, index) => (
                <span key={index} className="chat-char" style={{ animationDelay: `${index * 0.015}s` }}>
                    {char}
                </span>
            ));
        } else {
            return text;
        }
    };

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
            <div className="top-barchat">
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                    <button className="start-chat" onClick={handleNewChat} title="Start a new chat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5=" stroke="currentColor" style={{ width: '22px', height: '22px' }} >
                            <path strokeLinecap="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>

                    </button>
                    <button type="submit" className="refreshChat" onClick={handleRefreshChat} title='Refresh Chat'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{ width: '22px', height: '22px' }}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>


                    </button>
                    < div className="userInfo">
                        {userInfo ? (
                            <div className="userInfo" onClick={toggleDropdown}>
                                Welcome, {userInfo ? userInfo.name : "Guest"}
                                {showDropdown && (
                                    <div className='user-dropdown'>
                                        <button type="submit" className="user-dropdown-button" onClick={handleLogout}>Logout</button>
                                        <button className="user-dropdown-button" onClick={handleFeedback}>Leave Feedback</button>
                                    </div>
                                )}
                                <svg style={{ paddingLeft: "5" }} xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 24 24" strokeWidth="3" stroke="white" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
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
        {savedChatTitles.length === 0 ? (
            <li className="empty-message">
                Saved Chats appear here
                <br />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{ marginTop: '20px', color: '#888', width: '30px', height: '30px' }}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
            </li>
        ) : (
            savedChatTitles.map((title, index) => (
                <li key={index} className={`${currentChatTitle === title ? 'selected' : ''} ${deletingChatTitle === title ? 'deleting' : ''}`}
                    onClick={() => selectChat(title)}>
                    {title === latestChatTitle ? (
                        title.split('').map((char, i) => (
                            <span key={i} className="chat-char" style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
                        ))
                    ) : (
                        <span>{title}</span>
                    )}
                    {currentChatTitle !== title && (
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(title);
                            }}
                            title="Delete Chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                        </button>
                    )}
                </li>
            ))
        )}
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
