// web/src/pages/Maquina/MaquinasPage/MaquinasPage.jsx

// ⚠️ Quitar import: import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import MaquinasCell from 'src/components/Maquina/MaquinasCell'

const MaquinasPage = () => {
  return (
    // ❌ QUITAR EL WRAPPER SCAFFOLDLAYOUT AQUÍ
    <MaquinasCell />
    // ✅ La envoltura y las props del Layout se manejarán dentro de Maquinas.jsx
    //    para poder inyectar dinámicamente el listActions.
  )
}

export default MaquinasPage