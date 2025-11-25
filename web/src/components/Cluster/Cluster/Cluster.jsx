import React, { useState, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'

import {
  Dns as ClusterIcon,
  Computer as MachineIcon,
  Storage as ServerIcon,
  Hub as NodeIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material'

/* ----------------------------------------------------
 * HELPERS
 * ---------------------------------------------------- */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const fmtEnum = (v) => (v ? String(v).toUpperCase() : '')

const getUserFullName = (id, usuarios) => {
  const u = usuarios.find((x) => x.id === id)
  if (!u) return ''
  return [u.nombres, u.primer_apellido, u.segundo_apellido]
    .filter(Boolean)
    .join(' ')
}

/* ----------------------------------------------------
 * RowItem
 * ---------------------------------------------------- */
const RowItem = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ width: '40%', pr: 2 }}
    >
      {label}
    </Typography>

    <Box sx={{ width: '60%' }}>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
)

/* ----------------------------------------------------
 * SectionCard
 * ---------------------------------------------------- */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: bgcolor || theme.palette.primary.main }}>
            {icon}
          </Avatar>
        }
        title={<Typography sx={{ fontWeight: 700 }}>{title}</Typography>}
      />
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/* ----------------------------------------------------
 * COMPONENTE PRINCIPAL
 * ---------------------------------------------------- */
const Cluster = ({ cluster, usuarios }) => {
  const theme = useTheme()

  // Determinar tipo de cluster usando cod_tipo_cluster
  const isProxmox = cluster.cod_tipo_cluster === 'PX'
  const isK8s = cluster.cod_tipo_cluster === 'K8S'
  const showTabMaquinas = isProxmox // solo Proxmox tiene este tab

  const [tab, setTab] = useState(0)

  /* ----------------------------------------------------
   * NODOS (UNIVERSAL)
   * ---------------------------------------------------- */
  const nodos = cluster.cluster_nodos || []

  /* ----------------------------------------------------
   * MÁQUINAS SOLO PARA PROXMOX
   * ---------------------------------------------------- */
  const maquinasProxmox = useMemo(() => {
    if (!isProxmox) return []
    const maquinas = []

    for (const nodo of nodos) {
      if (nodo.servidor?.maquinas?.length) {
        maquinas.push(...nodo.servidor.maquinas)
      }
    }

    return maquinas
  }, [nodos, isProxmox])

  return (
    <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Detalle del Cluster
      </Typography>

      {/* ----------- INFO GENERAL + AUDITORÍA ----------- */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 3,
        }}
      >
        <SectionCard icon={<ClusterIcon />} title="Información del Cluster">
          <RowItem label="Nombre" value={cluster.nombre} />
          <RowItem label="Tipo" value={cluster.cod_tipo_cluster} />
          <RowItem label="Descripción" value={cluster.descripcion} />
          <RowItem
            label="Estado"
            value={
              <Chip
                size="small"
                label={fmtEnum(cluster.estado)}
                color={cluster.estado === 'ACTIVO' ? 'success' : 'error'}
              />
            }
          />
        </SectionCard>

        <SectionCard icon={<CalendarIcon />} title="Auditoría">
          <RowItem label="Fecha creación" value={fmtDate(cluster.fecha_creacion)} />

          <RowItem
            label="Creado por"
            value={getUserFullName(cluster.usuario_creacion, usuarios)}
          />

          <RowItem label="Última modificación" value={fmtDate(cluster.fecha_modificacion)} />

          <RowItem
            label="Modificado por"
            value={getUserFullName(cluster.usuario_modificacion, usuarios)}
          />
        </SectionCard>
      </Box>

      {/* ----------- TABS ----------- */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          {/* TAB: NODOS */}
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <NodeIcon fontSize="small" />
                <span>Nodos</span>
                <Chip label={nodos.length} size="small" />
              </Stack>
            }
          />

          {/* TAB: MÁQUINAS (solo Proxmox) */}
          {showTabMaquinas && (
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <MachineIcon fontSize="small" />
                  <span>Máquinas</span>
                  <Chip label={maquinasProxmox.length} size="small" />
                </Stack>
              }
            />
          )}
        </Tabs>

        <CardContent>
          {/* ------------ TAB 1: NODOS ------------ */}
          {tab === 0 && (
            <>
              <Typography sx={{ mb: 2, fontWeight: 700 }}>
                Lista de Nodos
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell>Nombre Lógico</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Recurso Asignado</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {nodos.map((n) => {
                      let recursoNombre = ''
                      let recursoLink = null

                      if (n.maquina) {
                        recursoNombre = n.maquina.nombre
                        recursoLink = routes.maquina({ id: n.maquina.id })
                      } else if (n.servidor) {
                        recursoNombre = n.servidor.nombre
                        recursoLink = routes.servidor({ id: n.servidor.id })
                      }

                      return (
                        <TableRow key={n.id} hover>
                          <TableCell>{n.nombre}</TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={fmtEnum(n.nodoTipo)}
                              color={n.nodoTipo === 'VIRTUAL' ? 'info' : 'warning'}
                            />
                          </TableCell>

                          <TableCell>
                            {recursoNombre ? (
                              <Link
                                to={recursoLink}
                                style={{
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                {recursoNombre}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* ------------ TAB 2: MÁQUINAS (solo Proxmox) ------------ */}
          {showTabMaquinas && tab === 1 && (
            <>
              <Typography sx={{ mb: 2, fontWeight: 700 }}>
                Máquinas del Cluster
              </Typography>

              {maquinasProxmox.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  No hay máquinas asociadas.
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell>Nombre</TableCell>
                        <TableCell>IP</TableCell>
                        <TableCell>SO</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maquinasProxmox.map((m) => (
                        <TableRow key={m.id} hover>
                          <TableCell>
                            <Link
                              to={routes.maquina({ id: m.id })}
                              style={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              {m.nombre}
                            </Link>
                          </TableCell>
                          <TableCell>{m.ip || ''}</TableCell>
                          <TableCell>{m.so || ''}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={fmtEnum(m.estado)}
                              color={m.estado === 'ACTIVO' ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Cluster
