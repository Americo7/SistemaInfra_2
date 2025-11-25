import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ParametrosCell from 'src/components/Parametro/ParametrosCell'

const ParametrosPage = () => {
  return (
    <ScaffoldLayout
      title="Parámetros"
      titleTo="parametros"
      buttonLabel="Nuevo Parámetro"
      buttonTo="newParametro"
    >
      <ParametrosCell />
    </ScaffoldLayout>
  )
}

export default ParametrosPage
