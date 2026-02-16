// api/storage/upload.ts
/**
 * Vercel serverless function (TypeScript)
 * - Place as api/storage/upload.ts
 * - Requires: "formidable" and "@azure/storage-blob" in dependencies
 *
 * Behavior:
 * - multipart/form-data -> parsed by formidable -> each uploaded file is read and uploaded to Azure
 * - raw binary body -> require ?blobName=... or x-blob-name header
 *
 * Notes:
 * - Set STORAGE_ACCOUNT_NAME, CONTAINER_NAME, AZURE_STORAGE_ACCOUNT_KEY in Vercel environment variables
 * - Keep AZURE_STORAGE_ACCOUNT_KEY secret (do NOT expose to the browser)
 */

import formidable, { File as FormidableFile, Fields, Files } from 'formidable';
import type { IncomingMessage } from 'node:http';
import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import {
  StorageSharedKeyCredential,
  BlobServiceClient
} from '@azure/storage-blob';

export const config = {
  api: {
    bodyParser: false, // allow formidable to parse the raw request
  },
};

const sanitizeEnv = (v?: string) => (v || '').toString().trim().replace(/^["']|["'];?$/g, '');

const STORAGE_ACCOUNT_NAME = sanitizeEnv(process.env.STORAGE_ACCOUNT_NAME || process.env.VITE_STORAGE_ACCOUNT_NAME);
const CONTAINER_NAME = sanitizeEnv(process.env.CONTAINER_NAME || process.env.VITE_CONTAINER_NAME);
const STORAGE_ACCOUNT_KEY = sanitizeEnv(process.env.AZURE_STORAGE_ACCOUNT_KEY);
// Optional static SAS fallback — only if you plan to use it
const SAS_TOKEN = sanitizeEnv(process.env.SAS_TOKEN || process.env.VITE_SAS_TOKEN).replace(/^\?/, '');

const AZURE_STORAGE_API_VERSION = '2020-10-02';

if (!STORAGE_ACCOUNT_NAME || !CONTAINER_NAME) {
  // Will still compile and deploy; you will see warnings in logs if these are missing.
  console.warn('Missing STORAGE_ACCOUNT_NAME or CONTAINER_NAME env vars.');
}

const uploadBufferToBlob = async (buffer: Buffer, blobName: string, contentType?: string): Promise<string> => {
  // Prefer server-side StorageSharedKeyCredential for uploads (do not expose the key to client).
  if (!STORAGE_ACCOUNT_KEY && !SAS_TOKEN) {
    throw new Error('No AZURE_STORAGE_ACCOUNT_KEY or SAS_TOKEN available for upload.');
  }

  if (STORAGE_ACCOUNT_KEY) {
    const credential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCOUNT_KEY);
    const serviceClient = new BlobServiceClient(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, credential);
    const containerClient = serviceClient.getContainerClient(CONTAINER_NAME);

    try {
      await containerClient.createIfNotExists();
    } catch (e) {
      // ignore creation errors (container may already exist or permission limited)
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' }
    });

    const safeName = encodeURIComponent(blobName);
    return `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${safeName}`;
  }

  // Fallback: use static SAS token (less secure; SAS_TOKEN must be configured)
  const safeName = encodeURIComponent(blobName);
  const urlWithSas = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${safeName}?${SAS_TOKEN}`;
  // see if this will deploy
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const res = await fetch(urlWithSas, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-version': AZURE_STORAGE_API_VERSION,
      'Content-Type': contentType || 'application/octet-stream',
      'x-ms-blob-content-type': contentType || 'application/octet-stream',
    },
    body: arrayBuffer as unknown as ArrayBuffer,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fallback SAS upload failed: ${res.status} ${res.statusText} ${text}`);
  }
  return `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${safeName}`;
};

type AnyRequest = {
  method?: string;
  headers: Record<string, string | undefined> & { host?: string; 'x-forwarded-proto'?: string };
  url?: string;
  // Node request is async iterable for the body
  [key: string]: unknown;
};

type AnyResponse = {
  status?: (code: number) => AnyResponse;
  json?: (body: unknown) => void;
  setHeader?: (k: string, v: string) => void;
  end?: (body?: unknown) => void;
  [key: string]: unknown;
};

// NOSONAR: Cognitive complexity acceptable for upload handler - handles multiple upload scenarios
export default async function handler(req: AnyRequest, res: AnyResponse): Promise<void> { // NOSONAR typescript:S3776
  try {
    if (req.method !== 'POST') {
      res.status?.(405);
      res.json?.({ error: 'Method not allowed' });
      return;
    }

    const contentType = (req.headers['content-type'] || '').toLowerCase();

    // Multipart/form-data -> formidable
    if (contentType.startsWith('multipart/form-data')) {
      const form = formidable({ multiples: true, keepExtensions: true });

      const { files } = await new Promise<{ fields: Fields; files: Files }>(
        (resolve, reject) => {
          form.parse(req as unknown as IncomingMessage, (err: Error | null, fields: Fields, parsedFiles: Files) => {
            if (err) return reject(err);
            resolve({ fields, files: parsedFiles });
          });
        },
      );

      // Normalize files into array
      const flatFiles: FormidableFile[] = [];
      for (const key of Object.keys(files || {})) {
        const entry = files[key];
        if (Array.isArray(entry)) flatFiles.push(...entry);
        else if (entry) flatFiles.push(entry as FormidableFile);
      }

      if (flatFiles.length === 0) {
        res.status?.(400);
        res.json?.({ error: 'No files uploaded' });
        return;
      }

      const urls: string[] = [];
      for (const f of flatFiles) {
        // formidable v3 stores the path in f.filepath
        const legacyFile = f as FormidableFile & { file?: string; path?: string };
        const pathKey = legacyFile.filepath || legacyFile.file || legacyFile.path;
        if (!pathKey) continue;
        const buffer = await fs.readFile(pathKey);
        const blobName = f.originalFilename || f.newFilename || `upload-${Date.now()}`;
        const url = await uploadBufferToBlob(buffer, blobName, f.mimetype || 'application/octet-stream');
        urls.push(url);
        // cleanup temp file
        await fs.unlink(pathKey).catch(() => null);
      }

      res.status?.(201);
      res.json?.({ urls });
      return;
    }

    // Raw binary upload -> require blobName in query or header
    // Build URL from request to properly read query params
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const reqUrl = `${proto}://${host}${req.url || ''}`;
    const urlObj = new URL(reqUrl);
    const blobName = urlObj.searchParams.get('blobName') || req.headers['x-blob-name'];
    if (!blobName) {
      res.status?.(400);
      res.json?.({ error: 'blobName required (query or x-blob-name header) for raw uploads' });
      return;
    }
    const resolvedBlobName = typeof blobName === 'string' ? blobName : String(blobName);

    // Read raw body from async iterable request
    const chunks: Buffer[] = [];
    for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    console.log('buffer', buffer);
    if (!buffer || buffer.length === 0) {
      res.status?.(400);
      res.json?.({ error: 'No body provided for raw upload' });
      return;
    }

    const uploadContentType = req.headers['x-upload-content-type'] || req.headers['content-type'] || 'application/octet-stream';
    const blobUrl = await uploadBufferToBlob(buffer, resolvedBlobName, uploadContentType);
    res.status?.(201);
    res.json?.({ url: blobUrl });
    return;
  } catch (err: unknown) {
    console.error('api/storage/upload error:', err);
    try {
      res.status?.(500);
      const message = err instanceof Error ? err.message : 'Upload error';
      res.json?.({ error: message });
    } catch {
      // swallow
    }
  }
}
