import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Signup() {
    const [fname, setFirstname] = useState('');
    const [lname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!fname|| !lname || !email || !password) {
            setError('All fields are required.');
            return;
        }

        try {
            await axios.post('http://localhost:5001/signup', { fname,lname, email, password });

            alert('Signup successful! Please sign in.');
            navigate('/signin');
        } catch (err) {
            console.error('Signup Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="form-container " id="signup">
            <h2 class="form-title">Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSignup}>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="First name"
                        value={fname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Last name"
                        value={lname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                    />
                </div>
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
                <button class="btn" type="submit">Sign Up</button>
            </form>

            <div className="links">
                <p>Already have an account?</p>
                <button class="btn" onClick={() => navigate('/signin')}>Sign In</button>
            </div>
        </div>
    );
}

export default Signup;


