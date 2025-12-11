import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web' // Asegúrate de importar gql también
import { toast } from '@redwoodjs/web/toast'

import InfraAfectadaForm from 'src/components/InfraAfectada/InfraAfectadaForm'

const CREATE_INFRA_AFECTADA_MUTATION = gql`
  mutation CreateInfraAfectadaMutation($input: CreateInfraAfectadaInput!) {
    createInfraAfectada(input: $input) {
      id
    }
  }
`

const NewInfraAfectada = () => {
  const [createInfraAfectada, { loading, error }] = useMutation(
    CREATE_INFRA_AFECTADA_MUTATION,
    {
      onCompleted: () => {
        // CORRECCIÓN FINAL:
        // Usamos el mismo patrón que en "Sistema".
        // Navegamos inmediatamente. El Toast se mantendrá visible 
        // automáticamente durante la transición a la tabla.
        toast.success('Afectación registrada exitosamente')
        navigate(routes.infraAfectadas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createInfraAfectada({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <InfraAfectadaForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewInfraAfectada