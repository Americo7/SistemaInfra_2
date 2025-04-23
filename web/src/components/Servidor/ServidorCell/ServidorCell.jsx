import Servidor from 'src/components/Servidor/Servidor'

export const QUERY = gql`
  query FindServidorById($id: Int!) {
    servidor: servidor(id: $id) {
      id
      cod_inventario_agetic
      nombre
      ram
      almacenamiento
      estado_operativo
      estado
      usuario_creacion
      fecha_creacion
      usuario_modificacion
      fecha_modificacion
      id_data_center
      serie
      id_padre
      cod_tipo_servidor
      marca
      modelo

      data_center {
        id
        nombre
      }

      asignacion_servidor_maquina {
        id
        id_cluster
        maquinas {
          id
          nombre
          ip
          so
          ram
          cpu
          estado
          cod_plataforma
          es_virtual
          fecha_creacion
        }
        clusters {
          id
          nombre
          cod_tipo_cluster
          descripcion
          estado
          fecha_creacion
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
          fecha_creacion
          solicitante
        }
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Servidor no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">Error: {error?.message}</div>
)

export const Success = ({ servidor }) => {
  return <Servidor servidor={servidor} />
}
