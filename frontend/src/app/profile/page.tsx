'use client';

import { useState, useEffect, ChangeEvent } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id?: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    token?: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // If user has a profile image, set the preview
        if (userData.profileImage) {
          setImagePreview(userData.profileImage);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (!user?.id || !user?.token) {
        throw new Error('User information missing. Please log in again.');
      }
      
      // Validate passwords match if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // Handle image upload first if there's an image
      let profileImageUrl = user.profileImage;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);
        
        const imageRes = await fetch(`${BACKEND}/users/profile-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        });
        
        if (!imageRes.ok) {
          throw new Error('Failed to upload image');
        }
        
        const imageData = await imageRes.json();
        profileImageUrl = imageData.imageUrl;
      }
      
      // Update user data
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };
      
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      if (profileImageUrl) {
        updateData.profileImage = profileImageUrl;
      }
      
      const res = await fetch(`${BACKEND}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await res.json();
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: profileImageUrl,
      }));
      
      setUser({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: profileImageUrl,
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="text-center mt-10">No user data found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-2">
            {imagePreview ? (
              // eslint-disable-next-line
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
            />
          </div>
        </div>
        
        {/* Password Change */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-300"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}