'use client';

import { useState, useEffect } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        if (parsedUser.profileImage) {
          // Fix: Check if the URL is already absolute or needs the backend URL
          const imageUrl = parsedUser.profileImage.startsWith('http') 
            ? parsedUser.profileImage 
            : `${BACKEND}${parsedUser.profileImage}`;
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (!user || !user.token) {
        throw new Error('Not authenticated');
      }
      
      // Validate passwords match if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // First upload image if one is selected
      let updatedProfileImage = user.profileImage;
      if (profileImage) {
        try {
          const formData = new FormData();
          formData.append('image', profileImage);  // Ensure field name matches backend
          
          console.log('Uploading image:', profileImage.name, profileImage.type, profileImage.size);
          
          const imageRes = await fetch(`${BACKEND}/users/profile/image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.token}`
            },
            // Don't set Content-Type with FormData - it will be set automatically with boundary
            body: formData
          });
          
          if (!imageRes.ok) {
            let errorText = 'Unknown error';
            try {
              const errorData = await imageRes.json();
              errorText = errorData.message || `HTTP ${imageRes.status}: ${imageRes.statusText}`;
            } catch {
              errorText = `HTTP ${imageRes.status}: ${imageRes.statusText}`;
            }
            throw new Error(`Image upload failed: ${errorText}`);
          }
          
          const imageData = await imageRes.json();
          console.log('Image upload successful:', imageData);
          updatedProfileImage = imageData.profileImage;

          // Add this line to show the image immediately after upload
          setImagePreview(`${BACKEND}${imageData.profileImage}`);
        } catch (error) {
          console.error('Image upload error details:', error);
          throw error; // Re-throw to be caught by the outer catch
        }
      }
      
      // Update user profile
      const updateData: any = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Only send request if there are changes
      if (Object.keys(updateData).length > 0) {
        const profileRes = await fetch(`${BACKEND}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (!profileRes.ok) {
          throw new Error('Failed to update profile');
        }
        
        const updatedUser = await profileRes.json();
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedProfileImage
        }));
        
        setUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedProfileImage
        });
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile image */}
          <div className="flex flex-col items-center">
            <div className="mb-4 w-40 h-40 rounded-full overflow-hidden bg-background border-2 border-primary/50 relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-4xl text-primary">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-60 pointer-events-none"></div>
            </div>
            <label className="cursor-pointer cyberpunk-btn-outline">
              Upload Photo
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Profile form */}
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-2">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}