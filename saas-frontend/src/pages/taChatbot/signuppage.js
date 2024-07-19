import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import React from "react";
import '../../globalStyles.css';

function SignupPage() {
    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const RFOOTER = process.env.REACT_APP_RFOOTER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
    const apiUrl = process.env.REACT_APP_API_URL;

    // useState hook is used to create state variables for inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState('');

    // Password criteria states
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [isLongEnough, setIsLongEnough] = useState(false);

    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    const handleLoginClick = () => {
        navigate('/virtualTA/login');
    };

    const handleHomeClick = () => {
        navigate('/virtualTA');
    };

    const navigate = useNavigate();

    // Handlers for each input
    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    };

    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        setPassword(value);
        setHasUppercase(/[A-Z]/.test(value));
        setHasNumber(/\d/.test(value));
        setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>_]/.test(value));
        setIsLongEnough(value.length >= 8);
    };

    // This function handles form submission 
    const handleSignup = async (event) => {
        event.preventDefault();
        console.log('Signup Submitted', { firstName, lastName, email, password });
        // Add logic to handle signup here 
        try {
            const response = await fetch(`${apiUrl}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password
                })
            });
            const data = await response.json();
            if (response.status === 201) {
                setMessage('User registered successfully.');
                // To clear the form after successful registration
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                navigate('/virtualTA/login');
            } else {
                throw new Error(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Signup failed', error.message)
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="signupPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}>
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER}</h1>
                <div className="buttons">
                <button className="feedback-button" onClick={handleHomeClick}>Home</button>
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                </div>
            </div>
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
                    <button type="submit" className="signupButton">Sign Up</button>
                    <div className='buttonsContainer'>
                        <button type='button' className='newUserButton' onClick={handleLoginClick}>Have an account?</button>
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
    );
}

export default SignupPage;
