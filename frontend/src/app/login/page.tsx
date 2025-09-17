'use client';

import { useState } from 'react';
import Link from 'next/link';
import './login.css';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType('error');
        
        // Handle specific error cases
        if (data.message?.includes('User not found')) {
          setMessage("User not found.");
          return;
        }
        
        if (data.message?.includes('Invalid password')) {
          setMessage('Incorrect password. Please try again or reset your password.');
          return;
        }
        
        // General error
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      }));
      
      setMessageType('success');
      setMessage('Login successful! Redirecting...');
      
      // Redirect based on user role
      setTimeout(() => {
        window.location.href = `/${data.user.role.toLowerCase()}/dashboard`;
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Login failed. Please try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="wrapper">
        <span className="bg-animate"></span>
        <span className="bg-animate2"></span>
        
        <div>
          <div className="form-box login">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 18} as React.CSSProperties}>Login</h2>
            <form onSubmit={handleSubmit}>
              {message && (
                <div 
                  className={`${messageType === 'success' ? 'success-message' : 'error-message'} animation`} 
                  style={{"--i": 0, "--j": 17} as React.CSSProperties}
                >
                  {message === "User not found." ? (
                    <span>
                      User not found. Would you like to <Link href="/signup" className="text-cyan-400 underline">sign up</Link> instead?
                    </span>
                  ) : (
                    message
                  )}
                </div>
              )}
              
              <div className="input-box animation" style={{"--i": 1, "--j": 19} as React.CSSProperties}>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <label>Email</label>
                <i className="class"></i>
              </div>
              
              <div className="input-box animation" style={{"--i": 2, "--j": 20} as React.CSSProperties}>
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <label>Password</label>
                <i className="class"></i>
              </div>
              
              <div className="remember-forgot animation" style={{"--i": 3, "--j": 21} as React.CSSProperties}>
                <label><input type="checkbox" />Remember me</label>
                <Link href="/forgot-password">Forgot Password?</Link>
              </div>
              
              <button type="submit" className="btn animation" style={{"--i": 4, "--j": 22} as React.CSSProperties}>
                Login
              </button>
              
              <div className="logreg-link animation" style={{"--i": 5, "--j": 23} as React.CSSProperties}>
                <p>Don&apos;t have an account? <Link href="/signup" className="register-link text-cyan-400">Sign Up</Link></p>
              </div>
            </form>
          </div>
          
          <div className="info-text login">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 17} as React.CSSProperties}>Welcome Back!</h2>
            <p className="animation" style={{"--i": 1, "--j": 18} as React.CSSProperties}>
              Log in to continue your journey with DevTrivia - where tech knowledge meets fun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}