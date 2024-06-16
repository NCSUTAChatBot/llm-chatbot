/**
 * @file forgotpassword.js is a file that contains the forgot password page components
 * 
 * @author dineshkannan (dkannan)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    const navigate= useNavigate();

    const handleForgotPassword = async (event) => {
        setMessage(''); // Clear previous messages
        setIsError(false); // Reset error state

        event.preventDefault(); 

        if (!email.trim()) {
            setIsError(true);
            setMessage('Email address is required.'); // Set message to indicate the need for an email
            return;
        }
        try {
                const response = await fetch('http://localhost:8000/user/forgot_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email}),
            });

            const data = await response.json();
            if (!response.ok) {
                setIsError(true); // Set error state to true
                setMessage(data.error);
            } else{
                setMessage(data.message);
            }
        } catch(error) {
            setIsError(true);
            setMessage('Failed to send reset password email. Please try again later.');
        }
    };

    const handleLoginPage= () =>{
        navigate('/login'); 
    };

    return (
        <div className="signupPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})`}} >
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER} </h1>
            </div>
            <div className="forgotPasswordModalContainer">
                <h3 className="loginModalHeader">Reset your password</h3>
                <h5 className="forgotPasswordSubheader">Enter your email address and instructions to reset your password will be mailed</h5>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{color: 'black'}} 
                        id="email"
                        className="login-inputContainer"
                        required
                    />
                    {message && <p style={{ color: 'white', textAlign: 'center' }} >{message}</p>}
                    <button type="submit" className="resetButton" onClick={handleForgotPassword} >Reset Password</button>
                    <div className='buttonsContainer'>
                        <button type='button' className='forgotPasswordButton' onClick={handleLoginPage}>Back to login page</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;