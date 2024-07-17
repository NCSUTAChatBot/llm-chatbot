/**
 * @file landingpage.js is a file that contains the landing page components 
 * 
 * @author Sanjit Verma (skverma)
 */

import { useNavigate } from 'react-router-dom';
import '../globalStyles.css';
function LandingPage() {

    // ENV VARIABLES
    
    const MODALBODYTEXT = process.env.REACT_APP_MODALBODYTEXT;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    const LOGO_MODAL = process.env.REACT_APP_FRONT_LOGO;
    
    const navigate = useNavigate();
    
    const handleModelNavigation = () => {
        navigate('/models');
    };

    return (
        <div className="landingPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}>
            <div className="top-bar-landing">
                <h1 className="title">LLM Entry Portal </h1>
                <div className="buttons">
                    <button type="submit" className="model-button-landing" onClick={handleModelNavigation}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{ width: '20px', height: '20px', paddingRight: '5px', color: 'red' }}>
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                        </svg> Models
                    </button>
                </div>
            </div>
            <div className="modalContainer">
                <img src={`${process.env.PUBLIC_URL + LOGO_MODAL}`} alt="NC STATE UNIVERSITY" style={{ width: '360px', height: '57px', margin: '30px' }} />
                <p className="modalBodyText">{MODALBODYTEXT}</p>
                <div className="modalButtonContainer">
                </div>
            </div>
        </div>
    );
};

export default LandingPage;