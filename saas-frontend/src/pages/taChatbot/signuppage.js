/**
 * @file signuppage.js is a file that contains signup page components
 * 
 * @author Sanjit Verma
 */

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import React from "react";
import '../../globalStyles.css';
import AppAppBar from './components/AppAppBar';
import SimpleFooter from './components/SimpleFooter';

function SignupPage() {
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const RFOOTER = process.env.REACT_APP_RFOOTER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    const apiUrl = process.env.REACT_APP_API_URL;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [isLongEnough, setIsLongEnough] = useState(false);

    const [showAccessCodeField, setShowAccessCodeField] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [accessCodeButtonText, setAccessCodeButtonText] = useState('Have an access code?');

    const handleAccessCodeClick = () => {
        setShowAccessCodeField(!showAccessCodeField);
        setAccessCodeButtonText(showAccessCodeField ? 'Have an access code?' : "Don't have an access code?");
        setMessage(''); 
    };

    const handleLoginClick = () => {
        navigate('/virtualTA/login');
    };

    const navigate = useNavigate();

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
        setMessage('');
    };

    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
        setMessage('');
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setMessage('');
    };

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        setPassword(value);
        setHasUppercase(/[A-Z]/.test(value));
        setHasNumber(/\d/.test(value));
        setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>_]/.test(value));
        setIsLongEnough(value.length >= 8);
        setMessage('');
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            const endpoint = showAccessCodeField ? `${apiUrl}/user/signupCode` : `${apiUrl}/user/signup`;
            const requestBody = {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            };
            
            if (showAccessCodeField) {
                requestBody.access_code = accessCode;
            }
    
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            if (response.status === 201) {
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setAccessCode(''); 
                setTimeout(() => {
                    window.location.href = '/virtualTA/login';
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Signup failed', error.message);
            setMessage('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signupPageContainer" style={{ backgroundColor: 'rgb(20, 21, 21)' }}>
            <AppAppBar />
            <div className="signupModalContainer">
                <div className="signupModalHeader">Create an account</div>
                <form onSubmit={handleSignup}>
                    <div className="signupInput">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            className="login-inputContainer"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            required
                        />
                    </div>
                    <div className="signupInput">
                        <input
                            type="text"
                            placeholder="Last Name"
                            name="lastName"
                            className="login-inputContainer"
                            value={lastName}
                            onChange={handleLastNameChange}
                            required
                        />
                    </div>
                    <div className="signupInput">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className="login-inputContainer"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>
                    <div className="signupInput">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="login-inputContainer"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        
                    </div>
                    <div className="passwordCriteria">
                        <label>
                            <input type="checkbox" checked={hasUppercase} readOnly />
                            Contains an uppercase letter
                        </label>
                        <label>
                            <input type="checkbox" checked={hasNumber} readOnly />
                            Contains a number
                        </label>
                        <label>
                            <input type="checkbox" checked={hasSpecialChar} readOnly />
                            Contains a special character
                        </label>
                        <label>
                            <input type="checkbox" checked={isLongEnough} readOnly />
                            At least 8 characters
                        </label>
                    </div>
                    
                    {message && <p className='signUpError'>{message}</p>}
                    <button type="submit" className="signupButton" disabled={isLoading}>
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Sign Up'}
                    </button>
                    <div className='buttonsContainer'>
                        <button type='button' className='newUserButton' onClick={handleLoginClick}>Have an account?</button>

                    </div>
                    <div className='buttonsContainer3'>
                        <button type='button' className='newUserButton' onClick={handleAccessCodeClick}>
                            {accessCodeButtonText}
                        </button>
                        
                    </div>
                    {showAccessCodeField && (
                            <div className="accessCodeInput">
                                <input
                                    type="text"
                                    name="accessCode"
                                    placeholder="Access Code"
                                    className="login-inputContainer"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                </form>
            </div>
            <SimpleFooter />
        </div>
    );
}

export default SignupPage;
