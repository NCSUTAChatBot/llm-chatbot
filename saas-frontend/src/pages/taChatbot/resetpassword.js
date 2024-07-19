/**
 * @file resetpassword.js is a file that contains the reset password page components
 * 
 * @author dineshkannan (dkannan)
 * @author sanjit verma (skverma)
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../../globalStyles.css';

const apiUrl = process.env.REACT_APP_API_URL;
const NAVBAR_HEADER = process.env.REACT_APP_NAVBAR_HEADER;
const BACKGROUND_IMAGE_URL = process.env.REACT_APP_BACKGROUND_IMAGE_URL;

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);

    // Password criteria states
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [isLongEnough, setIsLongEnough] = useState(false);

    const navigate = useNavigate();

    const handlePasswordChange = (event) => {
        const value = event.target.value;
        setNewPassword(value);
        setHasUppercase(/[A-Z]/.test(value));
        setHasNumber(/\d/.test(value));
        setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>_]/.test(value));
        setIsLongEnough(value.length >= 8);
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setMessage('');

        try {
            const response = await fetch(`${apiUrl}/user/reset_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, new_password: newPassword }),
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error || 'Failed to reset password. Please try again.');
                setIsResetSuccessful(false);
            } else {
                setMessage('Your password has been successfully reset. You can now log in.');
                setIsResetSuccessful(true);
            }
        } catch (error) {
            setMessage('Network error, please try again later.');
            setIsResetSuccessful(false);
        }
    };

    const handleLoginPage = () => {
        navigate('/virtualTA/login');
    };

    const isPasswordCriteriaMet = hasUppercase && hasNumber && hasSpecialChar && isLongEnough;

    return (
        <div className="loginPageContainer" style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}>
            <div className="top-bar">
                <h1 className="title">{NAVBAR_HEADER}</h1>
                <div className="buttons">
                    <button className="feedback-button" onClick={() => window.open(process.env.REACT_APP_FEEDBACK_FORM_URL)}>Leave Feedback</button>
                </div>
            </div>
            <div className="signupModalContainer">
                <div className="loginModalHeader">Reset your password</div>
                <form onSubmit={handleResetPassword}>
                    <div className="signupInput">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={handlePasswordChange}
                            placeholder="New password"
                            className="login-inputContainer"
                            required
                        />
                    </div>
                    <div className="signupInput">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="login-inputContainer"
                            required
                        />
                    </div>
                    <div className="passwordCriteria2">
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
                    {message && <p className='resetError2'>{message}</p>}
                    <button type="submit" className="resetPassButton" disabled={!isPasswordCriteriaMet}>Reset Password</button>
                    {isResetSuccessful && (
                        <div className='buttonsContainer'>
                            <button type='button' className='forgotPasswordButton' onClick={handleLoginPage}>Back to login page</button>
                        </div>
                    )}
                </form>
            </div>
            <p className="footerTextLeft">{process.env.REACT_APP_LFOOTER}</p>
            <p className="footerTextRight">{process.env.REACT_APP_RFOOTER}</p>
        </div>
    );
}

export default ResetPassword;
