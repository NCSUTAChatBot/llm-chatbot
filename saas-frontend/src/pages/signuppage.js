/**
 * @file signupPage.js is a file that contains the signup page components
 * 
 * @author dineshkannan (dkannan)
 */
import { useState } from "react";
import { useNavigate } from 'react-router-dom';


function SignupPage(){

    // useState hook is used to create state variables for inputs
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');
    const [firstName, setFirstName]= useState('');
    const [lastName, setLastName]= useState('');
    const [message,setMessage]= useState('');

    const navigate= useNavigate();

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
    const handleSignup = async (event) =>{
        event.preventDefault();
        console.log('Signup Submitted', { firstName, lastName, email, password });
        // Add logic to handle login here 
        try{
            const response= await fetch('http://localhost:8000/user/signup',{
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
            const data= await response.json();
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
        }catch(error){
            console.error('Signin failed', error.message)
            setMessage('Error: ' + error.message);
        }
    }

    return(
        <div className="signupPageContainer" >
            <div className="signupModalContainer">
            <h3 className="signupModalHeader">Create an account</h3>
            <form onSubmit={handleSignup}>
                <div>
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        className="login-inputContainer"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                    type="text"
                    name="lastName"
                    className="login-inputContainer"
                    value={lastName}
                    onChange={handleLastNameChange}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                    type="email"
                    name="email"
                    className="login-inputContainer"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                    type="password"
                    name="password"
                    className="login-inputContainer"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    />
                </div>
                <button type="submit" className="signupButton">Sign Up</button>
            </form>
        </div>
    </div>
    )
}

export default SignupPage;