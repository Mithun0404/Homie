import React, { useState } from 'react';
import './Signup.css';

const Signup = ({ onNavigate = () => {} }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Account created successfully!");
        onNavigate('login');
      } else {
        alert(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to backend server');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo">
          <div className="signup-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.7614 11 17 8.76142 17 6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6C7 8.76142 9.23858 11 12 11Z" fill="#FB923C"/>
              <path d="M12 13C6.48 13 2 17.48 2 23H22C22 17.48 17.52 13 12 13Z" fill="#FB923C"/>
              <path d="M12 19L11 18.1C9 16.2 8 15.2 8 14.1C8 13.3 8.7 12.6 9.6 12.6C10.1 12.6 10.6 12.9 10.9 13.3L12 14.6L13.1 13.3C13.4 12.9 13.9 12.6 14.4 12.6C15.3 12.6 16 13.3 16 14.1C16 15.2 15 16.2 13 18.1L12 19Z" fill="#FFF"/>
            </svg>
          </div>
          <span>Homie</span>
        </div>
        
        <div className="signup-header">
          <h2>Create Account</h2>
          <p>Please enter your details to sign up.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="+1 (555) 000-0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <div className="social-signup">
          <p>Or continue with</p>
          <div className="social-btns">
            <button className="social-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
              Google
            </button>
            <button className="social-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              Apple
            </button>
          </div>
        </div>

        <p className="login-link">
          Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
