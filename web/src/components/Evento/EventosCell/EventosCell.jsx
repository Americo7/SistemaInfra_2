import { Link, routes, useLocation, navigate } from '@redwoodjs/router' // 🟢 Agregamos 'navigate'
import { gql } from '@redwoodjs/web'
import { useEffect } from 'react'
import { toast } from '@redwoodjs/web/toast'

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

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ eventos }) => {
  // 🟢 1. Leemos la URL actual
  const { search } = useLocation()

  useEffect(() => {
    // 🟢 2. Buscamos si existe el parámetro "?new="
    const params = new URLSearchParams(search)
    const codigoNuevo = params.get('new')

    if (codigoNuevo) {
      // 🟢 3. Mostramos el mensaje (sin parpadeos)
      toast.success(`Evento registrado correctamente`, {
        duration: 5000,
        icon: '✅'
      })

      // 🟢 4. Limpiamos la URL silenciosamente para que no salga al recargar (F5)
      // Usamos replace: true para no afectar el historial de "Atrás"
      navigate(routes.eventos(), { replace: true })
    }
  }, [search])

  return <Eventos eventos={eventos} />
}