import { useState, useRef } from 'react';
import { updateProfilePicture } from '../../services/api';
import './Profile.css';

export default function Profile({ navigateTo, onShowToast }) {
  const storedUser = sessionStorage.getItem('user');
  let user = {};
  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Failed to parse user from sessionStorage:', err);
  }

  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your Name';
  const email = user.email || user.nyuEmail || 'Email not set';
  const graduationYear = user.graduationYear ? `Class of ${user.graduationYear}` : 'Graduation year not set';
  const avatarUrl = profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=6b46c1&color=fff`;

  // Compress image before upload
  const compressImage = (file, maxWidth = 400, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.({ message: 'Please upload a valid image file', type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      // Compress the image
      const compressedImage = await compressImage(file);
      
      // Update profile picture via API
      const response = await updateProfilePicture(compressedImage);
      
      if (response.success) {
        setProfileImage(compressedImage);
        
        // Update sessionStorage
        const updatedUser = { ...user, profileImage: compressedImage };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        onShowToast?.({ message: 'Profile picture updated successfully!', type: 'success' });
      } else {
        throw new Error(response.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      onShowToast?.({ message: error.message || 'Failed to update profile picture', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img src={avatarUrl} alt={fullName} className="profile-avatar" />
            <button 
              className="profile-avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Change profile picture"
            >
              {isUploading ? '...' : '✎'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-email">{email}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-label">Full name</span>
            <span className="profile-value">{fullName}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{email}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-label">Graduation year</span>
            <span className="profile-value">{graduationYear}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-secondary" onClick={() => navigateTo('settings')}>
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
