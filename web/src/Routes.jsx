import { Set, Router, Route, Private } from '@redwoodjs/router'

import HomeLayout from 'src/layouts/HomeLayout'
import HomePage from 'src/pages/HomePage/HomePage'
import LoginPage from 'src/pages/LoginPage/LoginPage'

import { useAuth } from './auth'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>

      {/* ---------------- RUTA PÚBLICA ---------------- */}
      <Route path="/login" page={LoginPage} name="login" />

      {/* ------------------------------------------------
           RUTAS PRIVADAS — requieren sesión Keycloak
         ------------------------------------------------ */}
      <Set wrap={HomeLayout}>
        <Private unauthenticated="login">

          <Route path="/" page={HomePage} name="home" />

          <Route path="/componentes/new" page={ComponenteNewComponentePage} name="newComponente" />
          <Route path="/componentes/{id:Int}/edit" page={ComponenteEditComponentePage} name="editComponente" />
          <Route path="/componentes/{id:Int}" page={ComponenteComponentePage} name="componente" />
          <Route path="/componentes" page={ComponenteComponentesPage} name="componentes" />

          <Route path="/data-centers/new" page={DataCenterNewDataCenterPage} name="newDataCenter" />
          <Route path="/data-centers/{id:Int}/edit" page={DataCenterEditDataCenterPage} name="editDataCenter" />
          <Route path="/data-centers/{id:Int}" page={DataCenterDataCenterPage} name="dataCenter" />
          <Route path="/data-centers" page={DataCenterDataCentersPage} name="dataCenters" />

          <Route path="/despliegues/new" page={DespliegueNewDesplieguePage} name="newDespliegue" />
          <Route path="/despliegues/{id:Int}/edit" page={DespliegueEditDesplieguePage} name="editDespliegue" />
          <Route path="/despliegues/{id:Int}" page={DespliegueDesplieguePage} name="despliegue" />
          <Route path="/despliegues" page={DespliegueDesplieguesPage} name="despliegues" />

          <Route path="/entidads/new" page={EntidadNewEntidadPage} name="newEntidad" />
          <Route path="/entidads/{id:Int}/edit" page={EntidadEditEntidadPage} name="editEntidad" />
          <Route path="/entidads/{id:Int}" page={EntidadEntidadPage} name="entidad" />
          <Route path="/entidads" page={EntidadEntidadsPage} name="entidads" />

          <Route path="/sistemas/new" page={SistemaNewSistemaPage} name="newSistema" />
          <Route path="/sistemas/{id:Int}/edit" page={SistemaEditSistemaPage} name="editSistema" />
          <Route path="/sistemas/{id:Int}" page={SistemaSistemaPage} name="sistema" />
          <Route path="/sistemas" page={SistemaSistemasPage} name="sistemas" />

          <Route path="/usuario-rols/new" page={UsuarioRolNewUsuarioRolPage} name="newUsuarioRol" />
          <Route path="/usuario-rols/{id:Int}/edit" page={UsuarioRolEditUsuarioRolPage} name="editUsuarioRol" />
          <Route path="/usuario-rols/{id:Int}" page={UsuarioRolUsuarioRolPage} name="usuarioRol" />
          <Route path="/usuario-rols" page={UsuarioRolUsuarioRolsPage} name="usuarioRols" />

          <Route path="/usuarios/new" page={UsuarioNewUsuarioPage} name="newUsuario" />
          <Route path="/usuarios/{id:Int}/edit" page={UsuarioEditUsuarioPage} name="editUsuario" />
          <Route path="/usuarios/{id:Int}" page={UsuarioUsuarioPage} name="usuario" />
          <Route path="/usuarios" page={UsuarioUsuariosPage} name="usuarios" />

          <Route path="/maquinas/new" page={MaquinaNewMaquinaPage} name="newMaquina" />
          <Route path="/maquinas/{id:Int}/edit" page={MaquinaEditMaquinaPage} name="editMaquina" />
          <Route path="/maquinas/{id:Int}" page={MaquinaMaquinaPage} name="maquina" />
          <Route path="/maquinas" page={MaquinaMaquinasPage} name="maquinas" />

          <Route path="/servidors/new" page={ServidorNewServidorPage} name="newServidor" />
          <Route path="/servidors/{id:Int}/edit" page={ServidorEditServidorPage} name="editServidor" />
          <Route path="/servidors/{id:Int}" page={ServidorServidorPage} name="servidor" />
          <Route path="/servidors" page={ServidorServidorsPage} name="servidors" />

          <Route path="/roles/new" page={RoleNewRolePage} name="newRole" />
          <Route path="/roles/{id:Int}/edit" page={RoleEditRolePage} name="editRole" />
          <Route path="/roles/{id:Int}" page={RoleRolePage} name="role" />
          <Route path="/roles" page={RoleRolesPage} name="roles" />

          <Route path="/eventos/new" page={EventoNewEventoPage} name="newEvento" />
          <Route path="/eventos/{id:Int}/edit" page={EventoEditEventoPage} name="editEvento" />
          <Route path="/eventos/{id:Int}" page={EventoEventoPage} name="evento" />
          <Route path="/eventos" page={EventoEventosPage} name="eventos" />

          <Route path="/eventos-bitacoras/new" page={EventosBitacoraNewEventosBitacoraPage} name="newEventosBitacora" />
          <Route path="/eventos-bitacoras/{id:Int}/edit" page={EventosBitacoraEditEventosBitacoraPage} name="editEventosBitacora" />
          <Route path="/eventos-bitacoras/{id:Int}" page={EventosBitacoraEventosBitacoraPage} name="eventosBitacora" />
          <Route path="/eventos-bitacoras" page={EventosBitacoraEventosBitacorasPage} name="eventosBitacoras" />

          <Route path="/infra-afectadas/new" page={InfraAfectadaNewInfraAfectadaPage} name="newInfraAfectada" />
          <Route path="/infra-afectadas/{id:Int}/edit" page={InfraAfectadaEditInfraAfectadaPage} name="editInfraAfectada" />
          <Route path="/infra-afectadas/{id:Int}" page={InfraAfectadaInfraAfectadaPage} name="infraAfectada" />
          <Route path="/infra-afectadas" page={InfraAfectadaInfraAfectadasPage} name="infraAfectadas" />

          <Route path="/clusters/new" page={ClusterNewClusterPage} name="newCluster" />
          <Route path="/clusters/{id:Int}/edit" page={ClusterEditClusterPage} name="editCluster" />
          <Route path="/clusters/{id:Int}" page={ClusterClusterPage} name="cluster" />
          <Route path="/clusters" page={ClusterClustersPage} name="clusters" />

          <Route path="/despliegue-bitacoras/new" page={DespliegueBitacoraNewDespliegueBitacoraPage} name="newDespliegueBitacora" />
          <Route path="/despliegue-bitacoras/{id:Int}/edit" page={DespliegueBitacoraEditDespliegueBitacoraPage} name="editDespliegueBitacora" />
          <Route path="/despliegue-bitacoras/{id:Int}" page={DespliegueBitacoraDespliegueBitacoraPage} name="despliegueBitacora" />
          <Route path="/despliegue-bitacoras" page={DespliegueBitacoraDespliegueBitacorasPage} name="despliegueBitacoras" />

          <Route path="/parametros/new" page={ParametroNewParametroPage} name="newParametro" />
          <Route path="/parametros/{id:Int}/edit" page={ParametroEditParametroPage} name="editParametro" />
          <Route path="/parametros/{id:Int}" page={ParametroParametroPage} name="parametro" />
          <Route path="/parametros" page={ParametroParametrosPage} name="parametros" />

          <Route path="/k8s-endpoints/new" page={K8sEndpointNewK8sEndpointPage} name="newK8sEndpoint" />
          <Route path="/k8s-endpoints/{id:Int}/edit" page={K8sEndpointEditK8sEndpointPage} name="editK8sEndpoint" />
          <Route path="/k8s-endpoints/{id:Int}" page={K8sEndpointK8sEndpointPage} name="k8SEndpoint" />
          <Route path="/k8s-endpoints" page={K8sEndpointK8sEndpointsPage} name="k8SEndpoints" />

          <Route path="/proxmox-endpoints/new" page={ProxmoxEndpointNewProxmoxEndpointPage} name="newProxmoxEndpoint" />
          <Route path="/proxmox-endpoints/{id:Int}/edit" page={ProxmoxEndpointEditProxmoxEndpointPage} name="editProxmoxEndpoint" />
          <Route path="/proxmox-endpoints/{id:Int}" page={ProxmoxEndpointProxmoxEndpointPage} name="proxmoxEndpoint" />
          <Route path="/proxmox-endpoints" page={ProxmoxEndpointProxmoxEndpointsPage} name="proxmoxEndpoints" />

          <Route path="/cluster-nodos/new" page={ClusterNodoNewClusterNodoPage} name="newClusterNodo" />
          <Route path="/cluster-nodos/{id:Int}/edit" page={ClusterNodoEditClusterNodoPage} name="editClusterNodo" />
          <Route path="/cluster-nodos/{id:Int}" page={ClusterNodoClusterNodoPage} name="clusterNodo" />
          <Route path="/cluster-nodos" page={ClusterNodoClusterNodosPage} name="clusterNodos" />

          <Route path="/proxmox-endpoints/sync" page={ProxmoxSyncPage} name="proxmoxSync" />
          <Route path="/k8s-endpoints/sync" page={K8sSyncPage} name="k8sSync" />

          <Route notfound page={NotFoundPage} />

        </Private>
      </Set>
    </Router>
  )
}

export default Routes
