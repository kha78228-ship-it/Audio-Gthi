/**
 * Utility to process, compress and convert local image files to high-quality lightweight Data URLs.
 * Eliminates the need to find and copy external image URLs.
 */
export async function fileToDataUrl(
  file: File, 
  maxWidth = 1200, 
  maxHeight = 1200, 
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp tin từ thiết bị.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể tải hình ảnh.'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas context fails
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress to WebP or JPEG
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          const compressedDataUrl = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support webp export, fallback to jpeg
          if (compressedDataUrl.startsWith('data:image/webp')) {
            resolve(compressedDataUrl);
          } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        } catch {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
