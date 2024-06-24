/**
 * @file ChatPage.js is a file that contains the chat page components
 * 
 * @author Sanjit Verma (skverma)
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {


    // ENV VARIABLES
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const CHAT_WELCOME = process.env.REACT_APP_CHAT_WELCOME;
    const CHAT_WELCOME_TEXT = process.env.REACT_APP_CHAT_WELCOME_TEXT;

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
    // This hook is used to store the chat session key
    const [currentSessionKey, setCurrentSessionKey] = useState('');
    // This hook is used to store the saved chat session keys
    const [savedSessionKeys, setSavedSessionKeys] = useState([]);
    // This hook is used to store the session key that is being deleted
    const [deletingSessionKey, setDeletingSessionKey] = useState(null);
    // This hook is used to set  the state of the dropdown
    const [showDropdown, setShowDropdown] = useState(false);
    // This hook is used to store the animated titles state
    const [isLastMessageNew, setIsLastMessageNew] = useState(false);
    const suggestedContainerRef = useRef(null);
    const [chatTitle, setChatTitle] = useState('');

    // This function is called when the user clicks on the downloiad as pdf button
    const handleDownloadChat = async () => {
        if (!currentSessionKey) {
            console.error("No chat session selected to download.");
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/chat/export_single_chat_to_pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    sessionKey: currentSessionKey
                })
            });
            if (response.ok) {
                // Convert the response to a Blob representing the PDF file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat_${currentSessionKey}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error(`Failed to generate PDF. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error downloading chat PDF:', error);
        }
    };

    // This function is called when the user clicks on a saved chat session. It fetches the chat messages for the selected session
    //and sets the chat session key to be used
    const selectChat = async (sessionKey) => {
        setCurrentSessionKey(sessionKey);
        try {
            const response = await fetch('http://127.0.0.1:8000/chat/get_chat_by_session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userInfo.email, sessionKey: sessionKey })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
                setIsLastMessageNew(false);
            } else {
                console.error('Failed to fetch messages for selected session', response.status);
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

    // This function is called when the user clicks on the Start New Chat button. It handles chat sessions and message history 
    //when creating a new chat session using the new chat button
    const handleNewChat = async () => {
        try {
            setCurrentSessionKey('');  
            setMessages([]);

            const sessionResponse = await fetch('http://127.0.0.1:8000/chat/createSession', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userInfo.email })
            });
    
            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                setCurrentSessionKey(sessionData.sessionKey);  // Set the new session key
            } else {
                throw new Error('Failed to create a new chat session.');
            }
        } catch (error) {
            
        }
    };

    // This function is called when the user clicks on the Logout button
    const handleLogout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/user/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
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

    // This function is called when the user clicks on the delete button for a chat session
    const handleDeleteChat = async (sessionKey) => {
        try {
            setDeletingSessionKey(sessionKey);
            setTimeout(async () => {
                const response = await fetch('http://127.0.0.1:8000/chat/delete_chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userInfo.email, sessionKey: sessionKey })
                });

                if (response.ok) {
                    setSavedSessionKeys(keys => keys.filter(session => session.sessionKey !== sessionKey));
                    if (currentSessionKey === sessionKey) {
                        setCurrentSessionKey('');
                        setMessages([]);
                    }
                    setDeletingSessionKey(null);
                } else {
                    throw new Error('Failed to delete chat');
                }
            }, 300);
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };
    //used to update chat title of a session key that already exists
    const updateChatTitle = async (email, sessionKey, newTitle) => {
        await fetch('http://127.0.0.1:8000/chat/update_chat_title', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                sessionKey: sessionKey,
                newTitle: newTitle
            })
        }).then(response => response.json())
          .then(data => {
              console.log("Title updated:", data);
          })
          .catch(error => {
              console.error("Error updating title:", error);
          });
    };

    // This function is called when the user submits a question. It handles logic for creating session and managing message history
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!question.trim() || !userInfo.email) return;
        setIsLastMessageNew(true);
    
        const email = userInfo.email;
        const userMessage = { text: question, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setQuestion('');
        try {
            let response;
            let payload;
            //if no session key is set, assume we are creating a new session
            if (!currentSessionKey) {
                response = await fetch('http://127.0.0.1:8000/chat/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, question: question, chatTitle: question })
                });
                 // If a session key exists, continue the existing session with a new message
            } else {
                payload = { email, sessionKey: currentSessionKey, question };
                response = await fetch('http://127.0.0.1:8000/chat/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            if (response.ok) {
                // If no session key was set assume we are creating a new session
                if (!currentSessionKey) {
                    const data = await response.json();
                    setCurrentSessionKey(data.sessionKey);
    
                    //  re-fetch the ask endpoint with the new sessionKey for streaming
                    response = await fetch('http://127.0.0.1:8000/chat/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, sessionKey: data.sessionKey, question })
                    });

                    // Add the new session to the saved sessions list with the chat title
                    setSavedSessionKeys(prevKeys => [
                        { sessionKey: data.sessionKey, chatTitle: question },
                        ...prevKeys
                    ]);
                }

                // If the response body is present, handle streaming responses for displaying chat messages
                if (response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let aggregatedText = ''; // Buffer for the streamed text
    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
    
                        const chunk = decoder.decode(value, { stream: true });
                        aggregatedText += chunk;
                        
                        // Update messages without duplicating or adding unnecessary spaces
                        setMessages(messages => {
                            const lastMessage = messages[messages.length - 1];
                            if (lastMessage && lastMessage.sender === 'bot') {
                                lastMessage.text += chunk;
                                return [...messages.slice(0, -1), lastMessage];
                            } else {
                                return [...messages, { text: chunk, sender: 'bot' }];
                            }
                        });
                    }
                    
                    // Ensure the reader is closed
                    reader.releaseLock();
                }
    
                 // Update the session title in local state if necessary, based on session history
                if (currentSessionKey) {
                    setSavedSessionKeys(prevKeys => {
                        const sessionIndex = prevKeys.findIndex(session => session.sessionKey === currentSessionKey);
                        if (sessionIndex === -1) {
                             // If the session is not found in the local state add it with the new title
                            updateChatTitle(email, currentSessionKey, question);
                            return [{ sessionKey: currentSessionKey, chatTitle: question }, ...prevKeys];
                        } else {
                            // If found, check if it's the first message or if the title is 'Untitled Chat'
                            const updatedSessions = [...prevKeys];
                            if (!updatedSessions[sessionIndex].chatTitle) {
                                updatedSessions[sessionIndex].chatTitle = question;
                            }
                            return updatedSessions;
                        }
                    });
                }
            } else {
                throw new Error('Failed to submit message. Status: ' + response.status);
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove the last user message if there is an error
        } finally {
            // Enable the submit button again
            setIsLastMessageNew(false);
        }
    
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        const fetchSavedChats = async () => {
            if (userInfo && userInfo.email) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/chat/get_saved_chats?email=${userInfo.email}`);
                    if (response.ok) {
                        const data = await response.json();

                        if (Array.isArray(data.savedChatSessions)) {
                            setSavedSessionKeys(data.savedChatSessions);  // Update state with sorted session keys and titles
                        } else {
                            console.error('Invalid format for saved chat sessions:', data.savedChatSessions);
                            setSavedSessionKeys([]); // Set to empty array if the data format is not expected
                        }
                    } else {
                        console.error(`Failed to fetch saved chats with status: ${response.status}`);
                        setSavedSessionKeys([]);
                    }
                } catch (error) {
                    console.error('Error fetching saved chats:', error);
                    setSavedSessionKeys([]);
                }
            }
        };

        fetchSavedChats();
    }, [userInfo]);

    //use this to scroll vertically on suggested row
    useEffect(() => {
        const container = suggestedContainerRef.current;

        const handleWheel = (event) => {
            if (container) {
                event.preventDefault();
                container.scrollLeft += event.deltaY;
            }
        };

        if (container) {
            container.addEventListener('wheel', handleWheel);
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [suggestedContainerRef]);

    // This hook is used to clear the chat history on page refresh
    useEffect(() => {
        const container = suggestedContainerRef.current;

        const handleWheel = (event) => {
            if (container) {
                event.preventDefault();
                container.scrollLeft += event.deltaY;
            }
        };

        if (container) {
            container.addEventListener('wheel', handleWheel);
        } else {
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [suggestedContainerRef.current]);

    //cutrs off length for long chat titles
    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}` : text;
    };

    // This function is used to render the message text with a typing animation
    // const renderMessageText = (text, sender, isLatest) => {
    //     if (typeof text === 'string' && sender === 'bot' && isLatest) {
    //         const words = text.split(' ');
    //         let cumulativeIndex = 0;
    //         return (
    //             <span className="sentence">
    //                 {words.map((word, wordIndex) => {
    //                     return (
    //                         <span key={wordIndex} className="word">
    //                             {Array.from(word).map((char, charIndex) => {
    //                                 const style = {
    //                                     animationDelay: `${cumulativeIndex * 0.025}s`,
    //                                     animationName: 'typing'
    //                                 };
    //                                 cumulativeIndex++;
    //                                 return (
    //                                     <span key={charIndex} className="chat-char" style={style}>
    //                                         {char}
    //                                     </span>
    //                                 );
    //                             })}
    //                             {wordIndex < words.length - 1 && <span className="space">{' '}</span>}
    //                         </span>
    //                     );
    //                 })}
    //             </span>
    //         );
    //     } else {
    //         return text;
    //     }
    // };

    // const displayText = (text, sender) => {
    //     if (typeof text === 'string' && sender === 'bot') {
    //         const words = text.split(' ');
    //         return words.map((word, wordIndex) => (
    //             <span key={wordIndex} className="word">
    //                 {word.split('').map((char, charIndex) => (
    //                     <span key={charIndex} className="chat-char-no-animation">
    //                         {char}
    //                     </span>
    //                 ))}
    //                 {wordIndex < words.length - 1 && '\u00A0'}
    //             </span>
    //         ));
    //     } else {
    //         return text;
    //     }
    // };

    // This function is used to render the chat title with a typing animation
    const renderChatTitle = (title) => {
        return title.split('').map((char, index) => (
            <span
                key={index}
                className="chat-title-char"
                style={{ '--delay': `${index * 0.05}s` }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    // This hook is used to load and set user information from localStorage
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }else{
            navigate('/');
        }
    }, [navigate]);


    const toggleDropdown = () => setShowDropdown(!showDropdown);
    return (
        <div className='chat-page'>
            <div className="top-barchat">
                <div className="title-chatpage">{NAVBAR_HEADER} @2024 NCSU CSC Dept</div>
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
                <div className="sidebar-newchat">
                    <button className="start-chat" onClick={handleNewChat} >

                        New Chat
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button className="refresh-button" onClick={handleDownloadChat} title="Download Chat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    </button>
                </div>
                <ul>
                    {savedSessionKeys.length === 0 ? (
                        <li className="empty-message">
                            Saved Chats appear here
                            <br />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" style={{ marginTop: '20px', color: '#888', width: '30px', height: '30px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                        </li>
                    ) : (
                        savedSessionKeys.map((session, index) => (
                            <li key={index} className={`${currentSessionKey === session.sessionKey ? 'selected' : ''} ${deletingSessionKey === session.sessionKey ? 'deleting' : ''}`}
                                onClick={() => selectChat(session.sessionKey)}>
                                <span>{currentSessionKey === session.sessionKey ? renderChatTitle(truncateText(session.chatTitle, 53)) : truncateText(session.chatTitle, 53)}</span>
                                {currentSessionKey !== session.sessionKey && (
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteChat(session.sessionKey);
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
                        <div className='chatModal' >
                            <p className="chat-welcome">
                                {CHAT_WELCOME}
                                {userInfo ? `${userInfo.name} ${userInfo.last_name}` : 'Guest'}
                            </p>
                            <p className="chat-welcome-text">{CHAT_WELCOME_TEXT}</p>
                            <div className="suggested-section">
                                <p className="suggested-title">Suggested </p>
                                

                                <div className="suggested-container" ref={suggestedContainerRef}>
                                    <div className="suggested-box">
                                        <p>Explain Homework 1 Problem 1A </p>
                                        <small className='suggested-box-small'>I need help with problem 1</small>
                                    </div>
                                    <div className="suggested-box">
                                        <p>When is my professor's office hours?</p>
                                        <small className='suggested-box-small'>I need to discuss my last exam</small>
                                    </div>
                                    <div className="suggested-box">
                                        <p>Can you explain Chapter 2.2 of the Engineering SAAS textbook?</p>
                                        <small className='suggested-box-small'> I need a refresher of the content </small>
                                    </div>
                                    <div className="suggested-box">
                                        <p>When is our midterm 1 exam?</p>
                                        <small className='suggested-box-small'> I'm not sure when our next midterm is</small>
                                    </div>
                                    <div className="suggested-box">
                                        <p>What percentage of our class grade is projects?</p>
                                        <small className='suggested-box-small'>I want to know the project weight for our class</small>
                                    </div>
                                    <div className="suggested-box">
                                        <p>How can I contact my TA, Sanjit, for help?</p>
                                        <small className='suggested-box-small'>I need help debugging a issue in my code</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="sender">{msg.sender === 'user' ? 'You' : 'SAAS Chatbot'}</div>
                                <div className="text">
                                    {msg.text}
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
                            if (e.key === 'Enter' && !isLastMessageNew) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className="submit-chat" onClick={handleSubmit} disabled={isLastMessageNew}>
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