'use client';

import { useState } from 'react';
import Link from 'next/link';
import './signup.css';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessageType('error');
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      }));
      
      setMessageType('success');
      setMessage('Signup successful! Redirecting...');
      
      // Redirect after a short delay so the user can see the success message
      setTimeout(() => {
        window.location.href = `/${data.user.role.toLowerCase()}/dashboard`;
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('email already exists')) {
          setMessage('This email is already registered. Please use a different email.');
        } else if (error.message.includes('username already exists')) {
          setMessage('This username is already taken. Please choose another.');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="cyberpunk-signup login-container">
      <div className="wrapper">
        <span className="bg-animate"></span>
        <span className="bg-animate2"></span>

        <div>
          <div className="form-box signup">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 21} as React.CSSProperties}>Sign Up</h2>
            <form onSubmit={handleSubmit}>
              {message && (
                <div 
                  className={`${messageType === 'success' ? 'success-message' : 'error-message'} animation`} 
                  style={{"--i": 0, "--j": 20} as React.CSSProperties}
                >
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
                  type="text" 
                  id="name"
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
                <label>Username</label>
                <i className="class"></i>
              </div>

              <div className="input-box animation" style={{"--i": 3, "--j": 24} as React.CSSProperties}>
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

              <div className="select-box animation" style={{"--i": 4, "--j": 25} as React.CSSProperties}>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <label>Role</label>
              </div>

              <button type="submit" className="btn animation" style={{"--i": 5, "--j": 26} as React.CSSProperties}>
                Sign Up
              </button>
              
              <div className="logreg-link animation" style={{"--i": 6, "--j": 27} as React.CSSProperties}>
                <p>Already have an account? <Link href="/login" className="login-link text-cyan-400">Login</Link></p>
              </div>
            </form>
          </div>

          <div className="info-text signup">
            <h2 className="animation neon-text" style={{"--i": 0, "--j": 20} as React.CSSProperties}>Join DevTrivia!</h2>
            <p className="animation" style={{"--i": 1, "--j": 21} as React.CSSProperties}>
              Create your account to start creating quizzes, join competitions, and test your knowledge with our tech trivia platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}