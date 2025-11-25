import React from 'react'
import { timeTag, formatEnum, checkboxInputTag } from 'src/lib/formatters'

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Chip,
  useTheme,
} from '@mui/material'

import { Cloud as CloudIcon } from '@mui/icons-material'

/* ---------------------------------------------
 * UI Helpers
 * --------------------------------------------- */
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
    <Typography variant="body2" sx={{ width: '45%', color: 'text.secondary' }}>
      {label}
    </Typography>

    <Box sx={{ width: '55%' }}>
      {typeof value === 'string' || typeof value === 'number'
        ? (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        )
        : value}
    </Box>
  </Box>
)

/* Reusable inner card */
const InnerCard = ({ title, children }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------- */
const ProxmoxEndpoint = ({ proxmoxEndpoint, usuarios = [] }) => {
  const theme = useTheme()

  /* ---- Obtener nombre de usuario ---- */
  const getUserFullName = (id) => {
    if (!id) return 'N/D'
    const u = usuarios.find((x) => x.id === id)
    if (!u) return `ID ${id}`
    return [u.nombres, u.primer_apellido, u.segundo_apellido]
      .filter(Boolean)
      .join(' ')
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 2 }}>
      {/* TÍTULO */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Proxmox Endpoint: {proxmoxEndpoint.nombre}
      </Typography>

      {/* CARD PRINCIPAL */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.10)',
          p: 2,
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <CloudIcon />
            </Avatar>
          }
          title={
            <Typography sx={{ fontWeight: 700 }}>
              Información del Endpoint Proxmox
            </Typography>
          }
          sx={{ pb: 1 }}
        />

        <CardContent sx={{ pt: 2 }}>
          {/* GRID DOS COLUMNAS */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* ---- COLUMNA IZQUIERDA ---- */}
            <InnerCard title="Datos Generales">
              <RowItem label="Nombre" value={proxmoxEndpoint.nombre} />
              <RowItem label="Dominio" value={proxmoxEndpoint.dominio} />
              <RowItem label="IP" value={proxmoxEndpoint.ip} />
              <RowItem label="Puerto" value={proxmoxEndpoint.puerto} />
              <RowItem
                label="SSL"
                value={checkboxInputTag(proxmoxEndpoint.ssl)}
              />
              <RowItem label="Usuario API" value={proxmoxEndpoint.usuario} />

              {/* Campos sensibles */}
              <RowItem label="Token ID" value={proxmoxEndpoint.token_id} />
              <RowItem
                label="Token Secret"
                value={proxmoxEndpoint.token_secret}
              />

              <RowItem
                label="Descripción"
                value={proxmoxEndpoint.descripcion}
              />
            </InnerCard>

            {/* ---- COLUMNA DERECHA ---- */}
            <InnerCard title="Estado y Auditoría">
              <RowItem
                label="Fecha última sincronización"
                value={timeTag(proxmoxEndpoint.fecha_ultima_sync)}
              />

              <RowItem
                label="Estado"
                value={
                  <Chip
                    size="small"
                    label={formatEnum(proxmoxEndpoint.estado)}
                    color={
                      proxmoxEndpoint.estado === 'ACTIVO'
                        ? 'success'
                        : 'error'
                    }
                  />
                }
              />

              {/* ------- Auditoría ------- */}
              <RowItem
                label="Fecha creación"
                value={timeTag(proxmoxEndpoint.fecha_creacion)}
              />

              <RowItem
                label="Usuario creación"
                value={getUserFullName(
                  proxmoxEndpoint.usuario_creacion
                )}
              />

              <RowItem
                label="Fecha modificación"
                value={timeTag(proxmoxEndpoint.fecha_modificacion)}
              />

              <RowItem
                label="Usuario modificación"
                value={getUserFullName(
                  proxmoxEndpoint.usuario_modificacion
                )}
              />
            </InnerCard>
          </Box>

          {/* ---- Clusters vinculados ---- */}
          {proxmoxEndpoint.clusters?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <InnerCard title="Clusters vinculados">
                {proxmoxEndpoint.clusters.map((c) => (
                  <RowItem
                    key={c.id}
                    label={`Cluster ID ${c.id}`}
                    value={c.nombre}
                  />
                ))}
              </InnerCard>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProxmoxEndpoint
