// src/components/Despliegue/Despliegue.jsx
import React from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
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

import {
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Computer as MachineIcon,
  DeveloperBoard as ComponentIcon,
  Apps as SistemaIcon,
} from '@mui/icons-material'

/* -------------------------------------------------------------
   HELPERS — mismo estilo Maquina.jsx
----------------------------------------------------------------*/
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/D'

const fmtEnum = (v) => (v ? String(v).toUpperCase() : 'N/D')

const getUserFullName = (id, usuarios) => {
  if (!id) return ''
  const u = usuarios?.find((x) => x.id === id)
  if (!u) return ''
  return [u.nombres, u.primer_apellido, u.segundo_apellido]
    .filter(Boolean)
    .join(' ')
}

const getParamNombre = (grupo, codigo, parametros) => {
  if (!codigo) return ''
  const p = parametros?.find((x) => x.grupo === grupo && x.codigo === codigo)
  return p?.nombre || codigo
}

/* -------------------------------------------------------------
   Row + SectionCard
----------------------------------------------------------------*/
const Row = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      py: 0.8,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography
      sx={{
        width: '45%',
        color: 'text.secondary',
        fontSize: '0.85rem',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        width: '55%',
        fontWeight: 600,
        fontSize: '0.85rem',
      }}
    >
      {value || 'N/D'}
    </Typography>
  </Box>
)

const SectionCard = ({ icon, title, children, color }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.10)',
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: color || theme.palette.primary.main,
              width: 36,
              height: 36,
            }}
          >
            {icon}
          </Avatar>
        }
        title={
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
            {title}
          </Typography>
        }
        sx={{
          py: 1.2,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />

      <CardContent sx={{ px: 2, py: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------
   COMPONENTE PRINCIPAL
----------------------------------------------------------------*/
const Despliegue = ({
  despliegue,
  componente,
  maquina,
  servidor,
  usuarios,
  parametros,
  bitacora,
}) => {
  const theme = useTheme()

  // SISTEMA asociado al componente
  const sistema =
    componente?.sistemas?.length > 0
      ? componente.sistemas[0]
      : componente?.sistemas || null

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', p: 3 }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          onClick={() => navigate(routes.despliegues())}
          sx={{
            bgcolor: theme.palette.action.hover,
            mr: 2,
            cursor: 'pointer',
          }}
        >
          <BackIcon />
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {despliegue.descripcion || 'Despliegue'}
        </Typography>
      </Box>

      {/* GRID 2 COLUMNAS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >

        {/* ================================================================
            COLUMNA 1 — Información general + Auditoría + Bitácora
        ================================================================ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* INFORMACIÓN GENERAL */}
          <SectionCard icon={<InfoIcon />} title="Información General">
            <Row label="Fecha despliegue" value={fmtDate(despliegue.fecha_despliegue)} />

            <Row
              label="Estado despliegue"
              value={<Chip label={fmtEnum(despliegue.estado_despliegue)} size="small" />}
            />

            <Row label="Fecha solicitud" value={fmtDate(despliegue.fecha_solicitud)} />
            <Row label="Unidad solicitante" value={despliegue.unidad_solicitante} />
            <Row label="Solicitante" value={despliegue.solicitante} />

            <Row
              label="Tipo respaldo"
              value={getParamNombre('TIPO_RESPALDO', despliegue.cod_tipo_respaldo, parametros)}
            />

            <Row label="Referencia" value={despliegue.referencia_respaldo} />
            <Row label="Estado" value={fmtEnum(despliegue.estado)} />

            {/* AUDITORÍA */}
            <Row label="Fecha creación" value={fmtDate(despliegue.fecha_creacion)} />
            <Row
              label="Creado por"
              value={getUserFullName(despliegue.usuario_creacion, usuarios)}
            />
            <Row label="Última modificación" value={fmtDate(despliegue.fecha_modificacion)} />
            <Row
              label="Modificado por"
              value={getUserFullName(despliegue.usuario_modificacion, usuarios)}
            />

            {/* DESCRIPCIÓN */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '0.9rem' }}>
                Descripción
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {despliegue.descripcion || 'Sin descripción.'}
              </Typography>
            </Box>
          </SectionCard>

          {/* BITÁCORA */}
          {bitacora?.length > 0 && (
            <SectionCard icon={<InfoIcon />} title="Bitácora">
              {bitacora.map((b) => (
                <Box
                  key={b.id}
                  sx={{
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {fmtDate(b.fecha_creacion)}
                  </Typography>

                  <Typography sx={{ fontSize: '0.8rem' }}>
                    {b.descripcion}
                  </Typography>

                  <Typography
                    sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
                  >
                    {b.estado_anterior} → {b.estado_actual}
                  </Typography>
                </Box>
              ))}
            </SectionCard>
          )}
        </Box>

        {/* ================================================================
            COLUMNA 2 — Componente + Sistema + Máquina/Servidor
        ================================================================ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* COMPONENTE */}
          {componente && (
            <SectionCard icon={<ComponentIcon />} title="Componente">
              <Row label="Nombre" value={componente.nombre} />
              <Row label="Dominio" value={componente.dominio} />
              <Row
                label="Entorno"
                value={getParamNombre('ENTORNO', componente.cod_entorno, parametros)}
              />
              <Row
                label="Categoría"
                value={getParamNombre('CATEGORIA', componente.cod_categoria, parametros)}
              />
              <Row label="Estado" value={fmtEnum(componente.estado)} />
            </SectionCard>
          )}

          {/* SISTEMA ASOCIADO */}
          {sistema && (
            <SectionCard icon={<SistemaIcon />} title="Sistema">
              <Row label="Nombre" value={sistema.nombre} />
              <Row label="Código" value={sistema.codigo} />
              <Row label="Sigla" value={sistema.sigla} />
              <Row label="Estado" value={fmtEnum(sistema.estado)} />
              <Row label="Descripción" value={sistema.descripcion} />
            </SectionCard>
          )}

          {/* ====================================================
              VM o Servidor Físico según el despliegue
          ==================================================== */}

          {/* CASO 1: Despliegue en VM */}
          {despliegue.id_maquina && maquina && (
            <SectionCard icon={<MachineIcon />} title="Máquina Virtual">
              <Row
                label="Nombre"
                value={
                  <Link to={routes.maquina({ id: maquina.id })} style={{ textDecoration: 'none' }}>
                    {maquina.nombre}
                  </Link>
                }
              />
              <Row label="IP" value={maquina.ip} />
              <Row label="Sistema Operativo" value={maquina.so} />
              <Row
                label="Plataforma"
                value={getParamNombre('PLATAFORMA', maquina.cod_plataforma, parametros)}
              />
              <Row label="RAM" value={`${maquina.ram} GB`} />
              <Row label="CPU" value={maquina.cpu} />
            </SectionCard>
          )}

          {/* CASO 2: Despliegue en Servidor Físico */}
          {despliegue.id_servidor && servidor && (
            <SectionCard icon={<MachineIcon />} title="Servidor Físico">
              <Row
                label="Nombre"
                value={
                  <Link
                    to={routes.servidor({ id: servidor.id })}
                    style={{ textDecoration: 'none' }}
                  >
                    {servidor.nombre}
                  </Link>
                }
              />
              <Row label="Tipo Servidor" value={servidor.cod_tipo_servidor} />
              <Row label="IP Primaria" value={servidor.ip_primaria} />
              <Row label="Sistema Operativo" value={servidor.sistema_operativo} />
              <Row label="RAM" value={`${servidor.ram || 0} GB`} />
              <Row label="Almacenamiento" value={servidor.almacenamiento || 'N/D'} />
            </SectionCard>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Despliegue
