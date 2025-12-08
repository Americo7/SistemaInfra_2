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
      creadoPor {
        id
        nombres
        primer_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
      }
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
      }
      usuario_roles {
        id
        usuarios {
          nombres
          primer_apellido
        }
        roles {
          nombre
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