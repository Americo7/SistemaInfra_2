import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Importación con ruta absoluta
import Parametros from 'src/components/Parametro/Parametros/Parametros'

export const QUERY = gql`
  query FindParametros {
    parametros {
      id
      codigo
      nombre
      grupo
      estado
      descripcion
      
      # --- AUDITORÍA ---
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }

    # --- LOOKUPS ---
    # Traemos usuarios para mapear auditoría
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Cargando parámetros...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ parametros, usuarios }) => {
  return <Parametros parametros={parametros} usuarios={usuarios} />
}