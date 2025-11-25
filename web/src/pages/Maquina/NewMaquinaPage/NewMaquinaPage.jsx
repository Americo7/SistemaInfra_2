import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewMaquina from 'src/components/Maquina/NewMaquina'

const NewMaquinaPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Maquinas', link: routes.maquinas() },
        { label: 'Nueva maquina' }
      ]}
    >
      <NewMaquina />
    </ScaffoldLayout>
  )
}

export default NewMaquinaPage