import { supabase } from '../db/supabaseClient';

export const SUPABASE_PERFUMES_BUCKET = 'Alura Parfums';
export const TARGET_IMAGE_DIMENSION = 1000; // 1000x1000 px standard

export interface ProcessImageResult {
  url: string;
  blob: Blob;
  uploadedToStorage: boolean;
  storagePath?: string;
  warning?: string;
}

export class ImageStorageService {
  /**
   * Resizes and formats any image (File, Blob, or URL) to an exact 1000x1000 px canvas.
   * Centers the fragrance flacon with high-clarity smoothing and elegant studio studio background.
   */
  static async resizeTo1000x1000(source: File | Blob | string): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      let objectUrlToRevoke: string | null = null;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = TARGET_IMAGE_DIMENSION;
          canvas.height = TARGET_IMAGE_DIMENSION;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('No se pudo inicializar el contexto 2D de procesamiento.');
          }

          // Fill clean neutral luxury studio canvas background (pure white)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, TARGET_IMAGE_DIMENSION, TARGET_IMAGE_DIMENSION);

          // Enable high-fidelity smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Center and scale to fit inside 1000x1000 with elegant studio margin (940px)
          const maxDim = 940;
          const scale = Math.min(maxDim / img.width, maxDim / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = (TARGET_IMAGE_DIMENSION - drawW) / 2;
          const drawY = (TARGET_IMAGE_DIMENSION - drawH) / 2;

          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          // Export as JPEG with 95% quality for luxury display
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

          canvas.toBlob(
            (blob) => {
              if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
              }

              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                reject(new Error('Fallo al exportar el lienzo a formato 1000x1000'));
              }
            },
            'image/jpeg',
            0.95
          );
        } catch (err) {
          if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
          reject(err);
        }
      };

      img.onerror = () => {
        if (typeof source === 'string' && !img.src.includes('/api/proxy-image')) {
          // Retry via local proxy to bypass strict CORS
          img.src = `/api/proxy-image?url=${encodeURIComponent(source)}`;
          return;
        }
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        reject(new Error('No se pudo cargar la imagen para formatear a 1000x1000.'));
      };

      if (typeof source === 'string') {
        const needsProxy = source.includes('fimgs.net') || source.includes('fragrantica');
        img.src = needsProxy ? `/api/proxy-image?url=${encodeURIComponent(source)}` : source;
      } else {
        objectUrlToRevoke = URL.createObjectURL(source);
        img.src = objectUrlToRevoke;
      }
    });
  }

  /**
   * Uploads an exact 1000x1000 JPEG blob into the Supabase storage bucket "Alura Parfums".
   */
  static async uploadBlobToBucket(
    blob: Blob,
    perfumeName: string
  ): Promise<{ publicUrl: string; storagePath: string; error?: string }> {
    const slug = perfumeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30) || 'flacon';
    const filename = `${slug}-${Date.now()}.jpg`;
    const storagePath = `catalog/${filename}`;

    const file = new File([blob], filename, { type: 'image/jpeg' });

    try {
      // Primary bucket name as configured in Supabase: "Alura Parfums"
      const { data, error } = await supabase.storage
        .from(SUPABASE_PERFUMES_BUCKET)
        .upload(storagePath, file, {
          contentType: 'image/jpg', // Matches allowed MIME type in Supabase
          upsert: true,
        });

      if (error) {
        console.warn(`Supabase Storage upload warning (${SUPABASE_PERFUMES_BUCKET}):`, error);
        return {
          publicUrl: '',
          storagePath,
          error: error.message || 'Error de permisos o política RLS en el bucket.',
        };
      }

      // Retrieve public URL from the bucket
      const { data: urlData } = supabase.storage
        .from(SUPABASE_PERFUMES_BUCKET)
        .getPublicUrl(storagePath);

      return {
        publicUrl: urlData.publicUrl,
        storagePath,
      };
    } catch (err: any) {
      console.error('Error uploading to Supabase bucket:', err);
      return {
        publicUrl: '',
        storagePath,
        error: err.message || 'Fallo de conexión con Supabase Storage.',
      };
    }
  }

  /**
   * Complete pipeline:
   * 1. Resizes input (file or URL) to exact 1000x1000 px.
   * 2. Uploads the processed image to the Supabase Storage bucket 'Alura Parfums'.
   * 3. Returns permanent public URL from Supabase, or optimized 1000x1000 preview if RLS policy needs configuration.
   */
  static async processAndStoreImage(
    source: File | Blob | string,
    perfumeName: string
  ): Promise<ProcessImageResult> {
    try {
      // Step 1: Format to 1000x1000
      const { blob, dataUrl } = await this.resizeTo1000x1000(source);

      // Step 2: Upload to Supabase Bucket "Alura Parfums"
      const uploadRes = await this.uploadBlobToBucket(blob, perfumeName);

      if (uploadRes.publicUrl && !uploadRes.error) {
        return {
          url: uploadRes.publicUrl,
          blob,
          uploadedToStorage: true,
          storagePath: uploadRes.storagePath,
        };
      }

      // If RLS blocked anon write, return the 1000x1000 dataUrl so UI works smoothly
      return {
        url: dataUrl,
        blob,
        uploadedToStorage: false,
        storagePath: uploadRes.storagePath,
        warning: uploadRes.error,
      };
    } catch (err: any) {
      // In case of CORS error on external images
      console.warn('Image processing fallback:', err);
      if (typeof source === 'string') {
        return {
          url: source,
          blob: new Blob(),
          uploadedToStorage: false,
          warning: 'Imagen externa asignada directamente (CORS impidió canvas local).',
        };
      }
      throw err;
    }
  }
}
