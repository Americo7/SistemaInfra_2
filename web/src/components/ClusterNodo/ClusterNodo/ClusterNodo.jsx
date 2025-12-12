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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material'

import {
  Hub as NodeIcon,
  Dns as ClusterIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  ArrowBack as BackIcon,
  Info as GeneralIcon,
  History as AuditIcon,
  Category as TypeIcon,
  CheckCircle as StatusIcon,
  Settings as ConfigIcon,
  Layers as VmIcon,
} from '@mui/icons-material'

/* ------------------------------------------
 * HELPERS
 * ------------------------------------------ */
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

const getUserFullName = (u) => {
  if (!u) return '-'
  return `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido || ''}`.trim()
}

/* ------------------------------------------
 * SUBCOMPONENTE: RowItem
 * ------------------------------------------ */
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
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
      {label}
    </Typography>

    <Box sx={{ width: '60%' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
)

/* ------------------------------------------
 * SUBCOMPONENTE: SectionCard
 * ------------------------------------------ */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        borderRadius: 2,
        borderTop: `3px solid ${bgcolor || theme.palette.primary.main}`,
        height: '100%',
      }}
    >
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main }}>{icon}</Avatar>}
        title={<Typography fontWeight={700}>{title}</Typography>}
      />
      <CardContent sx={{ p: 1.5 }}>{children}</CardContent>
    </Card>
  )
}

/* ------------------------------------------
 * COMPONENTE PRINCIPAL
 * ------------------------------------------ */
const ClusterNodo = ({ clusterNodo }) => {
  const theme = useTheme()

  const isPhysicalNode = clusterNodo.nodoTipo === 'FISICO'
  const isVirtualNode = clusterNodo.nodoTipo === 'VIRTUAL'
  const hostedVms = clusterNodo.servidor?.maquinas || []

  /* -------- Recurso Vinculado ---------- */
  const recurso = useMemo(() => {
    if (isVirtualNode && clusterNodo.maquina) {
      return {
        tipo: 'Máquina Virtual',
        icon: <MachineIcon fontSize="inherit" />,
        nombre: clusterNodo.maquina.nombre,
        route: routes.maquina({ id: clusterNodo.maquina.id }),
      }
    }

    if (isPhysicalNode && clusterNodo.servidor) {
      return {
        tipo: 'Servidor Físico',
        icon: <ServerIcon fontSize="inherit" />,
        nombre: clusterNodo.servidor.nombre,
        route: routes.servidor({ id: clusterNodo.servidor.id }),
      }
    }

    return {
      tipo: 'No definido',
      icon: <GeneralIcon fontSize="inherit" />,
      nombre: 'No asignado',
      route: null,
    }
  }, [clusterNodo])

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      {/* -------------------------------- HEADER -------------------------------- */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 12px 12px',
          mb: 3,
        }}
      >
        <Box sx={{ px: 5, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Volver">
            <IconButton
              onClick={() => navigate(routes.clusterNodos())}
              sx={{
                bgcolor: 'rgba(63,81,181,0.15)',
                border: '1px solid rgba(63,81,181,0.3)',
              }}
            >
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #e91e63, #f06292)',
            }}
          >
            <NodeIcon />
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {clusterNodo.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Detalle del Nodo de Cluster
            </Typography>
          </Box>
        </Box>

        {/* --------------------------- GRID PRINCIPAL --------------------------- */}
        <CardContent sx={{ px: 5, pb: 5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 3,
            }}
          >
            {/* ----------- IZQUIERDA ----------- */}
            <Stack spacing={2}>
              <SectionCard icon={<GeneralIcon />} title="Información General">
                <RowItem label="Tipo de Nodo" value={clusterNodo.nodoTipo} icon={<TypeIcon />} />

                <RowItem
                  label="Rol"
                  value={clusterNodo.rolInfo?.nombre || ''}
                  icon={<ConfigIcon />}
                />

                {clusterNodo.identity_key && (
                  <RowItem
                    label="Identificador"
                    value={
                      <Tooltip title={clusterNodo.identity_key}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover',
                            px: 0.5,
                            borderRadius: 1,
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {clusterNodo.identity_key}
                        </Typography>
                      </Tooltip>
                    }
                  />
                )}

                <RowItem label="Tipo Recurso" value={recurso.tipo} icon={recurso.icon} />

                <RowItem
                  label="Recurso Vinculado"
                  value={
                    recurso.route ? (
                      <Link
                        to={recurso.route}
                        style={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                        }}
                      >
                        {recurso.nombre}
                      </Link>
                    ) : (
                      recurso.nombre
                    )
                  }
                />

                <RowItem
                  label="Cluster"
                  icon={<ClusterIcon />}
                  isLast
                  value={
                    clusterNodo.cluster ? (
                      <Link
                        to={routes.cluster({ id: clusterNodo.cluster.id })}
                        style={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                        }}
                      >
                        {clusterNodo.cluster.nombre}
                      </Link>
                    ) : (
                      'No asignado'
                    )
                  }
                />
              </SectionCard>
            </Stack>

            {/* ----------- DERECHA (AUDITORÍA) ----------- */}
            <Stack spacing={2}>
              <SectionCard icon={<AuditIcon />} title="Auditoría" bgcolor={theme.palette.warning.main}>
                <RowItem
                  label="Estado"
                  value={
                    <Chip
                      label={clusterNodo.estado}
                      size="small"
                      color={clusterNodo.estado === 'ACTIVO' ? 'success' : 'error'}
                      icon={<StatusIcon fontSize="small" />}
                      sx={{ height: 20, fontWeight: 700 }}
                    />
                  }
                />
                <RowItem label="Fecha Creación" value={fmtDate(clusterNodo.fecha_creacion)} />
                <RowItem label="Creado por" value={getUserFullName(clusterNodo.creadoPor)} />
                <RowItem label="Última Modificación" value={fmtDate(clusterNodo.fecha_modificacion)} />
                <RowItem label="Modificado por" value={getUserFullName(clusterNodo.modificadoPor)} isLast />
              </SectionCard>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* -----------------------------------------------------------------------------
       * SECCIÓN DE MÁQUINAS VIRTUALES ALOJADAS (Sólo si es nodo Físico)
       ----------------------------------------------------------------------------- */}
      {isPhysicalNode && (
        <Card
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            mt: 3,
          }}
          elevation={0}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                <VmIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Máquinas Virtuales Alojadas
                </Typography>
                <Chip
                  label={hostedVms.length}
                  size="small"
                  color="secondary"
                  sx={{ height: 20 }}
                />
              </Box>
            }
          />

          <CardContent sx={{ p: 0 }}>
            {hostedVms.length > 0 ? (
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'background.default' } }}>
                      <TableCell sx={{ pl: 3 }}>VMID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>RAM (GB)</TableCell>
                      <TableCell>CPU</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {hostedVms.map((vm) => {
                      const estado = vm.estadoOperativoInfo?.nombre || 'Desconocido'
                      const color =
                        estado === 'Operativo'
                          ? 'success'
                          : estado === 'Fuera de Servicio'
                          ? 'error'
                          : 'default'

                      return (
                        <TableRow key={vm.id} hover>
                          {/* VMID */}
                          <TableCell sx={{ pl: 3, fontFamily: 'monospace' }}>
                            {vm.proxmox_vmid || '-'}
                          </TableCell>

                          {/* Nombre sin subrayado */}
                          <TableCell>
                            <Link
                              to={routes.maquina({ id: vm.id })}
                              style={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                              }}
                            >
                              {vm.nombre}
                            </Link>
                          </TableCell>

                          {/* RAM */}
                          <TableCell>
                            {vm.ram ? `${(vm.ram)} GB` : '-'}
                          </TableCell>

                          {/* CPU */}
                          <TableCell>{vm.cpu || '-'}</TableCell>

                          {/* IP */}
                          <TableCell>{vm.ip || '-'}</TableCell>

                          {/* Estado operativo */}
                          <TableCell align="center">
                            <Chip
                              label={estado}
                              size="small"
                              variant="outlined"
                              color={color}
                              sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                minWidth: 120,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                  No se detectaron máquinas virtuales alojadas en este servidor físico.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default ClusterNodo
