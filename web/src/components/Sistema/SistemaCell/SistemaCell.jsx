// src/components/Sistema/SistemaCell.jsx
import Sistema from 'src/components/Sistema/Sistema'

export const QUERY = gql`
  query FindSistemaById($id: Int!) {
    sistema: sistema(id: $id) {
      id
      nombre
      sigla
      codigo
      descripcion
      estado
      ra_creacion
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      entidades {
        id
        nombre
        sigla
      }
      componentes {
        id
        nombre
        dominio
        tecnologia
        cod_entorno
        cod_categoria
        estado
        despliegue {
          id
          estado_despliegue
          fecha_despliegue
          unidad_solicitante
          solicitante
          referencia_respaldo
          fecha_solicitud
          cod_tipo_respaldo
          maquinas {
            id
            nombre
            ip
            so
            usuario_roles {
              id
              usuarios {
                nombres
                primer_apellido
                segundo_apellido
              }
              roles {
                nombre
                cod_tipo_rol
              }
            }
          }
        }
      }
      usuario_roles {
        id
        usuarios {
          nombres
          primer_apellido
          segundo_apellido
        }
        roles {
          nombre
          cod_tipo_rol
        }
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Sistema not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ sistema }) => {
  return <Sistema sistema={sistema} />
}