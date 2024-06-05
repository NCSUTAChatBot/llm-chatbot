/**
 * @file landingpage.js is a file that contains the landing page components 
 * @author sanjitkverma (skverma)
 */

import { useNavigate } from 'react-router-dom';
import '../globalStyles.css';
function LandingPage() {
    
    // ENV VARIABLES
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const RFOOTER = process.env.REACT_APP_RFOOTER;
    const MODALBODYTEXT = process.env.REACT_APP_MODALBODYTEXT;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;

    // This hook is used to navigate between different pages
    const navigate = useNavigate();
    // This function is called when the user clicks on the Chat Now button
    const handleButtonClick = () => {
        navigate('/chat');
    };
    const handleLoginClick = () => {
        navigate('/login');
    };
    const handleSignupClick= () => {
        navigate('/signup')
    };
    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    return (
        <div className="landingPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})`}}>
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER} </h1>
                <div className="buttons">
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                </div>
            </div>
            <div className="modalContainer">
                <h3 className="modalHeader">Welcome</h3>
                <p className="modalBodyText">{MODALBODYTEXT}</p>
                <button type="submit" className="chatButton" onClick={handleLoginClick}>
                    Login
                </button>
                <button type="submit" className="chatButton" onClick={handleSignupClick}>
                    SignUp
                </button>                
                <button type="submit" className="chatButton" onClick={handleButtonClick}>
                    Chat Now
                </button>
            </div>
            <p className="footerTextLeft">
                {LFOOTER}
            </p>
            <p className="footerTextRight">
                {RFOOTER}
            </p>
        </div>
    );
};

export default LandingPage;