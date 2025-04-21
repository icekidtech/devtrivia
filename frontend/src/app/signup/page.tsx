'use client';

import { useState } from 'react';
import { signup } from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'USER' });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signup(formData);
      localStorage.setItem('user', JSON.stringify({
        name: response.user.name,
        role: response.user.role,
        email: response.user.email,
        token: response.token,
      }));
      // Redirect to dashboard
      window.location.href = `/${response.user.role.toLowerCase()}/dashboard`;
    } catch (error: any) {
      if (error.message.includes('User with this email already exists')) {
        setMessage('This email is already registered. Please use a different email.');
      } else if (error.message.includes('User with this username already exists')) {
        setMessage('This username is already taken. Please choose another.');
      } else {
        setMessage('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-darkBackground">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-darkForeground mb-6">
          Signup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300" />
          <input type="text" name="name" placeholder="Username" onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300" />
          <select name="role" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300">
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition duration-300">
            Signup
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-600 dark:text-green-400">{message}</p>}
      </div>
    </div>
  );
}