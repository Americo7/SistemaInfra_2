import { listarNodosK8s } from 'src/services/k8s/k8s'
import { db } from 'src/lib/db'

export const handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  // Manejo de la solicitud
  try {
    const body = JSON.parse(event.body || '{}')
    const { endpointId } = body

    if (!endpointId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'endpointId es requerido' }),
      }
    }

    console.log(`=== [k8sSync] Iniciando sync para ID: ${endpointId} ===`)

    // 1. Obtener datos crudos de Kubernetes
    const nodosRaw = await listarNodosK8s(endpointId)

    // 2. Buscar o Crear el Cluster Padre en tu BD
    // Asumimos que un Endpoint = Un Cluster principal
    const epData = await db.k8sEndpoint.findUnique({ where: { id: endpointId } })

    const nombreCluster = `Cluster-${epData.nombre}`

    // Upsert del Cluster (Crear si no existe, actualizar si existe)
    const cluster = await db.cluster.upsert({
      where: {
        nombre_id_k8s_endpoint: { // Usando la clave compuesta unique del schema
          nombre: nombreCluster,
          id_k8s_endpoint: endpointId
        }
      },
      update: { fecha_modificacion: new Date() },
      create: {
        nombre: nombreCluster,
        cod_tipo_cluster: 'KUBERNETES',
        descripcion: `Cluster importado de ${epData.url_api}`,
        id_k8s_endpoint: endpointId,
        estado: 'ACTIVO',
        usuario_creacion: 1, // Ajustar según tu lógica de usuarios
      },
    })

    console.log(`[k8sSync] Cluster gestionado en BD: ID ${cluster.id}`)

    // 3. Sincronizar Nodos
    const resultados = []

    for (const nodo of nodosRaw) {
      // Intentar encontrar una IP para el nodo
      const ipAddress = nodo.addresses.find(a => a.type === 'InternalIP')?.address

      // Upsert de cada Nodo
      const nodoGuardado = await db.clusterNodo.upsert({
        where: { k8s_uid: nodo.uid }, // Usamos el UID único de K8s
        update: {
          nombre: nodo.name,
          rol: nodo.roles || 'worker',
          fecha_modificacion: new Date(),
        },
        create: {
          clusterId: cluster.id,
          nombre: nodo.name,
          k8s_uid: nodo.uid,
          nodoTipo: 'FISICO', // Por defecto asumimos físico, luego se puede cruzar con VMs
          rol: nodo.roles || 'worker',
          estado: 'ACTIVO',
          usuario_creacion: 1,
        },
      })
      resultados.push(nodoGuardado)
    }

    // 4. Actualizar fecha de sync del Endpoint
    await db.k8sEndpoint.update({
      where: { id: endpointId },
      data: { fecha_ultima_sync: new Date() },
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: 'Sincronización K8s exitosa',
        cluster: cluster.nombre,
        nodosSincronizados: resultados.length,
        detalle: resultados.map(n => n.nombre)
      }),
    }

  } catch (error) {
    console.error('=== [k8sSync] ERROR ===', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    }
  }
}