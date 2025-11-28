// lib/k8s/client.js
import * as k8s from '@kubernetes/client-node'

export const getK8sClient = (endpoint) => {
  const kc = new k8s.KubeConfig()

  // Normalizar la URL (CRÍTICO)
  let server = (endpoint.url_api || "").toString().trim()

  // Eliminar caracteres invisibles
  server = server.replace(/[\s\r\n]+/g, "")

  // Si falta protocolo, agregar https://
  if (!server.startsWith("http://") && !server.startsWith("https://")) {
    server = `https://${server}`
  }

  console.log("[K8sClient] URL usada:", server)

  kc.loadFromOptions({
    clusters: [{
      name: endpoint.nombre,
      server,
      skipTLSVerify: true
    }],
    users: [{
      name: 'sync-bot',
      token: endpoint.token_bearer,
    }],
    contexts: [{
      name: 'default',
      user: 'sync-bot',
      cluster: endpoint.nombre,
    }],
    currentContext: 'default',
  })

  return kc.makeApiClient(k8s.CoreV1Api)
}
