import { Upload } from '@aws-sdk/lib-storage';
import r2Client, { R2_BUCKET_NAME } from './client';

export interface UploadResult {
  key: string;
  url: string;
  success: boolean;
  error?: string;
}

export async function uploadFileToR2(
  file: File,
  folder: string = 'client-documents',
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const key = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: file.type,
        Metadata: {
          'original-name': file.name,
          'upload-date': new Date().toISOString(),
        },
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB chunks
    });

    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded && progress.total) {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress?.(percentage);
      }
    });

    await upload.done();

    // Construct the public URL
    const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${key}`;

    return {
      key,
      url: publicUrl,
      success: true,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      key: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string = 'client-documents',
  onProgress?: (index: number, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFileToR2(files[i], folder, (progress) => {
      onProgress?.(i, progress);
    });
    results.push(result);
  }

  return results;
}

export function validateFile(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}