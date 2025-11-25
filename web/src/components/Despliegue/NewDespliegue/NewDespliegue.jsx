import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import DespliegueForm from 'src/components/Despliegue/DespliegueForm'

const CREATE_DESPLIEGUE_MUTATION = gql`
  mutation CreateDespliegueMutation($input: CreateDespliegueInput!) {
    createDespliegue(input: $input) {
      id
    }
  }
`

const NewDespliegue = () => {
  const [createDespliegue, { loading, error }] = useMutation(
    CREATE_DESPLIEGUE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Despliegue Creado')
        navigate(routes.despliegues())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createDespliegue({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <DespliegueForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewDespliegue
