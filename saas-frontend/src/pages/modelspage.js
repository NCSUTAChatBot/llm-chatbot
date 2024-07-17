/**
 * @file modelspage.js is a file that contains the available models for the user to interact with
 * 
 * @author Sanjit Verma (skverma)
 */
import '../globalStyles.css';

function ModelsPage() {
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;


    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    const handleLoginClick = () => {
        window.location.href = '/login';
    };
    const handleSignupClick = () => {
        window.location.href = '/signup';
    };

    const navigateHome = () => {
        window.location.href = '/'; 
    }

    const navigateCourseEvaluationChat = () => {
        window.location.href = '/CEchat';
    }
    return (
        <div className="landingPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}>
            <div className="top-bar-landing">
                <h1 className="title">LLM Entry Portal</h1>
                <div className="buttons">
                <button className="login-button-landing" onClick={navigateHome}>Home</button>
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                </div>
            </div>
            <div className="modalContainerModels">
                <div className="subModelContainer">
                    <div className="modelHeader">
                        <h2 className="modelTitle">Virtual TA Chatbot</h2>
                        <div className="modelStatus">
                            Status: Running 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3" style={{width: '20px', height: '20px', paddingLeft: '2px', color: 'green'}}>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
                            </svg>
                        </div>
                    </div>
                    <p className="modelVersion">Version: 1.0.0</p>
                    <p className="modelDescription">Please create an account or continue as a guest. This Chatbot supports asking questions from the textbook: Fundamentals of Parallel Multicore Architecture by Yan Solihin.</p>
                    <div className="buttonContainer">
                        <button className="modelActionButton" onClick={handleSignupClick}>Sign Up</button>
                        <button className="modelActionButton" onClick={handleLoginClick}>Login</button>
                    </div>
                </div>
                <div className="subModelContainer">
                    <div className="modelHeader">
                        <h2 className="modelTitle">Course Evaluation Chatbot</h2>
                        <div className="modelStatus">
                            Status: Offline 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3" style={{width: '20px', height: '20px', paddingLeft: '2px', color: 'red'}}>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
                            </svg>
                        </div>
                    </div>
                    <p className="modelVersion">Version: beta</p>
                    <p className="modelDescription">Please create an account. This Chatbot allows instructors to upload their course evaluation and query the document.</p>
                    <div className="buttonContainer">
                        <button className="modelActionButton" disabled>Sign Up</button>
                        <button className="modelActionButton" onClick={navigateCourseEvaluationChat}>Chat Now</button>
                    </div>

                </div>
                {/* Add more subModelContainers as needed */}
            </div>

        </div>
    );
}

export default ModelsPage;
