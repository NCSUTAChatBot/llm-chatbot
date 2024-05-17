/**
 * @file landingpage.js is a file that contains the landing page components 
 * @author sanjitkverma (skverma)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../globalStyles.css';
function LandingPage() {
    // This hook is used to navigate between different pages
    const navigate = useNavigate();
    // This function is called when the user clicks on the Chat Now button
    const handleButtonClick = () => {
        navigate('/chat');
    };
    return (
        <div className="landingPageContainer">
            <div className="modalContainer">
                <h3 className="modalHeader">Welcome: SAAS Chatbot</h3>
                <p className="modalBodyText">This Chatbot supports asking questions from the textbook: <></>Engineering Software as a Service: An Agile Approach Using Cloud Computing
                </p>
                <button type="submit" className="chatButton" onClick={handleButtonClick}>
                    Chat Now
                </button>
            </div>
            <p className="footerTextLeft">
                SAAS beta v1.0.0
            </p>
            <p className="footerTextRight">
                @2024 NCSU CSC Dept
            </p>
            <p>&copy; </p>
        </div>
    );
};

export default LandingPage;