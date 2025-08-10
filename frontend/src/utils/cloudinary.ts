export const CLOUDINARY_CONFIG = {
  cloudName: 'dtfpje06i',
  apiKey: '154877412554859',
  uploadPreset: 'profile_images',
  folder: 'profile_images'
};

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error('Upload failed');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}
