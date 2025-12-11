import { navigate, routes } from '@redwoodjs/router'

import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import EventoForm from 'src/components/Evento/EventoForm'

export const QUERY = gql`
  query EditEventoById($id: Int!) {
    evento: evento(id: $id) {
      id
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
    }
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_EVENTO_MUTATION = gql`
  mutation ActualizarEvento($id: Int!, $input: UpdateEventoInput!) {
    updateEvento(id: $id, input: $input) {
      id
      cod_evento
      estado
      fecha_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ evento, usuarios, parametros }) => {
  const [updateEvento, { loading, error }] = useMutation(
    UPDATE_EVENTO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Evento actualizado correctamente')
        navigate(routes.eventos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateEvento({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <EventoForm
          evento={evento}
          usuarios={usuarios}
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
