/**
 * @file signupPage.js is a file that contains the signup page components
 * 
 * @author dineshkannan (dkannan)
 */
import { useState } from "react";
import { useNavigate } from 'react-router-dom';


function SignupPage() {

    const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
    const LFOOTER = process.env.REACT_APP_LFOOTER;
    const RFOOTER = process.env.REACT_APP_RFOOTER;
    const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
    const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;

    // useState hook is used to create state variables for inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState('');

    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    const handleLoginClick = () => {
        navigate('/login');
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
        setPassword(event.target.value);
    };

    // This function handles form submission 
    const handleSignup = async (event) => {
        event.preventDefault();
        console.log('Signup Submitted', { firstName, lastName, email, password });
        // Add logic to handle login here 
        try {
            const response = await fetch('http://localhost:8000/user/signup', {
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
                // To clear the form after sucessful registering
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                navigate('/login');
            } else {
                throw new Error(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Signin failed', error.message)
            setMessage('Error: ' + error.message);
        }
    }

    return (
        
        <div className="signupPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})`}} >
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER} </h1>
                <div className="buttons">
                    <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
                </div>
            </div>
            <div className="signupModalContainer">
                <h3 className="signupModalHeader">Create an account</h3>
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
                    
                    {message && <p className='loginError'>{message}</p>}
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
    )
}

export default SignupPage;