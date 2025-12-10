// src/functions/status.js
// Este endpoint verifica si el servidor API de Redwood está activo.

export const handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors }
  }
  
  // Si llegamos aquí, el servidor Node.js y el runtime de Redwood están operativos.
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
    body: JSON.stringify({ 
      status: 'ok', 
      service: 'Sistema Infra API funcionando correctamente',
      timestamp: new Date().toISOString()
    }),
  }
}