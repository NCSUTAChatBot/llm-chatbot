import React, { useState } from 'react';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async () => {
        const response = await fetch('http://localhost:8000/user/forgot_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email}),
        });

        const data = await response.json();
        setMessage(data.message);
    };

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
            <button onClick={handleForgotPassword} >Reset Password</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default ForgotPassword;