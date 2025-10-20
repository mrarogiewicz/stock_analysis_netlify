// /api/save-analysis.ts
// IMPORTANT: @vercel/blob is a Vercel-specific feature and will not work on Netlify.
// To make this "Save to Cloud" feature work, you will need to replace the call to
// `@vercel/blob`'s `put` function with a different file storage solution,
// such as Netlify Large Media, or a third-party service like AWS S3 or Cloudinary.
import { put } from '@vercel/blob';

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { ticker, content } = await request.json();

    if (!ticker || !content) {
      return new Response(JSON.stringify({ error: 'Ticker and content are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize ticker to be safe for filenames
    const safeTicker = ticker.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `analysis/${safeTicker.toUpperCase()}-${Date.now()}.md`;

    const blob = await put(filename, content, {
      access: 'public', // The file will be publicly accessible
      contentType: 'text/markdown',
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: 'Failed to save analysis to cloud storage.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
