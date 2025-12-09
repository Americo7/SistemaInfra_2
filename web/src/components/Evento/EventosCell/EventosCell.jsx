import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Eventos from 'src/components/Evento/Eventos/Eventos'

export const QUERY = gql`
  query FindEventos {
    eventos {
      id
      cod_evento
      cod_tipo_evento
      descripcion
      fecha_evento
      responsables
      estado_evento
      cite
      solicitante
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      tipoEventoInfo {
        id
        codigo
        nombre
      }
      estadoEventoInfo {
        id
        codigo
        nombre
      }
    }
  }
`

export const Loading = () => <div>Cargando eventos...</div>

// --- FIX: FORZAR RENDERIZADO ---
// Esto evita que Redwood muestre el componente 'Empty' (texto simple)
// y obliga a cargar 'Success' para ver la tabla vacía con su diseño y botones.
export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ eventos }) => {
  return <Eventos eventos={eventos} />
}