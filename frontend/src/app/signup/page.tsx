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
      await signup(formData);
      setMessage('Signup successful! You can now log in.');
    } catch (error: any) {
      setMessage(error.message || 'Signup failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          name="name"
          placeholder="Username"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md"
        />
        <select
          name="role"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
        >
          Signup
        </button>
      </form>
      {message && <p className="mt-4 text-center text-secondary">{message}</p>}
    </div>
  );
}