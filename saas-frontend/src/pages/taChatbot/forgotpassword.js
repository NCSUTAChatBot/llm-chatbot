/**
 * @file forgotpassword.js is a file that contains the forgot password page components
 * 
 * @author dineshkannan (dkannan)
 * @author Sanjit Verma
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../globalStyles.css';
import AppAppBar from './components/AppAppBar';
import SimpleFooter from './components/SimpleFooter';

function ForgotPassword() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

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
            const response = await fetch(`${apiUrl}/user/forgot_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) {
                setIsError(true); // Set error state to true
                setMessage(data.error);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setIsError(true);
            setMessage('Failed to send reset password email. Please try again later.');
        }
    };

    const handleLoginPage = () => {
        navigate('/virtualTA/login');
    };

    return (
        <div className="signupPageContainer" style={{ backgroundColor: 'rgb(20, 21, 21)' }} >
            <AppAppBar />
            <div className="forgotPasswordModalContainer">
                <div className="loginModalHeader">Reset your password</div>
                <div className="forgotPasswordSubheader">Enter your email address and instructions to reset your password will be mailed</div>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        id="email"
                        className="reset-inputContainer"
                        required
                    />
                    {message && <div className="resetError">{message}</div>}
                    <button type="submit" className="resetButton" onClick={handleForgotPassword} >Reset Password</button>
                    <div className='buttonsContainer'>
                        <button type='button' className='forgotPasswordButton' onClick={handleLoginPage}>Back to login page</button>
                    </div>
                </div>
            </div>
            <SimpleFooter />
        </div>
    );
}

export default ForgotPassword;