/**
 * League Branding Section Component
 *
 * Photo upload and description editing for leagues.
 */

import { useState } from 'react';
import { ImageIcon, Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Allowed image types and max size (5MB)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface LeagueBrandingSectionProps {
  leagueId: string;
  photoUrl: string;
  description: string;
  onPhotoChange: (url: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function LeagueBrandingSection({
  leagueId,
  photoUrl,
  description,
  onPhotoChange,
  onDescriptionChange,
}: LeagueBrandingSectionProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 5MB.';
    }
    return null;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !leagueId) return;

    // Validate file type and size
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setUploadingPhoto(true);
    try {
      // Sanitize file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const safeExt = allowedExtensions.includes(fileExt || '') ? fileExt : 'jpg';

      const fileName = `${leagueId}.${safeExt}`;
      const filePath = `league-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(filePath);

      onPhotoChange(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <h3 className="text-neutral-800 font-medium mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-burgundy-500" />
        League Branding
      </h3>

      {/* Photo Upload */}
      <div className="mb-6">
        <span className="text-neutral-500 text-sm mb-2 block">League Photo</span>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="League"
              className="w-20 h-20 rounded-xl object-cover border-2 border-cream-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-cream-100 border-2 border-dashed border-cream-300 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-neutral-300" />
            </div>
          )}
          <label className="flex-1">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />
            <div className="flex items-center justify-center gap-2 bg-cream-100 hover:bg-cream-200 border border-cream-200 rounded-xl py-3 px-4 cursor-pointer transition-colors">
              {uploadingPhoto ? (
                <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
              ) : (
                <Upload className="h-5 w-5 text-neutral-500" />
              )}
              <span className="text-neutral-600 text-sm font-medium">
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </span>
            </div>
          </label>
        </div>
        {uploadError && (
          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        <p className="text-neutral-400 text-xs mt-2">
          Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
        </p>
      </div>

      {/* Description */}
      <label className="block">
        <span className="text-neutral-800 font-medium flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-burgundy-500" />
          Description
        </span>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell members what your league is about..."
          className="input min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-neutral-400 text-xs mt-1 text-right">{description.length}/500</p>
      </label>
    </div>
  );
}
