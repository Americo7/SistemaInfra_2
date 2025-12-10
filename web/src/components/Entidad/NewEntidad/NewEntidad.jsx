import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import EntidadForm from 'src/components/Entidad/EntidadForm'

const CREATE_ENTIDAD_MUTATION = gql`
  mutation CreateEntidadMutation($input: CreateEntidadInput!) {
    createEntidad(input: $input) {
      id
    }
  }
`

const NewEntidad = () => {
  const [createEntidad, { loading, error }] = useMutation(
    CREATE_ENTIDAD_MUTATION,
    {
      onCompleted: () => {
        toast.success('Nueva entidad creada correctamente')
        navigate(routes.entidads())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createEntidad({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <EntidadForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEntidad
