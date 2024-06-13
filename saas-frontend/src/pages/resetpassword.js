import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);

    const navigate= useNavigate();

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setMessage('');

        try {
            const response = await fetch('http://localhost:8000/user/reset_password', {
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
    const handleLoginPage= () =>{
        navigate('/login'); 
    };

    return (
        <div>
            <div className="forgotPasswordModalContainer">
            <h2 className="loginModalHeader"> Reset Your Password</h2>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="password-inputContainer"
                required
            />
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="password-inputContainer"
                required
            />
            <button onClick={handleResetPassword} className="resetButton" >Reset Password</button>
            {message && <p  style={{ color: 'white', textAlign: 'center' }}>{message}</p>}
            {isResetSuccessful && (
                <div className='buttonsContainer'>
                    <button type='button' className='forgotPasswordButton' onClick={handleLoginPage}>Back to login page</button>
                </div>
            )}
            </div>
        </div>
    );
}

export default ResetPassword;