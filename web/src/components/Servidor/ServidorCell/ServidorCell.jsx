import Servidor from 'src/components/Servidor/Servidor'

// QUERY DE DETALLE: Profunda.
// Aquí pedimos TODO porque estamos viendo un solo registro.
export const QUERY = gql`
  query FindServidorById($id: Int!) {
    servidor(id: $id) {
      id
      nombre
      cod_inventario_agetic
      cod_tipo_servidor
      serie
      marca
      modelo
      ram
      almacenamiento
      ip_primaria
      sistema_operativo
      estado_operativo
      estado
      usuario_creacion
      fecha_creacion
      usuario_modificacion
      fecha_modificacion
      id_data_center
      identity_key
      data_centers {
        id
        nombre
      }

      servidores_padre {
        id
        nombre
      }
      servidores_hijos {
        id
        nombre
      }
      maquinas {
        id
        nombre
        proxmox_vmid
        ip
        so
        ram
        cpu
        almacenamiento
        estado_operativo
      }

      despliegue {
        id
        estado_despliegue
        fecha_despliegue
        componentes {
          nombre
        }
      }

      cluster_nodos {
        id
        nodoTipo
        rol
        estado
        cluster {
          id
          nombre
          cod_tipo_cluster
        }
      }

      infra_afectada {
        id
        eventos {
          id
          cod_tipo_evento
          descripcion
          fecha_evento
          estado_evento
          solicitante
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando detalles del servidor...</div>

export const Empty = () => <div>Servidor no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">Error: {error?.message}</div>
)

export const Success = ({ servidor }) => {
  return <Servidor servidor={servidor} />
}