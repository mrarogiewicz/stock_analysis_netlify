// /api/get-key.ts
export default async (request, context) => {
  // This code runs on the server, so it has secure access to environment variables.
  const apiKey = process.env.API_KEY;

  if (apiKey) {
    // If the key is found, send it back to the frontend.
    return new Response(JSON.stringify({ apiKey: apiKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // If the key is not found on the server, send an error.
    return new Response(JSON.stringify({ error: "The 'API_KEY' environment variable is not set on the Netlify server." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
