import { redis } from '@tck/shared/src/redis';
import { logger } from '@tck/shared/src/logger';

// ============================================
// MEDIA PROCESSING SERVICE
// Cloudinary integration + media pipeline management
// ============================================

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  };
}

// ============================================
// UPLOAD SIGNATURE (secure server-side)
// ============================================

export async function generateUploadSignature(folder: string, userId: string): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}> {
  const config = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  // HMAC-SHA1 signature for Cloudinary
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(config.apiSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(paramsToSign));
  const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  logger.info(`Upload signature generated for user ${userId}`, 'Media', { folder });

  return { signature, timestamp, cloudName: config.cloudName, apiKey: config.apiKey, folder };
}

// ============================================
// VIDEO PROCESSING PIPELINE
// ============================================

export interface VideoProcessingJob {
  videoUrl: string;
  userId: string;
  contentType: 'reel' | 'post' | 'message' | 'story';
  contentId: string;
  options: {
    generateThumbnail: boolean;
    generateSubtitles: boolean;
    compress: boolean;
    maxDurationSec?: number;
  };
}

export async function enqueueVideoProcessing(job: VideoProcessingJob): Promise<string> {
  const jobId = `vid:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  await redis.lpush('queue:video', JSON.stringify({ id: jobId, ...job, createdAt: Date.now() }));
  logger.info(`Video processing enqueued: ${jobId}`, 'Media', { contentType: job.contentType });
  return jobId;
}

export async function getVideoProcessingStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
  const status = await redis.get(`vid:status:${jobId}`);
  return (status as string) ?? 'pending';
}

// ============================================
// THUMBNAIL GENERATION
// ============================================

export function getThumbnailUrl(videoUrl: string, width = 480, height = 854): string {
  // Cloudinary video thumbnail transformation
  const config = getConfig();
  if (videoUrl.includes('cloudinary')) {
    return videoUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,so_1/`).replace(/\.\w+$/, '.jpg');
  }
  return videoUrl; // Fallback
}

// ============================================
// IMAGE OPTIMIZATION
// ============================================

export function getOptimizedImageUrl(imageUrl: string, width = 800, quality = 'auto'): string {
  const config = getConfig();
  if (imageUrl.includes('cloudinary')) {
    return imageUrl.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }
  return imageUrl;
}

// ============================================
// MEDIA QUOTAS
// ============================================

export async function checkMediaQuota(userId: string, fileSizeMb: number): Promise<{ allowed: boolean; usedMb: number; limitMb: number }> {
  const key = `media:quota:${userId}`;
  const usedStr = await redis.get(key);
  const used = parseFloat(usedStr as string) || 0;

  const limit = 500; // 500MB per user (adjust per plan)
  const allowed = used + fileSizeMb <= limit;

  if (allowed) {
    await redis.set(key, (used + fileSizeMb).toString());
  }

  return { allowed, usedMb: used, limitMb: limit };
}
