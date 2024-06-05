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
    const [error, setError] = useState('');

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

            if (response.status === 200){
                console.log('Login Successful:', data);
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
                    <button type='button' className='forgotPasswordButton'>Forgot Password?</button>
                    <button type='button' className='newUserButton' onClick={handleNewUser}>New User</button>
                </div>
            </form>
        </div>
    </div>
    )
}

export default LoginPage;