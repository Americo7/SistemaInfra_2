// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Set, Router, Route } from '@redwoodjs/router'

import HomeLayout from 'src/layouts/HomeLayout'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DataCenterServidor from 'src/pages/DataCenter/DataCenterServidor/DataCenterServidor'
import MaquinasFiltradas from 'src/pages/MaquinasFiltradas/MaquinasFiltradas'
const Routes = () => {
  return (
    <Router>
      <Set wrap={HomeLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Set wrap={ScaffoldLayout} title="Componentes" titleTo="componentes" buttonLabel="New Componente" buttonTo="newComponente">
          <Route path="/componentes/new" page={ComponenteNewComponentePage} name="newComponente" />
          <Route path="/componentes/{id:Int}/edit" page={ComponenteEditComponentePage} name="editComponente" />
          <Route path="/componentes/{id:Int}" page={ComponenteComponentePage} name="componente" />
          <Route path="/componentes" page={ComponenteComponentesPage} name="componentes" />
        </Set>
        <Set wrap={ScaffoldLayout} title="DataCenters" titleTo="dataCenters" buttonLabel="New DataCenter" buttonTo="newDataCenter">
          <Route path="/data-centers/new" page={DataCenterNewDataCenterPage} name="newDataCenter" />
          <Route path="/data-centers/{id:Int}/edit" page={DataCenterEditDataCenterPage} name="editDataCenter" />
          <Route path="/data-centers/{id:Int}" page={DataCenterDataCenterPage} name="dataCenter" />
          <Route path="/data-centers" page={DataCenterDataCentersPage} name="dataCenters" />

          <Route path="/data-centers/servidores/{id:Int}" page={DataCenterServidor} name="dataCenterServidor" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Despliegues" titleTo="despliegues" buttonLabel="New Despliegue" buttonTo="newDespliegue">
          <Route path="/despliegues/new" page={DespliegueNewDesplieguePage} name="newDespliegue" />
          <Route path="/despliegues/{id:Int}/edit" page={DespliegueEditDesplieguePage} name="editDespliegue" />
          <Route path="/despliegues/{id:Int}" page={DespliegueDesplieguePage} name="despliegue" />
          <Route path="/despliegues" page={DespliegueDesplieguesPage} name="despliegues" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Entidads" titleTo="entidads" buttonLabel="New Entidad" buttonTo="newEntidad">
          <Route path="/entidads/new" page={EntidadNewEntidadPage} name="newEntidad" />
          <Route path="/entidads/{id:Int}/edit" page={EntidadEditEntidadPage} name="editEntidad" />
          <Route path="/entidads/{id:Int}" page={EntidadEntidadPage} name="entidad" />
          <Route path="/entidads" page={EntidadEntidadsPage} name="entidads" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Sistemas" titleTo="sistemas" buttonLabel="New Sistema" buttonTo="newSistema">
          <Route path="/sistemas/new" page={SistemaNewSistemaPage} name="newSistema" />
          <Route path="/sistemas/{id:Int}/edit" page={SistemaEditSistemaPage} name="editSistema" />
          <Route path="/sistemas/{id:Int}" page={SistemaSistemaPage} name="sistema" />
          <Route path="/sistemas" page={SistemaSistemasPage} name="sistemas" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Usuario Roles" titleTo="usuarioRols" buttonLabel="New UsuarioRol" buttonTo="newUsuarioRol">
          <Route path="/usuario-rols/new" page={UsuarioRolNewUsuarioRolPage} name="newUsuarioRol" />
          <Route path="/usuario-rols/{id:Int}/edit" page={UsuarioRolEditUsuarioRolPage} name="editUsuarioRol" />
          <Route path="/usuario-rols/{id:Int}" page={UsuarioRolUsuarioRolPage} name="usuarioRol" />
          <Route path="/usuario-rols" page={UsuarioRolUsuarioRolsPage} name="usuarioRols" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Usuarios" titleTo="usuarios" buttonLabel="New Usuario" buttonTo="newUsuario">
          <Route path="/usuarios/new" page={UsuarioNewUsuarioPage} name="newUsuario" />
          <Route path="/usuarios/{id:Int}/edit" page={UsuarioEditUsuarioPage} name="editUsuario" />
          <Route path="/usuarios/{id:Int}" page={UsuarioUsuarioPage} name="usuario" />
          <Route path="/usuarios" page={UsuarioUsuariosPage} name="usuarios" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Hardwares" titleTo="hardwares" buttonLabel="New Hardware" buttonTo="newHardware">
          <Route path="/hardwares/new" page={HardwareNewHardwarePage} name="newHardware" />
          <Route path="/hardwares/{id:Int}/edit" page={HardwareEditHardwarePage} name="editHardware" />
          <Route path="/hardwares/{id:Int}" page={HardwareHardwarePage} name="hardware" />
          <Route path="/hardwares" page={HardwareHardwaresPage} name="hardwares" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Maquinas" titleTo="maquinas" buttonLabel="New Maquina" buttonTo="newMaquina">
          <Route path="/maquinas/new" page={MaquinaNewMaquinaPage} name="newMaquina" />
          <Route path="/maquinas/{id:Int}/edit" page={MaquinaEditMaquinaPage} name="editMaquina" />
          <Route path="/maquinas/{id:Int}" page={MaquinaMaquinaPage} name="maquina" />
          <Route path="/maquinas" page={MaquinaMaquinasPage} name="maquinas" />

          <Route path="/servidores/maquinas/{id:Int}" page={MaquinasFiltradas} name="maquinasFiltradas" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Servidores" titleTo="servidors" buttonLabel="New Servidor" buttonTo="newServidor">
          <Route path="/servidors/new" page={ServidorNewServidorPage} name="newServidor" />
          <Route path="/servidors/{id:Int}/edit" page={ServidorEditServidorPage} name="editServidor" />
          <Route path="/servidors/{id:Int}" page={ServidorServidorPage} name="servidor" />
          <Route path="/servidors" page={ServidorServidorsPage} name="servidors" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Roles" titleTo="roles" buttonLabel="New Role" buttonTo="newRole">
          <Route path="/roles/new" page={RoleNewRolePage} name="newRole" />
          <Route path="/roles/{id:Int}/edit" page={RoleEditRolePage} name="editRole" />
          <Route path="/roles/{id:Int}" page={RoleRolePage} name="role" />
          <Route path="/roles" page={RoleRolesPage} name="roles" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Eventos" titleTo="eventos" buttonLabel="New Evento" buttonTo="newEvento">
          <Route path="/eventos/new" page={EventoNewEventoPage} name="newEvento" />
          <Route path="/eventos/{id:Int}/edit" page={EventoEditEventoPage} name="editEvento" />
          <Route path="/eventos/{id:Int}" page={EventoEventoPage} name="evento" />
          <Route path="/eventos" page={EventoEventosPage} name="eventos" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Eventos Bitacoras" titleTo="eventosBitacoras" buttonLabel="New EventosBitacora" buttonTo="newEventosBitacora">
          <Route path="/eventos-bitacoras/new" page={EventosBitacoraNewEventosBitacoraPage} name="newEventosBitacora" />
          <Route path="/eventos-bitacoras/{id:Int}/edit" page={EventosBitacoraEditEventosBitacoraPage} name="editEventosBitacora" />
          <Route path="/eventos-bitacoras/{id:Int}" page={EventosBitacoraEventosBitacoraPage} name="eventosBitacora" />
          <Route path="/eventos-bitacoras" page={EventosBitacoraEventosBitacorasPage} name="eventosBitacoras" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Infra Afectadas" titleTo="infraAfectadas" buttonLabel="New InfraAfectada" buttonTo="newInfraAfectada">
          <Route path="/infra-afectadas/new" page={InfraAfectadaNewInfraAfectadaPage} name="newInfraAfectada" />
          <Route path="/infra-afectadas/{id:Int}/edit" page={InfraAfectadaEditInfraAfectadaPage} name="editInfraAfectada" />
          <Route path="/infra-afectadas/{id:Int}" page={InfraAfectadaInfraAfectadaPage} name="infraAfectada" />
          <Route path="/infra-afectadas" page={InfraAfectadaInfraAfectadasPage} name="infraAfectadas" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Asignacion de Servidor y Maquinas" titleTo="asignacionServidorMaquinas" buttonLabel="New AsignacionServidorMaquina" buttonTo="newAsignacionServidorMaquina">
          <Route path="/asignacion-servidor-maquinas/new" page={AsignacionServidorMaquinaNewAsignacionServidorMaquinaPage} name="newAsignacionServidorMaquina" />
          <Route path="/asignacion-servidor-maquinas/{id:Int}/edit" page={AsignacionServidorMaquinaEditAsignacionServidorMaquinaPage} name="editAsignacionServidorMaquina" />
          <Route path="/asignacion-servidor-maquinas/{id:Int}" page={AsignacionServidorMaquinaAsignacionServidorMaquinaPage} name="asignacionServidorMaquina" />
          <Route path="/asignacion-servidor-maquinas" page={AsignacionServidorMaquinaAsignacionServidorMaquinasPage} name="asignacionServidorMaquinas" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Clusters" titleTo="clusters" buttonLabel="New Cluster" buttonTo="newCluster">
          <Route path="/clusters/new" page={ClusterNewClusterPage} name="newCluster" />
          <Route path="/clusters/{id:Int}/edit" page={ClusterEditClusterPage} name="editCluster" />
          <Route path="/clusters/{id:Int}" page={ClusterClusterPage} name="cluster" />
          <Route path="/clusters" page={ClusterClustersPage} name="clusters" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Despliegue Bitacoras" titleTo="despliegueBitacoras" buttonLabel="New DespliegueBitacora" buttonTo="newDespliegueBitacora">
          <Route path="/despliegue-bitacoras/new" page={DespliegueBitacoraNewDespliegueBitacoraPage} name="newDespliegueBitacora" />
          <Route path="/despliegue-bitacoras/{id:Int}/edit" page={DespliegueBitacoraEditDespliegueBitacoraPage} name="editDespliegueBitacora" />
          <Route path="/despliegue-bitacoras/{id:Int}" page={DespliegueBitacoraDespliegueBitacoraPage} name="despliegueBitacora" />
          <Route path="/despliegue-bitacoras" page={DespliegueBitacoraDespliegueBitacorasPage} name="despliegueBitacoras" />
        </Set>
        <Set wrap={ScaffoldLayout} title="Parametros" titleTo="parametros" buttonLabel="New Parametro" buttonTo="newParametro">
          <Route path="/parametros/new" page={ParametroNewParametroPage} name="newParametro" />
          <Route path="/parametros/{id:Int}/edit" page={ParametroEditParametroPage} name="editParametro" />
          <Route path="/parametros/{id:Int}" page={ParametroParametroPage} name="parametro" />
          <Route path="/parametros" page={ParametroParametrosPage} name="parametros" />
        </Set>
        <Route notfound page={NotFoundPage} />
      </Set>
    </Router>
  )
}

export default Routes
