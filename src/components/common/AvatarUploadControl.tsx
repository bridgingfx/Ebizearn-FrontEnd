import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { getApiError, profileApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from './UserAvatar';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

interface AvatarUploadControlProps {
  size?: 'lg' | 'xl';
  showRemove?: boolean;
  className?: string;
}

export const AvatarUploadControl: React.FC<AvatarUploadControlProps> = ({
  size = 'xl',
  showRemove = false,
  className = '',
}) => {
  const { user, updateUser } = useAuth();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError(null);
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Image is too large. Maximum size is 2MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      updateUser(res.data.user);
    } catch (err) {
      setAvatarError(getApiError(err, 'Could not upload the image. Please try again.'));
    } finally {
      setAvatarUploading(false);
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const res = await profileApi.removeAvatar();
      updateUser(res.data.user);
    } catch (err) {
      setAvatarError(getApiError(err, 'Could not remove the image. Please try again.'));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative inline-flex">
        <UserAvatar
          src={avatarPreview || user?.profile?.avatar_url}
          name={user?.name}
          email={user?.email}
          size={size}
          className={`ring-4 ring-white shadow-lg ${avatarUploading ? 'opacity-60' : ''}`}
        />
        <input
          ref={avatarInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          disabled={avatarUploading}
          onClick={() => avatarInput.current?.click()}
          className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#07182F] text-white hover:bg-[#168BFF] shadow-md ring-2 ring-white transition-colors disabled:opacity-50"
          title="Change avatar"
          aria-label="Change avatar"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className={`max-w-44 text-[11px] leading-snug ${avatarError ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          {avatarUploading ? 'Uploading photo...' : avatarError || 'Profile photo: JPG, PNG or WebP up to 2MB'}
        </p>
        {showRemove && user?.profile?.avatar_url && (
          <button
            type="button"
            disabled={avatarUploading}
            onClick={handleRemoveAvatar}
            className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove photo</span>
          </button>
        )}
      </div>
    </div>
  );
};
