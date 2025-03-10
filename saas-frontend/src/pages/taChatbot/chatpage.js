/**
 * @file ChatPage.js is a file that contains the chat page components
 * 
 * @author Sanjit Verma (skverma)
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../globalStyles.css';
import { ModelSelector } from "./components/modelSelector";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, LayoutGrid, LogOut, HelpCircle } from "lucide-react";
const ChatPage = () => {

    // ENV VARIABLES
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const REACT_APP_LFOOTER = process.env.REACT_APP_LFOOTER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const CHAT_WELCOME = process.env.REACT_APP_CHAT_WELCOME;
    const CHAT_WELCOME_TEXT = process.env.REACT_APP_CHAT_WELCOME_TEXT;
    const apiUrl = process.env.REACT_APP_API_URL;

    // This hook is used to navigate between different pages
    const navigate = useNavigate();
    // This hook is used to store the user's question
    const [question, setQuestion] = useState('');
    // This hook is used to store the chat messages
    const [messages, setMessages] = useState([]);
    // This hook is used to store the reference to the last message
    const messageEndRef = useRef(null);
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
    const [showDropdown2, setShowDropdown2] = useState(false);
    // This hook is used to store the animated titles state
    const suggestedContainerRef = useRef(null);

    const [isStreaming, setIsStreaming] = useState(false);

    const [abortController, setAbortController] = useState(null);

    const [isAutoScroll, setIsAutoScroll] = useState(true);

    const chatContainerRef = useRef(null);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const [confirmDelete, setConfirmDelete] = useState(null);

    const [editingSessionKey, setEditingSessionKey] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const dropdownRef = useRef(null);

    const editInputRef = useRef(null);
    const helpDropdownRef = useRef(null);

    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [firstGuess, setFirstGuess] = useState('');

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const response = await fetch(`${apiUrl}/chat/suggestions`);  // Fetch data from the API
            if (!response.ok) {
                throw new Error('Error in fetching suggestions');
            }
            const data = await response.json();
            setSuggestedQuestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const suggestionContainerRef = useRef(null);

    useEffect(() => {
        const container = suggestionContainerRef.current;
        if (container) {
            const handleWheel = (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY;
                }
            };
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, []);

    const onSuggestedQuestionClick = (e, question) => {
        handleSubmit(e, question);
    };


    // This function is called when the user clicks on the download as pdf button
    const handleDownloadChat = async () => {
        if (!currentSessionKey) {
            console.error("No chat session selected to download.");
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/chat/export_single_chat_to_pdf`, {
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
        // Abort any ongoing stream
        if (isStreaming && abortController) {
            abortController.abort();
            setIsStreaming(false);
            setAbortController(null);
        }

        setCurrentSessionKey(sessionKey);
        try {
            const response = await fetch(`${apiUrl}/chat/get_chat_by_session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userInfo.email, sessionKey: sessionKey })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
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

    useEffect(() => {
        function handleClickOutside(event) {
            if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target)) {
                setShowDropdown2(false);
            }
        }
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (abortController) {
                abortController.abort();
            }
        };
    }, [abortController]);

    useEffect(() => {
        if (activeDropdown !== null) {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setActiveDropdown(null);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [activeDropdown]);

    // This function is called when the user clicks on the Start New Chat button. It handles chat sessions and message history 
    //when creating a new chat session using the new chat button
    const handleNewChat = async () => {
        // Abort any ongoing stream
        if (isStreaming && abortController) {
            abortController.abort();
            setIsStreaming(false);
            setAbortController(null);
        }

        try {
            setCurrentSessionKey('');
            setMessages([]);

            const sessionResponse = await fetch(`${apiUrl}/chat/createSession`, {
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
            console.error('Error creating new chat session:', error);
        }
    };

    // This function is called when the user clicks on the Logout button
    const handleLogout = async () => {
        try {
            const response = await fetch(`${apiUrl}/user/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                setMessages([]);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');
                window.location.href = '/virtualTA';
            } else {
                throw new Error('Failed to clear chat history on the backend.');
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    };



    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);  // Close the dropdown if clicked outside
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // This function is called when the user clicks on the delete button for a chat session
    const performDeleteChat = async (sessionKey) => {
        try {
            setDeletingSessionKey(sessionKey);
            const response = await fetch(`${apiUrl}/chat/delete_chat`, {
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
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    // Updated handleDeleteChat to set confirmation
    const handleDeleteChat = (sessionKey) => {
        setConfirmDelete(sessionKey);
    };

    // New function to handle confirmation
    const confirmDeleteChat = async () => {
        if (confirmDelete) {
            await performDeleteChat(confirmDelete);
            setConfirmDelete(null);
        }
    };

    // New function to handle cancellation
    const cancelDeleteChat = () => {
        setConfirmDelete(null);
    };




    const handleRenameChat = (session) => {
        setEditingSessionKey(session.sessionKey);
        setEditedTitle(session.chatTitle);
        setActiveDropdown(null); // Close the dropdown
    };


    //used to update chat title of a session key that already exists
    const updateChatTitle = async (email, sessionKey, newTitle) => {
        await fetch(`${apiUrl}/chat/update_chat_title`, {
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

    // Function to save the edited title
    const saveEditedTitle = async (sessionKey) => {
        if (editedTitle.trim() === '') {
            alert("Chat title cannot be empty.");
            return;
        }
        try {
            await updateChatTitle(userInfo.email, sessionKey, editedTitle.trim());
            setSavedSessionKeys(prevKeys => prevKeys.map(s =>
                s.sessionKey === sessionKey ? { ...s, chatTitle: editedTitle.trim() } : s
            ));
            setEditingSessionKey(null);
            setEditedTitle('');
        } catch (error) {
            console.error("Error renaming chat title:", error);
            alert("Failed to rename chat title. Please try again.");
        }
    };

    // Function to handle input blur
    const handleInputBlur = (sessionKey) => {
        saveEditedTitle(sessionKey);
    };

    // Function to handle key down in input
    const handleInputKeyDown = (e, sessionKey) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditedTitle(sessionKey);
        } else if (e.key === 'Escape') {
            setEditingSessionKey(null);
            setEditedTitle('');
        }
    };


    // This function is called when the user submits a question. It handles logic for creating session and managing message history
    // 2. Update handleSubmit to associate streams with session keys
    const handleSubmit = async (event, _question,_firstGuess) => {
    event.preventDefault();
    if (!_question.trim()) return;
    const effectiveFirstGuess = !currentSessionKey ? _firstGuess : '';
    const email = userInfo.email;
    let userMessage;
    if (effectiveFirstGuess===''){
        userMessage = { text: _question, sender: 'user'  };
    }
    else{
        userMessage = { text: _question, sender: 'user', first_guess: effectiveFirstGuess  };
    }
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setQuestion('');
    setFirstGuess('');
    try {
        let response;
        let payload;

            setIsStreaming(true);

            const controller = new AbortController();
            setAbortController(controller);

            // Capture the current session key
            const sessionKeyAtStart = currentSessionKey;

        // If no session key is set, assume creating a new session
        if (!currentSessionKey) {
            response = await fetch(`${apiUrl}/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, question: _question, firstGuess: effectiveFirstGuess, chatTitle: _question })
            });
        } else {
            payload = { email, sessionKey: currentSessionKey, question: _question, firstGuess: effectiveFirstGuess, history: messages.slice(-10) };
            response = await fetch(`${apiUrl}/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

            if (response.ok) {
                // Handle new session creation
                if (!currentSessionKey) {
                    const data = await response.json();
                    setCurrentSessionKey(data.sessionKey); // Set the new session key

                // Re-fetch the ask endpoint with the new sessionKey for streaming
                response = await fetch(`${apiUrl}/chat/ask`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, sessionKey: data.sessionKey, question: _question, firstGuess: _firstGuess })
                });

                    // Add the new session to the saved sessions list with the chat title
                    setSavedSessionKeys(prevKeys => [
                        { sessionKey: data.sessionKey, chatTitle: _question },
                        ...prevKeys
                    ]);
                }

                // Handle streaming responses
                if (response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let aggregatedText = ''; // Buffer for combined text (main response + analysis)
                    let isAnalysisStarted = false; // Track when First Guess Analysis starts

                    function updateMessages(chunk) {
                        setMessages((prev) => {
                            const lastMessage = prev[prev.length - 1];
                    
                            // Check if this chunk contains "[First Guess Analysis]"
                            if (chunk.includes('\n [First Guess Analysis]')) {
                                isAnalysisStarted = true; // Start appending analysis content
                                aggregatedText += '\n\n'; // Add spacing before analysis
                            }
                    
                            // Append chunks to aggregated text
                            aggregatedText += chunk;
                    
                            // Update or create a single combined message
                            if (lastMessage?.sender === 'bot' && lastMessage?.isCombined) {
                                // Update the existing combined message
                                return [...prev.slice(0, -1), { ...lastMessage, text: `Virtual TA\n${aggregatedText}` }];
                            } else {
                                // Create a new combined message
                                return [
                                    ...prev,
                                    {
                                        text: `Virtual TA\n${aggregatedText}`,
                                        sender: 'bot',
                                        isCombined: true, // Mark as combined message
                                    },
                                ];
                            }
                        });
                    }
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        if (controller.signal.aborted) break;
                    
                        const chunk = decoder.decode(value, { stream: true });
                        updateMessages(chunk); // Pass chunk to the external function
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
                            updateChatTitle(email, currentSessionKey, _question);
                            return [{ sessionKey: currentSessionKey, chatTitle: _question }, ...prevKeys];
                        } else {
                            // If found, check if it's the first message or if the title is 'Untitled Chat'
                            const updatedSessions = [...prevKeys];
                            if (!updatedSessions[sessionIndex].chatTitle) {
                                updatedSessions[sessionIndex].chatTitle = _question;
                            }
                            return updatedSessions;
                        }
                    });
                }
            } else {
                throw new Error('Failed to submit message. Status: ' + response.status);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error('Error submitting question:', error);
                setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove the last user message if there is an error
            }
        } finally {
            // Enable the submit button again
            setIsStreaming(false);
            setAbortController(null);
        }

        // messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePauseStream = async () => {
        console.log("pausing stream");
        if (abortController) {
            abortController.abort();
            setIsStreaming(false);
        }
        // Get the last message from the messages state
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && currentSessionKey) {
            try {
                const response = await fetch(`${apiUrl}/chat/pause_stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Origin": "*",
                    },
                    body: JSON.stringify({
                        email: userInfo.email,
                        sessionKey: currentSessionKey,
                        lastMessage: lastMessage
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to pause stream on server');
                }

                console.log('Stream paused successfully on server');
            } catch (error) {
                console.error('Error pausing stream:', error);
            }
        }
    };

    useEffect(() => {
        const chatContainer = chatContainerRef.current;

        const handleScroll = () => {
            if (!chatContainer) return;
            const { scrollTop, scrollHeight, clientHeight } = chatContainer;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            // Adjust threshold as needed
            const isAtBottom = distanceFromBottom < 60;

            setIsAutoScroll(isAtBottom);

            // Show or hide the scroll-to-top button
            const scrollToTopButton = document.querySelector('.scroll-to-top');
            if (scrollTop > 500) {
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        };

        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        if (isAutoScroll && messageEndRef.current) {
            // Delay the scrolling to ensure the DOM has updated
            requestAnimationFrame(() => {
                messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }, [messages, isAutoScroll]);

    // useEffect(() => {
    //     if (messageEndRef.current) {
    //         messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [messages]);

    useEffect(() => {
        const fetchSavedChats = async () => {
            if (userInfo && userInfo.email) {
                try {
                    const response = await fetch(`${apiUrl}/chat/get_saved_chats?email=${userInfo.email}`);
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

    // This hook is used to to change the height of the textarea based on the content
    const textareaRef = useRef(null);
    useEffect(() => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight - 20, 5 * 32)}px`;
    }, [question]);



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

    useEffect(() => {
        if (editingSessionKey && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingSessionKey]);

    // Function to scroll to the top of the chat container
    const scrollToTop = () => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // This useEffect hook adds a scroll event listener to the chat container
    useEffect(() => {
        const handleScroll = () => {
            const scrollToTopButton = document.querySelector('.scroll-to-top');
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer.scrollTop > 500) { // Show button when scrolled down more than 500px
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        };

        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    // This hook is used to load and set user information from localStorage
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
        else { //REMOVE FOR GUEST MODE
            navigate('/virtualTA/login');
        }
    }, [navigate]);


    const toggleDropdown = () => setShowDropdown(!showDropdown);
    const toggleDropdown2 = () => setShowDropdown2(!showDropdown2);

    const chatToDelete = savedSessionKeys.find(session => session.sessionKey === confirmDelete);

    return (
        <div className='chat-page'>
            <div className="top-barchat">
                <div className="title-chatpage">
                    <ModelSelector />
                </div>
                <div className="buttons">

                    <div className={"container"} ref={dropdownRef}>
                        <button className={"trigger"} onClick={toggleDropdown}>
                            <span className="avatar">
                                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'G'}
                            </span>
                            <ChevronDown className={"chevron"} />
                        </button>

                        {showDropdown && (
                            <div className={"dropdown"}>
                                <div className={"menuItem"} onClick={handleFeedback}>
                                    <LayoutGrid size={16} />
                                    <span>Feedback</span>
                                    {/* <span className={"beta"}>BETA</span> */}
                                </div>
                                <div className={"menuItem"} onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Log out</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <aside className="sidebar">
                <div className="sidebar-newchat">
                    <button className="start-chat" onClick={handleNewChat} >
                        New Chat
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    {userInfo && (
                        <button className="refresh-button" onClick={handleDownloadChat} title="Download Chat">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                    )}

                </div>
                <div className='sidebar' style={{ "borderRadius": "0px" }}>
                    {savedSessionKeys.length === 0 && userInfo ? (
                        <div className="empty-message">
                            Saved Chats appear here
                            <br />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" style={{ marginTop: '20px', color: '#888', width: '30px', height: '30px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                        </div>
                    ) : (
                        savedSessionKeys.map((session) => (
                            <div
                                key={session.sessionKey}
                                className={`chat-item ${currentSessionKey === session.sessionKey ? 'selected' : ''} ${deletingSessionKey === session.sessionKey ? 'deleting' : ''}`}
                                onClick={() => selectChat(session.sessionKey)}
                                style={{ position: 'relative' }} // Ensure positioning for dropdown
                            >
                                {/* Wrap the options button and dropdown in a parent div */}
                                <div className="chat-item-content-wrapper" ref={activeDropdown === session.sessionKey ? dropdownRef : null}>
                                    <div className="chat-item-content">
                                        {/* Chat Title or Editable Input */}
                                        {editingSessionKey === session.sessionKey ? (
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                className="edit-chat-title-input"
                                                value={editedTitle}
                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                onBlur={() => handleInputBlur(session.sessionKey)}
                                                onKeyDown={(e) => handleInputKeyDown(e, session.sessionKey)}
                                            />
                                        ) : (
                                            <span className="chat-title">
                                                {currentSessionKey === session.sessionKey ? renderChatTitle(session.chatTitle + '\u00A0\u00A0\u00A0\u00A0') : session.chatTitle + '\u00A0\u00A0\u00A0\u00A0'}
                                            </span>
                                        )}

                                        {/* Three Dots Button */}
                                        <button
                                            className="options-button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering selectChat
                                                setActiveDropdown(activeDropdown === session.sessionKey ? null : session.sessionKey);
                                            }}
                                            title="Options"
                                            aria-haspopup="true"
                                            aria-expanded={activeDropdown === session.sessionKey}
                                        >
                                            {/* Ellipsis SVG Icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Dropdown Menu */}
                                    {activeDropdown === session.sessionKey && (
                                        <div className="dropdown-container">
                                            <button
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(null);
                                                    handleDeleteChat(session.sessionKey);
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(null);
                                                    handleRenameChat(session);
                                                }}
                                            >
                                                Rename
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* GUEST MODE CODE */}
                {/* {(!userInfo || !userInfo.email) && (
                    <div className="guest-login">
                        <p className="login-message">
                            <span className="first-lineCE">Sign Up or Log in</span> <br />
                            Save chats, download chats, leave feedback, and more.
                        </p>                        <button className="signup-button" onClick={() => navigate('/signup')}>Sign up</button>
                        <button className="login-button" onClick={() => navigate('/virtualTA/login')}>Log in</button>
                    </div>
                )} */}
            </aside>
            <main style={{ flex: 1, overflowY: 'hidden', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-container" ref={chatContainerRef}>
                    {messages.length === 0 ? (
                        <div className='chatModal' >
                            <p className="chat-welcome">
                                {CHAT_WELCOME}
                                {userInfo ? `${userInfo.name} ${userInfo.last_name}` : 'Guest'}
                            </p>
                            <p className="chat-welcome-text">{CHAT_WELCOME_TEXT}</p>
                            <div className="suggested-section">
                                {suggestedQuestions.length > 0 && <p className="suggested-title">Suggested </p>}


                                <div className="suggested-container" ref={suggestionContainerRef}>
                                    {suggestedQuestions.map((item, index) => (
                                        <div key={index} className="suggested-box" onClick={(e) => onSuggestedQuestionClick(e, item.question)}>
                                            <p>{item.question}</p>
                                            <small className="suggested-box-small">{item.description}</small>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const renderMessage = (sender, text, label) => (
                                <div className={`message ${sender}`}>
                                  <div className="sender">{label}</div>
                                  <div className="text zero-pad-markdown">
                                    <Markdown remarkPlugins={[remarkGfm]} children={text} />
                                  </div>
                                </div>
                              );
                            
                              return (
                                <React.Fragment key={index}>
                                  {/* User Message */}
                                  {msg.sender === 'user' && renderMessage('user', msg.text, 'You')}
                            
                                  {/* First Guess (if it exists) */}
                                  {msg.sender === 'user' && msg.first_guess && renderMessage('user', msg.first_guess, 'First Guess')}
                            
                                  {/* Bot Message */}
                                  {msg.sender === 'bot' && renderMessage('bot', msg.text, 'Virtual TA')}
                                </React.Fragment>
                                );
                          })
                        )}
                    <div ref={messageEndRef} />
                    <button className="scroll-to-top" onClick={scrollToTop}>
                        <svg width="22px" height="22px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '22px', height: '22px', stroke: '#ffffff', strokeWidth: '4' }}>
                            <path d="M12 33L24 21L36 33" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 13H36" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div className="help-container" ref={helpDropdownRef}>
                        <button className="help-trigger" onClick={toggleDropdown2}>
                            <HelpCircle className="help-icon" />
                        </button>

                        {showDropdown2 && (
                            <div className="help-dropdown">
                                {userInfo && (
                                    <>
                                        <div className="help-menu-item">
                                            <span className="help-email">{userInfo.email}</span>
                                        </div>
                                        <div className="help-divider" />
                                    </>
                                )}

                                <div className="help-menu-item">
                                    <span>Help & FAQ</span>
                                </div>

                                <div className="help-menu-item">
                                    <span>Release Notes</span>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
                <div className="input-row">
                    <textarea
                        type="text"
                        id="question"
                        ref={textareaRef}
                        placeholder="Type a prompt"
                        className="input-field"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e, question,  !currentSessionKey ? firstGuess : '');
                            }
                        }}
                    />
                    {/* Only show the first guess input when there is a question AND no session exists */}
                    {question.trim() !== "" && !currentSessionKey && (
                        <textarea
                            key="firstGuess"
                            id="firstGuess"
                            className="input-field"
                            placeholder="What is your first guess?"
                            value={firstGuess}
                            onChange={(e) => { // Log the current value
                                setFirstGuess(e.target.value)}}
                        />
                    )}
                {isStreaming && <button type="submit" className="submit-chat" onClick={handlePauseStream}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                </button> }
                {!isStreaming && <button type="submit" className="submit-chat" onClick={(e) => handleSubmit(e, question, !currentSessionKey ? firstGuess : '')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
                    </svg>
                </button> }

                </div>
                <div className="warning-message">
                    Chatbot can make mistakes. Please verify sensitive information.
                </div>
            </main>
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>
                            Are you sure you want to delete the chat "<strong>{chatToDelete?.chatTitle}</strong>"?
                        </p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={confirmDeleteChat}>Delete</button>
                            <button className="cancel-button" onClick={cancelDeleteChat}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ChatPage;