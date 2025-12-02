import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ComponentesCell from 'src/components/Componente/ComponentesCell'

const ComponentesPage = () => {
  return (
    <ScaffoldLayout
      title="Componentes"
      titleTo="componentes"
      groupTitle="Despliegues"
      buttonLabel="Nuevo Componente"
      buttonTo="newComponente"
    >
      <ComponentesCell />
    </ScaffoldLayout>
  )
}

export default ComponentesPage
