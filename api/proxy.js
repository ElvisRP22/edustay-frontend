export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const { pathname, search } = url;

  // URL base del backend desde las variables de entorno de Vercel
  // Si no está configurada, usa la de por defecto (Fly.io)
  const backendUrl = process.env.BACKEND_API_URL || 'https://edustay-backend.fly.dev';

  // Construir la URL destino del backend
  const targetUrl = `${backendUrl.replace(/\/$/, '')}${pathname}${search}`;

  try {
    // Clonar las cabeceras originales
    const headers = new Headers(req.headers);

    // Ejecutar la petición al backend desde el Edge
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      redirect: 'manual'
    });

    // Retornar la respuesta tal cual del backend
    return response;
  } catch (error) {
    console.error('Error en el Edge Proxy de Vercel:', error);
    return new Response(
      JSON.stringify({ error: 'Error de Proxy en el servidor Edge', details: error.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
