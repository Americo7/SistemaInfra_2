import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewMaquina from 'src/components/Maquina/NewMaquina'

const NewMaquinaPage = () => {
  return (
    <ScaffoldLayout
      title="Máquinas"
      titleTo="maquinas"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewMaquina />
    </ScaffoldLayout>
  )
}

export default NewMaquinaPage