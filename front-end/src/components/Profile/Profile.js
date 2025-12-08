import { useState, useRef } from 'react';
import { updateProfilePicture, updateFullName, updateGraduationYear } from '../../services/api';
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
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    graduationYear: user.graduationYear || new Date().getFullYear(),
  });
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
      const compressedImage = await compressImage(file);
      const response = await updateProfilePicture(compressedImage);
      
      if (response.success) {
        setProfileImage(compressedImage);
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

  const handleEditName = async () => {
    if (!editValues.firstName.trim() || !editValues.lastName.trim()) {
      onShowToast?.({ message: 'First and last names are required', type: 'error' });
      return;
    }

    try {
      const response = await updateFullName(editValues.firstName, editValues.lastName);
      
      if (response.success) {
        const updatedUser = { 
          ...user, 
          firstName: editValues.firstName,
          lastName: editValues.lastName
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        setEditingField(null);
        onShowToast?.({ message: 'Full name updated successfully!', type: 'success' });
      } else {
        throw new Error(response.error || 'Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      onShowToast?.({ message: error.message || 'Failed to update name', type: 'error' });
    }
  };

  const handleEditGraduationYear = async () => {
    const year = parseInt(editValues.graduationYear, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      onShowToast?.({ message: 'Please enter a valid year between 2000 and 2100', type: 'error' });
      return;
    }

    try {
      const response = await updateGraduationYear(year);
      
      if (response.success) {
        const updatedUser = { 
          ...user, 
          graduationYear: year
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setEditingField(null);
        onShowToast?.({ message: 'Graduation year updated successfully!', type: 'success' });
      } else {
        throw new Error(response.error || 'Failed to update graduation year');
      }
    } catch (error) {
      console.error('Error updating graduation year:', error);
      onShowToast?.({ message: error.message || 'Failed to update graduation year', type: 'error' });
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
            {editingField === 'name' ? (
              <div className="profile-edit-form">
                <div className="profile-edit-note">You can change your name up to 3 times per year</div>
                <input
                  type="text"
                  placeholder="First name"
                  value={editValues.firstName}
                  onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                  className="profile-edit-input"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={editValues.lastName}
                  onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                  className="profile-edit-input"
                />
                <div className="profile-edit-actions">
                  <button onClick={handleEditName} className="profile-edit-save">Save</button>
                  <button onClick={() => setEditingField(null)} className="profile-edit-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span className="profile-label">Full name</span>
                <div className="profile-value-with-edit">
                  <span className="profile-value">{fullName}</span>
                  <button 
                    className="profile-edit-btn"
                    onClick={() => {
                      setEditValues({ ...editValues, firstName: user.firstName, lastName: user.lastName });
                      setEditingField('name');
                    }}
                  >
                    ✎
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="profile-detail-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{email}</span>
          </div>

          <div className="profile-detail-row">
            {editingField === 'graduationYear' ? (
              <div className="profile-edit-form">
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={editValues.graduationYear}
                  onChange={(e) => setEditValues({ ...editValues, graduationYear: e.target.value })}
                  className="profile-edit-input"
                />
                <div className="profile-edit-actions">
                  <button onClick={handleEditGraduationYear} className="profile-edit-save">Save</button>
                  <button onClick={() => setEditingField(null)} className="profile-edit-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span className="profile-label">Graduation year</span>
                <div className="profile-value-with-edit">
                  <span className="profile-value">{graduationYear}</span>
                  <button 
                    className="profile-edit-btn"
                    onClick={() => {
                      setEditValues({ ...editValues, graduationYear: user.graduationYear || new Date().getFullYear() });
                      setEditingField('graduationYear');
                    }}
                  >
                    ✎
                  </button>
                </div>
              </>
            )}
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
