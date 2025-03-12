/**
 * @file CEChatpage.js is the page for the chatbot feature in the course evaluation page. It allows users to interact with the chatbot to ask questions and get responses.
 *
 * @author Sanjit Verma (skverma)
 */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../globalStyles.css";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ChatPage = () => {
  // ENV VARIABLES
  const NAVBAR_HEADER = process.env.REACT_APP_CENAVBAR_HEADER;
  const REACT_APP_LFOOTER = process.env.REACT_APP_LFOOTER;
  const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
  const CHAT_WELCOME = process.env.REACT_APP_CHAT_WELCOME;
  const CHAT_WELCOME_TEXT = process.env.REACT_APP_CECHAT_WELCOME_TEXT;
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const messageEndRef = useRef(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [currentSessionKey, setCurrentSessionKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [isLastMessageNew, setIsLastMessageNew] = useState(false);
  const suggestedContainerRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(() => {
    const savedFiles = sessionStorage.getItem('uploadingFiles');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [response, setResponse] = useState("");

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return sessionStorage.getItem('sessionId') || '';
  });
  const location = useLocation();
  const isEvaluationsUploaded = uploadingFiles.length > 0 && uploadingFiles.some(file => file.progress === 100);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    if (currentSessionId === '') {
      initiateSession();
    }
  }, [currentSessionId]);

  // Save currentSessionId to sessionStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      sessionStorage.setItem('sessionId', currentSessionId);
    }
  }, [currentSessionId]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('uploadingFiles', JSON.stringify(uploadingFiles));
  }, [uploadingFiles]);

  // Handler for beforeunload event
  const handleBeforeUnload = (e) => {
    if (messages.length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages]);

  const handleFeedback = () => {
    window.open(FEEDBACK_URL);
  };

  const handleFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File is too large. Maximum size allowed is 10 MB.");
        return;
      }
      const allowedExtensions = /(\.csv|\.xls)$/i;
      if (!allowedExtensions.exec(file.name)) {
        alert("Invalid file type. Only .csv and .xls files are allowed.");
        return;
      }
  
      setFile(file);
      handleFileUpload(file);

      event.target.value = null;
    }
  };

  const initiateSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/courseEvaluation/start_session`, {
          method: "GET",
        });
        const data = await response.json();
        if (data.session_id) {
          setCurrentSessionId(data.session_id);
          navigate(`/commentSense/chat?sessionId=${data.session_id}`, { replace: true });
        } else {
          console.error("No session ID received from the backend");
        }
      } catch (error) {
        console.error("Error initiating session:", error);
      }
  };

  useEffect(() => {
    // Only initiate session if there's no session ID in the URL and none in the state
    const params = new URLSearchParams(location.search);
    const sessionIdFromUrl = params.get('sessionId');
    
    if (!sessionIdFromUrl && !currentSessionId) {
      initiateSession();
    }
  }, [location.search, currentSessionId]);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", currentSessionId);

    console.log("File to upload:", file);
    console.log("Session ID:", currentSessionId);

    const newFile = {
      name: file.name,
      type: file.name.split(".").pop(),
      progress: 0,
    };
    setUploadingFiles((prevFiles) => [...prevFiles, newFile]);

    try {
      console.log("Uploading file:", file.name);

      const response = await fetch(`${apiUrl}/courseEvaluation/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const contentType = response.headers.get("content-type");
      console.log("Response content type:", contentType);

      if (response.ok) {
        const data = await response.json();
        console.log("Upload success:", data);
        setUploadingFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.name === newFile.name ? { ...f, progress: 100 } : f
          )
        );
        setFile(null);
      } else {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Error response JSON:", errorData);
          alert("Error response JSON:", errorData);
        } else {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          alert("Error response text:", errorText);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadChat = async () => {
    if (!currentSessionId) {
      console.error("No chat session selected to download.");
      alert("No chat session selected to download.");
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/courseEvaluation/export_single_chat_to_pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: currentSessionId,
          }),
        }
      );
      if (response.ok) {
        // Convert the response to a Blob representing the PDF file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat_${currentSessionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(`Failed to generate PDF. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error downloading chat PDF:", error);
    }
  };

  const handleDeleteFile = (fileName) => {
    setUploadingFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const handleNewChat = async () => {
    try {
      setCurrentSessionKey("");
      setMessages([]);
      setUploadingFiles([]);

      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('messages');
      
      setCurrentSessionId('');
    } catch (error) {
      console.error("Error creating new chat session:", error);
    }
  };

  // This function is called when the user clicks on the Logout button
  const handleLogout = async () => {
    navigate("/commentSense");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    // Set the last message as new
    setIsLastMessageNew(true);

    // Add the user's question to the chat
    const userMessage = { text: question, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setQuestion("");

    try {
      // Send the question to the backend
      const response = await fetch(`${apiUrl}/courseEvaluation/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question,
          session_id: currentSessionId,
          history: messages.slice(-10),
        }),
      });

      if (response.ok) {
        // If the response body is present, handle streaming responses for displaying chat messages
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let aggregatedText = ""; // Buffer for the streamed text

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            aggregatedText += chunk;

            // Update messages without duplicating or adding unnecessary spaces
            setMessages((messages) => {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.sender === "bot") {
                lastMessage.text += chunk;
                return [...messages.slice(0, -1), lastMessage];
              } else {
                return [...messages, { text: chunk, sender: "bot" }];
              }
            });
          }

          // Ensure the reader is closed
          reader.releaseLock();
        }
      } else {
        const errorData = await response.json();
        console.error("Error response JSON:", errorData);
      }
    } catch (error) {
      console.error("Error asking question:", error);
    } finally {
      setIsLastMessageNew(false);
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const container = suggestedContainerRef.current;

    const handleWheel = (event) => {
      if (container) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    };

    if (container) {
      container.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [suggestedContainerRef]);

  useEffect(() => {
    const container = suggestedContainerRef.current;

    const handleWheel = (event) => {
      if (container) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    };

    if (container) {
      container.addEventListener("wheel", handleWheel);
    } else {
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [suggestedContainerRef.current]);

  const scrollToTop = () => {
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      chatContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollToTopButton = document.querySelector(".scroll-to-top");
      const chatContainer = document.querySelector(".chat-container");
      if (chatContainer.scrollTop > 500) {
        // Show button when scrolled down more than 500px
        scrollToTopButton.style.display = "block";
      } else {
        scrollToTopButton.style.display = "none";
      }
    };

    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // This hook is used to load and set user information from localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, [navigate]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleDropdown2 = () => setShowDropdown2(!showDropdown2);

  return (
    <div className="chat-page">
      <div className="top-barchat">
        <div className="title-chatpageCE">
          {NAVBAR_HEADER}
          <span className="title-chatpage-smallText"> {REACT_APP_LFOOTER}</span>
        </div>
        <div className="buttons">
          <div className="userInfo">
            {userInfo ? (
              <div className="userInfo" onClick={toggleDropdown}>
                Welcome
                {showDropdown && (
                  <div className="user-dropdown">
                    <button
                      type="submit"
                      className="user-dropdown-button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                    <button
                      className="user-dropdown-button"
                      onClick={handleFeedback}
                    >
                      Leave Feedback
                    </button>
                  </div>
                )}
                <svg
                  style={{ paddingLeft: "5" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="white"
                  className="size-6 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            ) : (
              <div className="userInfoCE" onClick={toggleDropdown}>
                Welcome
                {showDropdown && (
                  <div className="user-dropdownCE">
                    <button
                      type="submit"
                      className="user-dropdown-button"
                      onClick={handleLogout}
                    >
                      Home
                    </button>
                    <button
                      className="user-dropdown-button"
                      onClick={handleFeedback}
                    >
                      Leave Feedback
                    </button>
                  </div>
                )}
                <svg
                  style={{ paddingLeft: "5" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="white"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
      <aside className="sidebar">
        <div className="sidebar-newchat">
          <button
            className="start-chat"
            onClick={handleNewChat}
            disabled={isUploading}
          >
            New Chat
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: "22px", height: "22px" }}
            >
              <path
                strokeLinecap="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            className="refresh-button"
            onClick={handleDownloadChat}
            title="Download Chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              style={{ width: "22px", height: "22px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        </div>
        <div className="uploaded-files">
          {uploadingFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-type">{file.type}</span>
                <button
                  className="delete-file-button"
                  onClick={() => handleDeleteFile(file.name)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                    style={{
                      zIndex: "20",
                      width: "14px",
                      height: "14px",
                      marginTop: "30px",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14"
                    />
                  </svg>
                </button>
              </div>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="guest-login">
        {messages.length > 0 && (
          <div className="session-warning">
            <p>
              Closing the page will delete your current session.
              To save your chat, please download it before leaving.
            </p>
          </div>
        )}
          <p className="login-messageCE">
            <span className="first-lineCE">
              Uploaded Course Evaluations Appear here
            </span>{" "}
            <br />
            .csv and .xls files are supported
          </p>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          overflowY: "hidden",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="chatModal">
              <p className="chat-welcome">{CHAT_WELCOME}</p>
              <p className="chat-welcome-text">{CHAT_WELCOME_TEXT}</p>
              <div className="suggested-section">
                <p className="suggested-title">Suggested </p>

                <div
                  className="suggested-container"
                  ref={suggestedContainerRef}
                >
                  <div className="suggested-box">
                    <p>
                      What did my students think about the difficulty of the
                      exams?
                    </p>
                    <small className="suggested-box-small">
                      I want to know what students thought about my exams
                    </small>
                  </div>
                  <div className="suggested-box">
                    <p>
                      Were the instructions for assignments and exams clear to
                      students?
                    </p>
                    <small className="suggested-box-small">
                      I need to know if I should improve my assignment
                      instructions
                    </small>
                  </div>
                  <div className="suggested-box">
                    <p>What feedback did students give about my lectures?</p>
                    <small className="suggested-box-small">
                      {" "}
                      I want to know if my teaching style works{" "}
                    </small>
                  </div>
                  <div className="suggested-box">
                    <p>
                      How engaged did students feel during the lectures and
                      activities?
                    </p>
                    <small className="suggested-box-small">
                      {" "}
                      I need to know if my activities and lectures were useful
                    </small>
                  </div>
                  <div className="suggested-box">
                    <p>
                      What do you recommend I can do to increase classroom
                      engagement?
                    </p>
                    <small className="suggested-box-small">
                      I am having trouble keeping the class engaged
                    </small>
                  </div>
                  <div className="suggested-box">
                    <p>
                      What aspects of the course did students think could be
                      better?
                    </p>
                    <small className="suggested-box-small">
                      I want to find areas to improve my class
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                    <div className="sender">{msg.sender === 'user' ? '' : 'CommentSense'}</div>
                    <div className="text zero-pad-markdown">
                        <Markdown remarkPlugins={[remarkGfm]} children={msg.text} />
                    </div>
                </div>
            ))
          )}
          <button className="scroll-to-top" onClick={scrollToTop}>
            <svg
              width="22px"
              height="22px"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "22px",
                height: "22px",
                stroke: "#ffffff",
                strokeWidth: "4",
              }}
            >
              <path
                d="M12 33L24 21L36 33"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13H36"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="more-info">
            {showDropdown2 && (
              <div className="more-info-dropdown">
                {userInfo ? (
                  <button className="moreinfo-dropdown-button">
                    {userInfo.email}
                  </button>
                ) : null}
                <button className="moreinfo-dropdown-button">Help & FAQ</button>
                <button className="moreinfo-dropdown-button">
                  Release Notes
                </button>
              </div>
            )}
            <div className="more-info-icon" onClick={toggleDropdown2}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z"
                  fill="#ffffff"
                />
              </svg>
            </div>
          </div>
          <div ref={messageEndRef} />
        </div>
        <div className="input-row">
          <div>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".csv, .xls"
            />
            <button
              className="upload-button"
              title="Upload Eval"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("file-upload").click()
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                style={{
                  width: "26px",
                  height: "26px",
                  color: "rgb(179, 33, 33)",
                  marginTop: "10px",
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 4.5A.75.75 0 0 1 3 3.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm14.47 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L18 10.81V21a.75.75 0 0 1-1.5 0V10.81l-2.47 2.47a.75.75 0 1 1-1.06-1.06l3.75-3.75ZM2.25 9A.75.75 0 0 1 3 8.25h9.75a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 2.25 9Zm0 4.5a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <textarea
            type="text"
            id="question"
            placeholder={
              isEvaluationsUploaded
                ? "Type a prompt"
                : "Please upload a course evaluation"
            }
            className="input-field"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isLastMessageNew &&
                isEvaluationsUploaded &&
                question.trim()
              ) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={!isEvaluationsUploaded}
          />
          <button
            type="submit"
            className="submit-chat"
            onClick={handleSubmit}
            disabled={
              !isEvaluationsUploaded ||
              isLastMessageNew ||
              question.trim() === ""
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3"
              />
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
