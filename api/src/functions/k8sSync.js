import { syncK8sBasic, verifyK8sConnection } from 'src/lib/syncK8s/syncMain'

export const handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors }
  }

  try {
    const body = JSON.parse(event.body)
    const { endpointId, soloVerificar } = body

    // Lógica condicional solicitada
    const result = soloVerificar
      ? await verifyK8sConnection(endpointId)
      : await syncK8sBasic(endpointId)

    return { 
      statusCode: 200, 
      headers: cors, 
      body: JSON.stringify(result) 
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: e.message }),
    }
  }
}