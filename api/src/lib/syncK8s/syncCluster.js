import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const syncCluster = async (endpoint) => {
  // 1. Obtener usuario actual (Scheduler → 1, Usuario real → su ID)
  const userId = context.currentUser?.id || 1

  // 2. Identity key única e idempotente
  const identity_key = `k8s:${endpoint.id}`

  // 3. Datos base compartidos (create y update)
  const baseData = {
    nombre: endpoint.nombre,
    cod_tipo_cluster: 'K8S',
    descripcion: `Cluster sincronizado desde ${endpoint.url_api}`,
    id_k8s_endpoint: endpoint.id,
    estado: 'ACTIVO',
  }

  // 4. UPSERT completo con auditoría
  return db.cluster.upsert({
    where: { identity_key },

    create: {
      ...baseData,
      identity_key,

      usuario_creacion: userId,
      usuario_modificacion: userId,    // <-- recomendado, consistente con tu estándar
      fecha_creacion: new Date(),
    },

    update: {
      ...baseData,
      fecha_modificacion: new Date(),
      usuario_modificacion: userId,
    },
  })
}
