import React, { useMemo } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material'

import {
  CloudUpload as DeploymentIcon,
  Computer as MachineIcon,
  Dns as ClusterIcon,
  Storage as ServerIcon,
  DeveloperBoard as ComponentIcon,
  Apps as SystemIcon,
  History as AuditIcon,
  Info as GeneralIcon,
  ArrowBack as BackIcon,
  AccountCircle as UserIcon,
  Business as OrgIcon,
  Description as DescIcon,
} from '@mui/icons-material'

/* -----------------------
 * HELPERS GLOBALES
 * ----------------------- */
const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

const formatUserName = (usuarioObj) => {
  if (!usuarioObj) return '-'
  if (typeof usuarioObj === 'string') return usuarioObj
  // Ahora soportará correctamente el segundo apellido que viene en tu query
  if (usuarioObj.nombres || usuarioObj.primer_apellido || usuarioObj.segundo_apellido) {
    return `${usuarioObj.nombres || ''} ${usuarioObj.primer_apellido || ''} ${usuarioObj.segundo_apellido || ''}`.trim()
  }
  return '-'
}

const getStatusColor = (codigo) => {
  const map = {
    EXITOSO: 'success',
    FINALIZADO: 'success',
    COMPLETADO: 'success',
    FALLIDO: 'error',
    ERROR: 'error',
    EN_PROCESO: 'warning',
    PENDIENTE: 'info',
    CANCELADO: 'default',
  }
  return map[codigo] || 'default'
}

/* -----------------------
 * SUB-COMPONENTES (UI KIT)
 * ----------------------- */
const RowItem = ({ label, value, icon, isLast }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      py: 0.75,
      borderBottom: isLast ? 'none' : '1px solid',
      borderColor: 'divider',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '40%', pr: 2, display: 'flex', alignItems: 'center' }}
    >
      {icon && <Box sx={{ mr: 1, display: 'flex', color: 'action.active' }}>{icon}</Box>}
      {label}
    </Typography>
    <Box sx={{ width: '60%', display: 'flex', alignItems: 'center' }}>
      {React.isValidElement(value) ? value : (
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      )}
    </Box>
  </Box>
)

const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
        height: 'auto', // Altura dinámica
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>}
        sx={{ py: 1, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 1.5 }}>{children}</CardContent>
    </Card>
  )
}

/* -----------------------
 * COMPONENTE PRINCIPAL
 * ----------------------- */
const Despliegue = ({ despliegue, componente, maquina, servidor, parametros }) => {
  const theme = useTheme()

  const sistema = Array.isArray(componente?.sistemas)
    ? componente.sistemas[0]
    : componente?.sistemas
  const entorno = componente?.entornoInfo?.nombre || '-'

  /* --- LOGICA INFRAESTRUCTURA --- */
  const infraInfo = useMemo(() => {
    const arr = []

    // CASO 1: DESPLIEGUE EN MÁQUINA VIRTUAL
    if (maquina) {
      // A) HOST DE VIRTUALIZACIÓN
      if (maquina.servidores) {
        const host = maquina.servidores
        const hostNodes = Array.isArray(host.cluster_nodos) ? host.cluster_nodos : (host.cluster_nodos ? [host.cluster_nodos] : [])
        const srvNode = hostNodes[0]
        
        if (srvNode && srvNode.cluster) {
            const dc = Array.isArray(host.data_centers) ? host.data_centers[0] : host.data_centers

            arr.push({
                tipoContexto: 'VIRTUALIZACION',
                headerTitle: 'Host de Virtualización',
                clusterType: srvNode.cluster.tipoClusterInfo?.nombre || 'Virtualización',
                hostServidor: host.nombre,
                dataCenter: dc?.nombre || '-',
                nodoNombre: srvNode.nombre,
                clusterNombre: srvNode.cluster.nombre,
                linkCluster: routes.cluster({ id: srvNode.cluster.id }),
                linkHost: routes.servidor({ id: host.id })
            })
        }
      }

      // B) ORQUESTACIÓN (K8s)
      const vmNodes = Array.isArray(maquina.cluster_nodos) ? maquina.cluster_nodos : (maquina.cluster_nodos ? [maquina.cluster_nodos] : [])
      for (const n of vmNodes) {
        if (n.cluster) {
          arr.push({
            tipoContexto: 'ORQUESTACION',
            headerTitle: 'Orquestación',
            clusterType: n.cluster.tipoClusterInfo?.nombre || 'Orquestación',
            clusterNombre: n.cluster.nombre,
            nodoNombre: n.nombre,
            rol: n.rolInfo?.nombre || '-', 
            linkCluster: routes.cluster({ id: n.cluster.id }),
          })
        }
      }
    } 
    
    // CASO 2: DESPLIEGUE EN SERVIDOR FÍSICO
    else if (servidor) {
        const srvNodes = Array.isArray(servidor.cluster_nodos) ? servidor.cluster_nodos : []
        const srvNode = srvNodes[0]
        
        if (srvNode && srvNode.cluster) {
             arr.push({
               tipoContexto: 'ORQUESTACION',
               headerTitle: 'Cluster Físico',
               clusterType: srvNode.cluster.tipoClusterInfo?.nombre || 'Bare Metal',
               clusterNombre: srvNode.cluster.nombre,
               nodoNombre: srvNode.nombre,
               linkCluster: routes.cluster({ id: srvNode.cluster.id })
             })
        } else {
             arr.push({
                tipoContexto: 'SIMPLE',
                resourceName: servidor.nombre,
                resourceLink: routes.servidor({id: servidor.id}),
                detail: 'Servidor Físico Independiente'
             })
        }
    }

    return arr
  }, [maquina, servidor])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      
      {/* CARD PRINCIPAL WRAPPER */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
        }}
      >
        {/* HEADER: Sin título de texto, solo Estado */}
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.despliegues())}
              sx={{
                bgcolor: 'rgba(156, 39, 176, 0.15)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                color: theme.palette.secondary.dark
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #7b1fa2, #e91e63)',
            }}
          >
            <DeploymentIcon />
          </Avatar>

          <Box>
             <Chip 
                label={despliegue.estadoDespliegueInfo?.nombre || despliegue.estado_despliegue} 
                color={getStatusColor(despliegue.estado_despliegue)}
                sx={{ 
                    height: 32, 
                    fontSize: '0.85rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    px: 1 
                }}
            />
          </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <CardContent sx={{ px: 5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <Stack spacing={2}>
                
                {/* 1. CONTEXTO APLICATIVO (PRIMERO) */}
                <SectionCard icon={<ComponentIcon />} title="Contexto Aplicativo" bgcolor={theme.palette.secondary.main}>
                    {componente ? (
                        <>
                            <RowItem label="Componente" value={componente.nombre} />
                            <RowItem label="Dominio" value={componente.dominio} />
                            <RowItem label="Entorno" value={<Chip label={entorno} size="small" variant="outlined"/>} />
                            
                            {sistema && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, mr: 1, color: 'text.secondary' }}>
                                            SISTEMA VINCULADO
                                        </Typography>
                                    </Box>
                                    <RowItem 
                                        label="Sistema" 
                                        isLast 
                                        icon={<SystemIcon fontSize="small"/>}
                                        value={sistema.nombre} 
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Sin componente específico.</Typography>
                    )}
                </SectionCard>

                {/* 2. DETALLES DE SOLICITUD (SEGUNDO) */}
                <SectionCard icon={<GeneralIcon />} title="Detalles de Solicitud" bgcolor={theme.palette.info.main}>
                    <RowItem 
                        label="Descripción" 
                        value={despliegue.descripcion || '-'} 
                        icon={<DescIcon fontSize="small"/>}
                    />
                    <RowItem label="Fecha Solicitud" value={fmtDate(despliegue.fecha_solicitud)} />
                    <RowItem label="Fecha Despliegue" value={fmtDate(despliegue.fecha_despliegue)} />
                    <RowItem label="Solicitante" value={despliegue.solicitante} icon={<UserIcon fontSize="small"/>} />
                    
                    {/* USO DE UNIDADINFO (Codigo - Nombre) */}
                    <RowItem 
                        label="Unidad" 
                        value={
                            despliegue.unidadInfo 
                                ? `${despliegue.unidadInfo.codigo} - ${despliegue.unidadInfo.nombre}`
                                : (despliegue.unidad_solicitante || '-')
                        } 
                        icon={<OrgIcon fontSize="small"/>} 
                    />
                    
                    <RowItem 
                        label="Tipo Respaldo" 
                        value={despliegue.tipoRespaldoInfo?.nombre || despliegue.cod_tipo_respaldo || '-'} 
                    />
                    <RowItem label="Ref. Respaldo" value={despliegue.referencia_respaldo} isLast />
                </SectionCard>

            </Stack>

            {/* --- COLUMNA DERECHA --- */}
            <Stack spacing={2}>
                {/* 1. INFRAESTRUCTURA DESTINO */}
                <SectionCard icon={<ServerIcon />} title="Infraestructura Destino" bgcolor={theme.palette.success.main}>
                    {infraInfo.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No vinculada a infraestructura conocida.</Typography>
                    ) : (
                        infraInfo.map((info, idx) => (
                            <Box key={idx} sx={{ mb: idx < infraInfo.length - 1 ? 2 : 0 }}>
                                
                                {info.tipoContexto !== 'SIMPLE' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, mr: 1 }}>
                                        {info.headerTitle}
                                        </Typography>
                                        <Chip 
                                            label={info.clusterType} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ height: 18, fontSize: '0.65rem' }} 
                                        />
                                    </Box>
                                )}

                                {info.tipoContexto === 'VIRTUALIZACION' && (
                                    <>
                                        <RowItem 
                                            label="Host Servidor" 
                                            value={
                                                <Link to={info.linkHost} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                    {info.hostServidor}
                                                </Link>
                                            } 
                                        />
                                        <RowItem label="Data Center" value={info.dataCenter} />
                                        <RowItem label="Nodo" value={info.nodoNombre} />
                                        <RowItem
                                            label="Cluster"
                                            value={
                                                <Link to={info.linkCluster} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                    {info.clusterNombre}
                                                </Link>
                                            }
                                        />
                                    </>
                                )}

                                {info.tipoContexto === 'ORQUESTACION' && (
                                    <>
                                        <RowItem
                                            label="Cluster"
                                            value={
                                                <Link to={info.linkCluster} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                    {info.clusterNombre}
                                                </Link>
                                            }
                                        />
                                        <RowItem label="Nodo / Host" value={info.nodoNombre} />
                                        {info.rol && <RowItem label="Rol" value={<Chip label={info.rol} size="small" />} />}
                                    </>
                                )}
                                
                                {info.tipoContexto === 'SIMPLE' && (
                                    <>
                                        <RowItem 
                                            label="Recurso"
                                            value={
                                                <Link to={info.resourceLink} style={{ fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                    {info.resourceName}
                                                </Link>
                                            }
                                        />
                                        <RowItem label="Detalle" value={info.detail} isLast />
                                    </>
                                )}
                            </Box>
                        ))
                    )}
                </SectionCard>

                {/* 2. AUDITORÍA DEL REGISTRO */}
                <SectionCard icon={<AuditIcon />} title="Auditoría del Registro" bgcolor={theme.palette.warning.main}>
                    <RowItem
                        label="Estado Registro"
                        value={
                            <Chip
                            label={despliegue.estado}
                            size="small"
                            color={despliegue.estado === 'ACTIVO' ? 'success' : 'error'}
                            />
                        }
                    />
                    <RowItem label="Fecha Creación" value={fmtDate(despliegue.fecha_creacion)} />
                    <RowItem label="Creado por" value={formatUserName(despliegue.creadoPor)} />
                    <RowItem label="Última Modificación" value={fmtDate(despliegue.fecha_modificacion)} />
                    <RowItem label="Modificado por" value={formatUserName(despliegue.modificadoPor)} isLast />
                </SectionCard>

            </Stack>

          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Despliegue