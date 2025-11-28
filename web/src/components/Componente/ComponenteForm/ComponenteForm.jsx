import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, gql } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  Autocomplete,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Paper
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Apps as SystemIcon,       // Para Identificación
  Category as CategoryIcon, // Para Clasificación
  Code as CodeIcon,         // Para Tecnologías
  Description as DescIcon,  // Para Detalles
  AddCircle as AddIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  ErrorOutline as ErrorIcon,
  Storage as EntornoIcon
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES
 * --------------------------------------------- */
const OBTENER_SISTEMAS = gql`
  query ObtenerSistemas2 {
    sistemas {
      id
      nombre
      estado
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametros {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* ---------------------------------------------
 * 2. COMPONENTE HELPER: SectionCard
 * --------------------------------------------- */
const SectionCard = ({ icon, title, children, bgcolor }) => {
  const theme = useTheme()
  const activeColor = bgcolor || theme.palette.primary.main
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${activeColor}`,
        bgcolor: 'background.paper',
        height: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: activeColor, width: 32, height: 32 }}>
            {icon}
          </Avatar>
        }
        title={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>}
        sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}

/* ---------------------------------------------
 * 3. SUBCOMPONENTE: Selector de Tecnologías
 * --------------------------------------------- */
const TecnologiasSelector = ({ tecnologias, value, onChange }) => {
  const theme = useTheme()
  // Parseamos el JSON inicial o usamos array vacío
  const [selectedTechs, setSelectedTechs] = useState(() => {
    try {
      return value ? JSON.parse(value) : []
    } catch {
      return []
    }
  })

  // Actualizar estado interno y propagar al padre cuando cambia
  const updateTechs = (newTechs) => {
    setSelectedTechs(newTechs)
    onChange(JSON.stringify(newTechs))
  }

  const handleTechChange = (tech, isChecked) => {
    if (isChecked) {
      updateTechs([...selectedTechs, { codigo: tech.codigo, nombre: tech.nombre, version: '' }])
    } else {
      updateTechs(selectedTechs.filter(t => t.codigo !== tech.codigo))
    }
  }

  const handleVersionChange = (codigo, version) => {
    const updated = selectedTechs.map(t =>
      t.codigo === codigo ? { ...t, version } : t
    )
    updateTechs(updated)
  }

  return (
    <Box sx={{ mt: 1, p: 2, border: `1px dashed ${theme.palette.divider}`, borderRadius: 2, bgcolor: '#fafafa' }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
        Seleccione las tecnologías:
      </Typography>
      <FormGroup>
        <Stack spacing={1}>
          {tecnologias?.map(tech => {
            const isSelected = selectedTechs.some(t => t.codigo === tech.codigo)
            return (
              <Box key={tech.codigo} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={e => handleTechChange(tech, e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">{tech.nombre}</Typography>}
                />
                {isSelected && (
                  <TextField
                    size="small"
                    placeholder="Ver."
                    value={selectedTechs.find(t => t.codigo === tech.codigo)?.version || ''}
                    onChange={e => handleVersionChange(tech.codigo, e.target.value)}
                    sx={{ width: 80, bgcolor: 'white' }}
                  />
                )}
              </Box>
            )
          })}
          {tecnologias?.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Seleccione una categoría para ver opciones.
            </Typography>
          )}
        </Stack>
      </FormGroup>
    </Box>
  )
}

/* ---------------------------------------------
 * 4. COMPONENTE PRINCIPAL
 * --------------------------------------------- */
const ComponenteForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.componente?.id)

  // Queries
  const { data: sistemasData, loading: loadingSistemas } = useQuery(OBTENER_SISTEMAS)
  const { data: parametrosData, loading: loadingParams } = useQuery(GET_PARAMETROS)

  const loadingData = loadingSistemas || loadingParams

  // Listas
  const sistemasOptions = useMemo(() => 
    sistemasData?.sistemas?.filter(s => s.estado === 'ACTIVO') || [], 
  [sistemasData])

  const categorias = useMemo(() => 
    parametrosData?.parametros?.filter(p => p.grupo === 'CATEGORIA') || [], 
  [parametrosData])

  const entornos = useMemo(() => 
    parametrosData?.parametros?.filter(p => p.grupo === 'ENTORNO') || [], 
  [parametrosData])

  // React Hook Form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      id_sistema: props.componente?.id_sistema || '',
      nombre: props.componente?.nombre || '',
      dominio: props.componente?.dominio || '',
      cod_entorno: props.componente?.cod_entorno || '',
      cod_categoria: props.componente?.cod_categoria || '',
      tecnologia: props.componente?.tecnologia || '[]',
      gitlab_repo: props.componente?.gitlab_repo || '',
      gitlab_rama: props.componente?.gitlab_rama || '',
      descripcion: props.componente?.descripcion || '',
    }
  })

  // Lógica de Tecnologías según Categoría
  const watchedCategoria = watch('cod_categoria')
  
  const CATEGORY_PREFIXES = {
    BACKEND: 'BACKEND_',
    DATABASE: 'BD_',
    FRONTEND: 'FRONTEND_',
    NFS: 'NFS_',
    BLOCKCHAIN: 'BLOCKCHAIN_',
    OTHER: 'OTHER_'
  }

  const tecnologiasDisponibles = useMemo(() => {
    if (!watchedCategoria || !parametrosData?.parametros) return []
    const prefix = CATEGORY_PREFIXES[watchedCategoria]
    if (!prefix) return []
    
    return parametrosData.parametros.filter(p => 
      p.grupo === 'COMP_TECH' && p.codigo.startsWith(prefix)
    )
  }, [watchedCategoria, parametrosData])

  // Limpiar tecnologías si cambia la categoría (opcional, depende de requerimiento de negocio)
  // useEffect(() => {
  //   setValue('tecnologia', '[]') 
  // }, [watchedCategoria, setValue])

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_creacion: isEdit ? undefined : 3, // Ajustar IDs reales
      usuario_modificacion: 2
    }
    props.onSave(formData, props?.componente?.id)
  }

  if (loadingData) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 2 }}>
      
      {/* CONTENEDOR PRINCIPAL */}
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'visible' }}>
        
        {/* HEADER */}
        <Box sx={{ 
            px: 5, py: 4, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
          }}>
            <Avatar sx={{
                  width: 48, height: 48,
                  background: 'linear-gradient(135deg, #1565C0, #7B1FA2)', color: 'white', boxShadow: 3
                }}>
              {isEdit ? <EditIcon /> : <AddIcon />}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{
                  lineHeight: 1.2,
                  background: 'linear-gradient(90deg, #1565C0 0%, #7B1FA2 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                {isEdit ? 'Editar Componente' : 'Nuevo Componente'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Actualizar datos del componente' : 'Registrar nuevo componente de software'}
              </Typography>
            </Box>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ px: 5, pb: 5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Mensaje de error general si viene de props */}
            {props.error && (
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
                <ErrorIcon color="error" />
                <Typography variant="body2" fontWeight={600}>{props.error.message}</Typography>
              </Paper>
            )}

            {/* GRID DE 3 COLUMNAS */}
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              alignItems: 'start'
            }}>
              
              {/* --- CARD 1: IDENTIFICACIÓN --- */}
              <SectionCard 
                icon={<SystemIcon sx={{ fontSize: 20 }} />} 
                title="Identificación"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Sistema */}
                  <FormControl fullWidth error={!!errors.id_sistema}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Sistema Asociado *</FormLabel>
                    <Controller
                      name="id_sistema"
                      control={control}
                      rules={{ required: 'Sistema requerido' }}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          options={sistemasOptions}
                          getOptionLabel={(option) => option.nombre}
                          value={sistemasOptions.find(s => s.id === value) || null}
                          onChange={(_, newValue) => onChange(newValue ? newValue.id : '')}
                          renderInput={(params) => (
                            <TextField {...params} size="small" placeholder="Buscar sistema..." error={!!errors.id_sistema} />
                          )}
                        />
                      )}
                    />
                  </FormControl>

                  {/* Nombre */}
                  <FormControl fullWidth error={!!errors.nombre}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Nombre del Componente *</FormLabel>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: 'Nombre requerido' }}
                      render={({ field }) => (
                        <TextField {...field} size="small" placeholder="Ej. API Gateway" error={!!errors.nombre} />
                      )}
                    />
                  </FormControl>

                  {/* Dominio */}
                  <FormControl fullWidth error={!!errors.dominio}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Dominio *</FormLabel>
                    <Controller
                      name="dominio"
                      control={control}
                      rules={{ required: 'Dominio requerido' }}
                      render={({ field }) => (
                        <TextField {...field} size="small" placeholder="Ej. api.miempresa.com" error={!!errors.dominio} />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: CLASIFICACIÓN Y TECNOLOGÍAS --- */}
              <SectionCard 
                icon={<CategoryIcon sx={{ fontSize: 20 }} />} 
                title="Clasificación"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={2.5}>
                  
                  {/* Entorno */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Entorno de Despliegue</FormLabel>
                    <Controller
                      name="cod_entorno"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} size="small" displayEmpty>
                          <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                          {entornos.map(e => (
                            <MenuItem key={e.codigo} value={e.codigo}>{e.nombre}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* Categoría */}
                  <FormControl fullWidth error={!!errors.cod_categoria}>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Categoría del Componente</FormLabel>
                    <Controller
                      name="cod_categoria"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} size="small" displayEmpty>
                          <MenuItem value=""><em>Seleccionar...</em></MenuItem>
                          {categorias.map(c => (
                            <MenuItem key={c.codigo} value={c.codigo}>{c.nombre}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* Selector de Tecnologías (Componente Custom) */}
                  <Box>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CodeIcon fontSize="small" color="action" /> Tecnologías
                    </FormLabel>
                    <Controller
                      name="tecnologia"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TecnologiasSelector 
                          tecnologias={tecnologiasDisponibles} 
                          value={value} 
                          onChange={onChange} 
                        />
                      )}
                    />
                  </Box>

                </Stack>
              </SectionCard>

              {/* --- CARD 3: DETALLES TÉCNICOS --- */}
              <SectionCard 
                icon={<DescIcon sx={{ fontSize: 20 }} />} 
                title="Detalles Técnicos"
                bgcolor="#2e7d32"
              >
                <Stack spacing={2.5}>
                  
                  {/* Repositorio */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Repositorio GitLab</FormLabel>
                    <Controller
                      name="gitlab_repo"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} size="small" placeholder="URL del repositorio" />
                      )}
                    />
                  </FormControl>

                  {/* Rama */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Rama Principal</FormLabel>
                    <Controller
                      name="gitlab_rama"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} size="small" placeholder="Ej. main / master" />
                      )}
                    />
                  </FormControl>

                  {/* Descripción (Más grande) */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          multiline 
                          rows={4} 
                          size="small" 
                          placeholder="Detalles adicionales del componente..." 
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined" color="inherit" startIcon={<CancelIcon />}
                onClick={props.onCancel} // Usando prop onCancel original
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit" variant="contained" loading={props.loading} startIcon={<SaveIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)', boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                }}
              >
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Guardar')}
              </LoadingButton>
            </Box>

          </form>
        </Box>
      </Card>
    </Box>
  )
}

export default ComponenteForm