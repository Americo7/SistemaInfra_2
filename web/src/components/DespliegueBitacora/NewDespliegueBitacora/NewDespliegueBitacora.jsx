import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import DespliegueBitacoraForm from 'src/components/DespliegueBitacora/DespliegueBitacoraForm'

const CREATE_DESPLIEGUE_BITACORA_MUTATION = gql`
  mutation CreateDespliegueBitacoraMutation(
    $input: CreateDespliegueBitacoraInput!
  ) {
    createDespliegueBitacora(input: $input) {
      id
    }
  }
`

const NewDespliegueBitacora = () => {
  const [createDespliegueBitacora, { loading, error }] = useMutation(
    CREATE_DESPLIEGUE_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('DespliegueBitacora created')
        navigate(routes.despliegueBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createDespliegueBitacora({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          New DespliegueBitacora
        </h2>
      </header>
      <div className="rw-segment-main">
        <DespliegueBitacoraForm
          onSave={onSave}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export default NewDespliegueBitacora
