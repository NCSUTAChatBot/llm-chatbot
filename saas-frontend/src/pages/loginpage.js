/**
 * @file loginPage.js is a file that contains the login page components
 * 
 * @author dineshkannan (dkannan)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../globalStyles.css';

// ENV VARIABLES
const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
const LFOOTER = process.env.REACT_APP_LFOOTER;
const RFOOTER = process.env.REACT_APP_RFOOTER;
const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;

function LoginPage(){
        
    // useState hook is used to create state variables for email and password
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');
    // This hook is used to store Error messages
    const [error, setError] = useState('');
    // This hook is used to store Token of users Logged in
    const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken'));

    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    const navigate= useNavigate();

    // This function handles input changes in email field
    const handleEmailChanges= (event) =>{
        if (error) setError('');  // Clear errors when user starts to type
        setEmail(event.target.value);
    };

    // This function handles input changes in password field
    const handlePasswordChanges = (event) =>{
        if (error) setError('');  // Clear errors when user starts to type
        setPassword(event.target.value);
    };

    // This function handles Login 
    const handleLogin = async (event) =>{
        event.preventDefault();
        try{
            // logic to handle login
            const response= await fetch('http://localhost:8000/user/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email,password}),
            });

            const data= await response.json();
            // If the authentication is successful
            if (response.status === 200){
                // Storing the accessToken received from the server in localStorage
                localStorage.setItem('accessToken', data.access_token);
                //  Convert the user info object to a string and storing it in localStorage
                localStorage.setItem('userInfo', JSON.stringify(data.user_info));
                // Set the received access token in the application's state for immediate use
                setAuthToken(data.access_token);
                 // Redirect the user to the '/chat' page
                navigate('/chat')
            }
            else{
                throw new Error(data.error || 'Unknown Error');
            }
        } catch (error){
            console.error('Login failed', error.message)
            setError(error.message);
        }
    }

    // This function handles redirection to signup page
    const handleNewUser= () =>{
        navigate('/signup'); 
    };

    // This function handles redirection to forgot password page
    const handleForgotPassword=()=>{
        navigate('/forgotpassword');
    }
    
    //HTML code for webpage
    return(
        <div className="loginPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})`}}>
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER} </h1>
                <div className="buttons">
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                </div>
            </div>
            <div className="loginModalContainer">
            <div className="loginModalHeader">Welcome Back</div>
            <form onSubmit={handleLogin}>
                <div className="email-container">
                    <input
                    placeholder="Email"
                    style={{color: 'black'}} 
                    type="email"
                    id="email"
                    className="login-inputContainer"
                    value={email}
                    onChange={handleEmailChanges}
                    required
                    />
                </div>
                <div>
                    <input
                    type="password"
                    id="password"
                    placeholder='Password'
                    className="login-inputContainer"
                    value={password}
                    onChange={handlePasswordChanges}
                    required
                    />
                </div>
                {error && <p className='loginError'>{error}</p>}
                <button type="submit" className="loginButton" >Login</button>
                <div className='buttonsContainer'>
                    <button type='button' className='forgotPasswordButton' onClick={handleForgotPassword}>Forgot Password?</button>
                    <button type='button' className='newUserButton' onClick={handleNewUser}>Don't have an account?</button>
                </div>
            </form>
        </div>
        <p className="footerTextLeft">
                {LFOOTER}
            </p>
            <p className="footerTextRight">
                {RFOOTER}
            </p>
    </div>
    )
}

export default LoginPage;