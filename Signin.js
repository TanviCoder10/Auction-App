import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSignin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        try {
            await axios.post('http://localhost:5001/signin', { email, password });

            alert('Sign in successful!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Signin Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="form-container">
            <h2 class="form-title">Sign In</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSignin}>
                <div className="input-group">
                    <FaEnvelope className="icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button class="btn" type="submit">Sign In</button>
            </form>

            <div class="recover">
                <button class="forget-password" onClick={() => navigate('/forgot-password')}>Forget Password?</button>
            </div>

            <p className="or">-------------- or --------------</p>
            <div className="social-icons">
                <FaGoogle className="social-icon google" />
                <FaFacebook className="social-icon facebook" />
            </div>

            <div className="links">
                <p>Don't have an account?</p>
                <button class="btn" onClick={() => navigate('/signup')}>Create an Account</button>
            </div>
        </div>
    );
}

export default Signin;
