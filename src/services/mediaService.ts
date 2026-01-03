
/**
 * MEDIA SERVICE ABSTRACTION LAYER
 * -------------------------------
 * This service handles all file uploads.
 * 
 * CURRENT STATE (MOCK):
 * It converts Files to Base64 strings and returns them immediately.
 * This simulates a successful upload but keeps data in localStorage.
 * 
 * FUTURE STATE (REAL BACKEND):
 * You will replace the logic inside `uploadMedia` to send the file
 * to Cloudinary/AWS S3/Firebase Storage and return the secure URL.
 * 
 * The rest of the React application will NOT need to change.
 */

export const uploadMedia = async (fileOrBase64: File | string | Blob): Promise<string> => {
  // Simulate network delay for realism
  // await new Promise(resolve => setTimeout(resolve, 500));

  // --- FUTURE CLOUDINARY IMPLEMENTATION EXAMPLE ---
  /*
  const formData = new FormData();
  formData.append('file', fileOrBase64);
  formData.append('upload_preset', 'your_preset');
  
  const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
      method: 'POST',
      body: formData
  });
  const data = await response.json();
  return data.secure_url;
  */

  // --- CURRENT MOCK IMPLEMENTATION (Base64) ---
  if (typeof fileOrBase64 === 'string') {
      // Already a Base64 string (e.g., from Cropper)
      return fileOrBase64;
  }

  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileOrBase64 as Blob);
      reader.onloadend = () => {
          resolve(reader.result as string);
      };
      reader.onerror = (error) => {
          console.error("Media Upload Error:", error);
          reject(error);
      };
  });
};
