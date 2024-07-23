/**
 * @file landingpage.js is a file that contains the landing page components 
 * 
 * @author Sanjit Verma (skverma)
 */

import { useNavigate } from 'react-router-dom';
import '../../globalStyles.css';
function LandingPage() {
    
    // ENV VARIABLES
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const RFOOTER = process.env.REACT_APP_RFOOTER;
    const MODALBODYTEXT = process.env.REACT_APP_MODALBODYTEXT;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    const LOGO_MODAL = process.env.REACT_APP_FRONT_LOGO;

    // This hook is used to navigate between different pages
    const navigate = useNavigate();
    // This function is called when the user clicks on the Chat Now button

    const handleLoginClick = () => {
        navigate('/virtualTA/login');
    };
    const handleSignupClick= () => {
        navigate('/virtualTA/signup')
    };
    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    return (
        <div className="landingPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})`}}>
            <div className="top-bar-landing">
                <h1 className="title">{NAVBAR_HEADER} </h1>
                <div className="buttons">
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                    <button type="submit" className="feedback-button" onClick={handleLoginClick}>
                    Login
                </button>
                <button type="submit" className="feedback-button" onClick={handleSignupClick}>
                    Sign Up
                </button> 
                </div>
            </div>
            <div className="modalContainer">
            <img src={`${process.env.PUBLIC_URL + LOGO_MODAL}`} alt="NC STATE UNIVERSITY" style={{ width: '360px', height: '60px', margin: '30px' }} />
                <p className="modalBodyText">{MODALBODYTEXT}</p>
                <div className="modalButtonContainer">    
                </div>
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