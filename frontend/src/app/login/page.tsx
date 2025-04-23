'use client';

import { useState } from 'react';
import Link from 'next/link';
import './login.css';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      // Store complete user object with token
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }));

      window.location.href = `/${user.role.toLowerCase()}/dashboard`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Login failed');
      }
    }
  };

  return (
    <div className="login-container cyberpunk-login">
      <div className="wrapper">
        <span className="bg-animate"></span>
        <span className="bg-animate2"></span>

        <div>
          <div className="form-box login">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 21} as React.CSSProperties}>Login</h2>
            <form onSubmit={handleSubmit}>
              {message && (
                <div className="error-message animation" style={{"--i": 0, "--j": 20} as React.CSSProperties}>
                  {message}
                </div>
              )}
              
              <div className="input-box animation" style={{"--i": 1, "--j": 22} as React.CSSProperties}>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
                <label>Email</label>
                <i className="class"></i>
              </div>

              <div className="input-box animation" style={{"--i": 2, "--j": 23} as React.CSSProperties}>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <label>Password</label>
                <i className="class"></i>
              </div>

              <button type="submit" className="btn animation" style={{"--i": 3, "--j": 24} as React.CSSProperties}>
                Login
              </button>
              
              <div className="logreg-link animation" style={{"--i": 4, "--j": 25} as React.CSSProperties}>
                <p>Don't have an account? <Link href="/signup" className="register-link text-primary">Sign Up</Link></p>
                <p>Forgot Password? <Link href="#" className="register-link text-secondary">Reset</Link></p>
              </div>
            </form>
          </div>

          <div className="info-text login">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 20} as React.CSSProperties}>Welcome Back!</h2>
            <p className="animation" style={{"--i": 1, "--j": 21} as React.CSSProperties}>
              Dev Trivia - Test your knowledge, compete with others, and have fun!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}