/**
 * @file loginPage.js is a file that contains the login page components
 * 
 * @author dineshkannan (dkannan)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../globalStyles.css';

function LoginPage(){
        
    // useState hook is used to create state variables for email and password
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');
    // This hook is used to store Error messages
    const [error, setError] = useState('');
    // This hook is used to store Token of users Logged in
    const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken'));

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
        <div className="loginPageContainer" >
            <div className="loginModalContainer">
            <h3 className="loginModalHeader">Welcome Back</h3>
            <form onSubmit={handleLogin}>
                <div className="email-container">
                    <label htmlFor="email">Email</label>
                    <input
                    type="email"
                    id="email"
                    className="login-inputContainer"
                    value={email}
                    onChange={handleEmailChanges}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                    type="password"
                    id="password"
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
                    <button type='button' className='newUserButton' onClick={handleNewUser}>New User</button>
                </div>
            </form>
        </div>
    </div>
    )
}

export default LoginPage;