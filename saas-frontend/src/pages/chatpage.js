import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
    const navigate = useNavigate();
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef(null);
    const [showHelpPopup, setShowHelpPopup] = useState(false);


    const handleExit = async () => {
        try {
            // Make the API call to clear the backend chat history
            const response = await fetch('http://127.0.0.1:8000/clear_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setMessages([]);
                console.log('Chat history cleared on the backend.');
                navigate('/');
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    const handleFeedback = () => {
        window.open('https://forms.gle/5swJdyyfSdQxGww69');
    };

    const handleToggleHelpPopup = () => {
        setShowHelpPopup(prev => !prev);
    };

    const handleNewChat = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/clear_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setMessages([]);
                console.log('Chat history cleared on the backend.');
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!question.trim()) return;

        const userMessage = { text: question, sender: 'user' };
        setMessages(messages => [...messages, userMessage]);
        setQuestion('');

        try {
            const response = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question.trim() })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = { text: data.answer.answer, sender: 'bot' };
            setMessages(messages => [...messages, botMessage]);
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderMessageText = (text, sender) => {
        if (typeof text === 'string' && sender === 'bot') {
            return text.split('').map((char, index) => (
                <span key={index} className="chat-char" style={{ animationDelay: `${index * 0.022}s` }}>
                    {char}
                </span>
            ));
        } else {
            return text;
        }
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className='chat-page'>
            <div className="top-bar">
                <h1 className="title">SAAS Chatbot @2024 NCSU CSC Dept </h1>

                <div class="buttons">
                    {showHelpPopup && (
                        <div className="overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, .8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div className="name-chat-popup">
                                <div className="popup-header">
                                    <span className="popup-title">Need Assistance?</span>
                                    <button onClick={() => setShowHelpPopup(false)} className="popup-cancel-button">X</button>
                                </div>
                                <div className="popup-body">
                                    <p>Type you prompt and patiently wait for the model to generate the response. </p>
                                    <p>For best results, please ask questions related to the SAAS Textbook: Engineering Software as a Service: An Agile Approach Using Cloud Computing</p>
                                    <p>Please leave feedback on your responses and report any bugs using the Feedback button so we can improve the chatbot.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="help-button" onClick={handleToggleHelpPopup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style={{ width: '24px', height: '24px' }}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </button>
                    <button class="start-chat" onClick={handleNewChat}>Start New Chat </button>
                    <button class="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                    <button type="submit" class="exit" onClick={handleExit}>Exit</button>
                </div>
            </div>
            <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-container">
                    {messages.length === 0 ? (
                        <div >
                            <p className="chat-welcome">Ask the SAAS Chatbot  </p>
                            <p className="chat-welcome-text">Please wait for the response after asking one question. This Chatbot needs time to generate a reponse.</p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src="/ncstate-brick-2x2-blk.png" alt="NC STATE UNIVERSITY" style={{ width: '200px', height: 'auto', margin: '40px' }} />
                                <img src="/openAI.png" alt="Chatbot" style={{ width: '190px', height: '98px', margin: '40px' }} />
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
            </main>

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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
                    </svg>
                </button>
            </div>
        </div>



    );
};

export default ChatPage;
