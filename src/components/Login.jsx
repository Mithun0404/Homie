import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login handle
    console.log('Logging in with:', { email, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            {/* SVG icon representing Mom */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.7614 11 17 8.76142 17 6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6C7 8.76142 9.23858 11 12 11Z" fill="#FB923C"/>
              <path d="M12 13C6.48 13 2 17.48 2 23H22C22 17.48 17.52 13 12 13Z" fill="#FB923C"/>
              <path d="M12 19L11 18.1C9 16.2 8 15.2 8 14.1C8 13.3 8.7 12.6 9.6 12.6C10.1 12.6 10.6 12.9 10.9 13.3L12 14.6L13.1 13.3C13.4 12.9 13.9 12.6 14.4 12.6C15.3 12.6 16 13.3 16 14.1C16 15.2 15 16.2 13 18.1L12 19Z" fill="#FFF"/>
            </svg>
          </div>
          <span>Homie</span>
        </div>
        
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember for 30 days</span>
            </label>
            <a href="#forgot" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <div className="social-login">
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

        <p className="signup-link">
          Don't have an account? <a href="#signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
