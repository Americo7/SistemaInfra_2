import Servidor from 'src/components/Servidor/Servidor'

export const QUERY = gql`
  query FindServidorById($id: Int!) {
    servidor: servidor(id: $id) {
      # --- CAMPOS SCALARES PRINCIPALES ---
      id
      nombre
      ram
      almacenamiento
      estado_operativo
      estado
      ip_primaria
      sistema_operativo
      cod_inventario_agetic # String!
      cod_tipo_servidor     # String!
      serie                 # String!
      marca                 # String!
      modelo                # String!
      usuario_creacion
      fecha_creacion
      usuario_modificacion
      fecha_modificacion

      id_data_center
      data_centers {
        id
        nombre
      }
      id_padre
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
        ip
        so
        estado
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
        fecha_creacion
        cluster {
          id
          nombre
          cod_tipo_cluster
          descripcion
          estado
        }
      }

      infra_afectada {
        id
        estado
        eventos {
          id
          cod_tipo_evento
          descripcion
          fecha_evento
          estado_evento
          fecha_creacion
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