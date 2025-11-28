import { db } from 'src/lib/db'

export const syncCluster = async (endpoint) => {
  // Generamos la key única (Idempotencia)
  const identity_key = `k8s:${endpoint.id}`

  const baseData = {
    nombre: endpoint.nombre,
    cod_tipo_cluster: 'K8S',
    descripcion: `Cluster sincronizado desde ${endpoint.url_api}`,
    id_k8s_endpoint: endpoint.id,
    estado: 'ACTIVO',
  }

  // UPSERT: Si existe actualiza, si no crea. 
  // Retorna siempre el objeto Cluster con su ID.
  return db.cluster.upsert({
    where: { identity_key },
    create: {
      ...baseData,
      identity_key,
      usuario_creacion: 1,
    },
    update: {
      ...baseData,
      fecha_modificacion: new Date(),
      usuario_modificacion: 1,
    }
  })
}