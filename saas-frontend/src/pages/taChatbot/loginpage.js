import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../globalStyles.css';
import AppAppBar from './components/AppAppBar';
import SimpleFooter from './components/SimpleFooter';
// ENV VARIABLES
const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
const LFOOTER = process.env.REACT_APP_LFOOTER;
const RFOOTER = process.env.REACT_APP_RFOOTER;
const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;
const apiUrl = process.env.REACT_APP_API_URL;

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken'));
    const [isLoading, setIsLoading] = useState(false);

    const handleFeedback = () => {
        window.open(FEEDBACK_URL);
    };

    const navigate = useNavigate();

    const handleEmailChanges = (event) => {
        if (error) setError('');
        setEmail(event.target.value);
    };

    const handlePasswordChanges = (event) => {
        if (error) setError('');
        setPassword(event.target.value);
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);  // Set loading state to true
        try {
            const response = await fetch(`${apiUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('userInfo', JSON.stringify(data.user_info));
                setAuthToken(data.access_token);
                window.location.href = '/virtualTA/chat';
            } else {
                throw new Error(data.error || 'Unknown Error');
            }
        } catch (error) {
            console.error('Login failed', error.message);
            setError(error.message);
        } finally {
            setIsLoading(false);  // Set loading state to false
        }
    };

    const handleNewUser = () => {
        window.location.href = '/virtualTA/signup';
    };

    const handleGuest = () => {
        window.location.href = '/virtualTA/chat';
    };

    const handleForgotPassword = () => {
        window.location.href = '/virtualTA/forgotpassword';
    };

    const handleHome = () => {
        window.location.href = '/virtualTA';
    };

    return (
        <div className="loginPageContainer" style={{ backgroundColor: 'rgb(20, 21, 21)' }}>
            <AppAppBar />
            <div className="loginModalContainer">
                <div className="loginModalHeader">Welcome Back</div>
                <form onSubmit={handleLogin}>
                    <div className="signupInput">
                        <input
                            placeholder="Email"
                            type="email"
                            id="email"
                            className="login-inputContainer"
                            value={email}
                            onChange={handleEmailChanges}
                            required
                        />
                    </div>
                    <div className="signupInput">
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
                    {isLoading ? (
                        <div className="loadingIndicator">Loading...</div>  // Loading indicator
                    ) : (
                        <button type="submit" className="loginButton">Login</button>
                    )}
                    <div className='buttonsContainer'>
                        <button type='button' className='forgotPasswordButton' onClick={handleForgotPassword}>Forgot Password?</button>
                        <button type='button' className='newUserButton' onClick={handleNewUser}>Need to Sign Up?</button>
                    </div>
                    <div className='buttonsContainer2'>
                        <button type='button' className='guestButton' onClick={handleGuest}>Continue as a Guest</button>
                    </div>
                </form>
            </div>
            <SimpleFooter />
        </div>
    );
}

export default LoginPage;
