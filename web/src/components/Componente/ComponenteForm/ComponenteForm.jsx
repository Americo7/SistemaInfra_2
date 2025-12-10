import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { navigate, routes } from '@redwoodjs/router'
import { useQuery, gql } from '@redwoodjs/web'
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
  Stack,
  Avatar,
  Button,
  useTheme,
  CircularProgress,
  Paper,
  InputAdornment, 
  Divider,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Iconos
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Apps as SystemIcon,
  Category as CategoryIcon,
  Code as CodeIcon,
  Description as DescIcon,
  AddCircle as AddIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material'

/* ---------------------------------------------
 * 1. QUERIES (Asegurando el alias 'parametros')
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
  query GetParametrosComponentes {
    parametros: parametrosFormularioComponente {
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
      <CardContent sx={{ px:3, pt:0, flexGrow: 1 }}>{children}</CardContent>
    </Card>
  )
}


/* ---------------------------------------------
 * 3. COMPONENTE PRINCIPAL (COMPACTADO)
 * --------------------------------------------- */
const ComponenteForm = (props) => {
  const theme = useTheme()
  const isEdit = Boolean(props.componente?.id)

  const { data: sistemasData, loading: loadingSistemas } = useQuery(OBTENER_SISTEMAS, {
    skip: Boolean(props.sistemas)
  })
  const { data: parametrosData, loading: loadingParams } = useQuery(GET_PARAMETROS, {
    skip: Boolean(props.parametros)
  })

  const sistemas = props.sistemas || sistemasData?.sistemas || []
  const allParametros = props.parametros || parametrosData?.parametros || []
  
  const loadingData = (!props.sistemas && loadingSistemas) || (!props.parametros && loadingParams)

  // Listas de Parámetros
  const sistemasOptions = useMemo(() => 
    sistemas?.filter(s => s.estado === 'ACTIVO') || [], 
  [sistemas])

  const categorias = useMemo(() => 
    allParametros?.filter(p => p.grupo === 'CATEGORIA') || [], 
  [allParametros])

  const entornos = useMemo(() => 
    allParametros?.filter(p => p.grupo === 'ENTORNO') || [], 
  [allParametros])

  const allTecnologias = useMemo(() => 
    allParametros?.filter(p => p.grupo === 'COMP_TECH') || [], 
  [allParametros])


  // React Hook Form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      id_sistema: props.componente?.id_sistema || '',
      nombre: props.componente?.nombre || '',
      dominio: props.componente?.dominio || '',
      cod_entorno: props.componente?.cod_entorno || '',
      cod_categoria: props.componente?.cod_categoria || '',
      tecnologia: props.componente?.tecnologia || [],
      gitlab_repo: props.componente?.gitlab_repo || '',
      gitlab_rama: props.componente?.gitlab_rama || '',
      descripcion: props.componente?.descripcion || '',
    }
  })

  const watchedCategoria = watch('cod_categoria')
  const watchedTecnologia = watch('tecnologia')

  const CATEGORY_PREFIXES = {
    'BACKEND': 'BACKEND_',
    'DATABASE': 'BD_',
    'FRONTEND': 'FRONTEND_',
    'NFS': 'NFS_',
    'BLOCKCHAIN': 'BLOCKCHAIN_',
    'OTHER': 'OTHER_',
  }

  // Lógica de Filtrado de Tecnologías
  const tecnologiasDisponibles = useMemo(() => {
    if (!watchedCategoria || allTecnologias.length === 0) return [];

    const prefix = CATEGORY_PREFIXES[watchedCategoria]
    
    if (prefix) {
      const filtered = allTecnologias.filter(p => p.codigo.startsWith(prefix));
      
      return filtered.length > 0 ? filtered : allTecnologias;

    }

    return allTecnologias;

  }, [watchedCategoria, allTecnologias])


  // Handler para Autocomplete que permite selección múltiple y maneja versiones
  const handleTechSelect = (newValue) => {
    const existingTechs = Array.isArray(watchedTecnologia) ? watchedTecnologia : [];
    
    const newSelected = newValue.map(tech => {
      const techInfo = allTecnologias.find(t => t.codigo === tech.codigo);
      const existing = existingTechs.find(t => t.codigo === tech.codigo);
      
      return { 
        codigo: tech.codigo, 
        nombre: techInfo ? techInfo.nombre : tech.nombre, 
        version: existing ? existing.version : '' 
      };
    });

    setValue('tecnologia', newSelected, { shouldValidate: true, shouldDirty: true });
  }

  // Handler para actualizar la versión de una tecnología específica
  const handleVersionChange = (codigo, newVersion) => {
    const updated = watchedTecnologia.map(t =>
      t.codigo === codigo ? { ...t, version: newVersion } : t
    );
    setValue('tecnologia', updated, { shouldValidate: true, shouldDirty: true });
  }


  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
    }
    props.onSave(formData, props?.componente?.id)
  }

  if (loadingData) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderTop: 'none',
          borderRadius: 2,
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          mb: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* HEADER */}
        <Box sx={{
          px: 5, py: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff',
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
        }}>
          <Avatar
            sx={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #1565C0, #7B1FA2)',
              color: 'white', boxShadow: 3
            }}
          >
            {isEdit ? <EditIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#000', mb: 0.5 }}>
              {isEdit ? 'Editar Componente' : 'Crear Componente'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Actualizar información técnica' : 'Registrar nuevo componente de software'}
            </Typography>
          </Box>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ px: 5, pb: 2, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>

          {props.error && (
            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#fff4f4', borderColor: '#ffcdd2', color: '#c62828', display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="body2" fontWeight={600}>{String(props.error)}</Typography>
            </Paper>
          )}

          {/* GRID DE 3 COLUMNAS */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 3,
            alignItems: 'start'
          }}>
              
              {/* --- CARD 1: IDENTIFICACIÓN (SPACING REDUCIDO) --- */}
              <SectionCard 
                icon={<SystemIcon sx={{ fontSize: 20 }} />} 
                title="Identificación"
                bgcolor={theme.palette.primary.main}
              >
                <Stack spacing={1}> {/* Reducción de 2.5 a 2 */}
                  
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

                  {/* Descripción */}
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Descripción</FormLabel>
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          multiline 
                          rows={3} 
                          size="small" 
                          placeholder="Detalles adicionales del componente..." 
                        />
                      )}
                    />
                  </FormControl>

                </Stack>
              </SectionCard>

              {/* --- CARD 2: CLASIFICACIÓN Y REPOSITORIO (SPACING REDUCIDO) --- */}
              <SectionCard 
                icon={<CategoryIcon sx={{ fontSize: 20 }} />} 
                title="Clasificación y Repositorio"
                bgcolor={theme.palette.secondary.main}
              >
                <Stack spacing={1.5}> {/* Reducción de 2.5 a 2 */}
                  
                  {/* ENTORNO */}
                  <FormControl fullWidth>
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Entorno Despliegue</FormLabel>
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
                      <FormLabel sx={{ mb: 0.5, fontWeight: 600 }}>Categoría Componente</FormLabel>
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

                </Stack>
              </SectionCard>

              {/* --- CARD 3: TECNOLOGÍAS (SPACING REDUCIDO y VERSIONES ORDENADAS) --- */}
              <SectionCard 
                icon={<CodeIcon sx={{ fontSize: 20 }} />} 
                title="Tecnologías"
                bgcolor="#2e7d32"
              >
                <Stack spacing={1}> {/* Reducción de 2.5 a 2 */}
                  
                  {/* Selector de Autocomplete */}
                  <Box>
                    <FormLabel sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Stack Tecnológico
                    </FormLabel>
                    
                    {/* Contenedor condicional del Autocomplete */}
                    {watchedCategoria ? (
                      <Controller
                        name="tecnologia"
                        control={control}
                        render={() => {
                          const selectedOptions = (Array.isArray(watchedTecnologia) ? watchedTecnologia : [])
                            .map(sel => allTecnologias.find(t => t.codigo === sel.codigo))
                            .filter(t => t);

                          return (
                            <Stack spacing={2}>
                              {/* 1. Selector principal */}
                              <Autocomplete
                                multiple
                                options={tecnologiasDisponibles}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.nombre}
                                value={selectedOptions} 
                                
                                onChange={(_, newValue) => handleTechSelect(newValue)}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props}>
                                    <Checkbox checked={selected} sx={{mr:1}} />
                                    {option.nombre}
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    size="small" 
                                    placeholder="Buscar y seleccionar tecnologías..." 
                                  />
                                )}
                              />

                              {/* 2. Sección de Versiones Dinámicas (Horizontal Compacta) */}
                              {(Array.isArray(watchedTecnologia) && watchedTecnologia.length > 0) && (
                                <Box sx={{ 
                                  mt: 1,
                                  p: 2, 
                                  border: `1px dashed ${theme.palette.divider}`, 
                                  borderRadius: 1,
                                  bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                                  maxWidth:275,
                                }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>
                                    Versiones de Componentes:
                                  </Typography>
                                  
                                  <Stack spacing={1}> {/* Espaciado muy compacto */}
                                    {watchedTecnologia.map((tech) => (
                                      <Box 
                                        key={tech.codigo} 
                                        sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between',
                                          gap: 1.5, // Espacio entre label y input
                                          py: 0.5 // Relleno vertical para separar filas
                                        }}
                                      >
                                        {/* Label/Texto de la Tecnología */}
                                        <Typography 
                                            variant="body2" 
                                            fontWeight={500}
                                            sx={{ 
                                                flexShrink: 0, 
                                                width: '40%', // Asignar un ancho para el label
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {tech.nombre}
                                        </Typography>

                                        {/* Input de Versión al lado */}
                                        <TextField
                                          size="small"
                                          placeholder="1.0.0 / LTS"
                                          value={tech.version || ''}
                                          onChange={(e) => handleVersionChange(tech.codigo, e.target.value)}
                                          sx={{ 
                                            flexGrow: 1, // Ocupa el espacio restante
                                            bgcolor: 'white', 
                                            maxWidth: '60%' 
                                          }}
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">v</InputAdornment>
                                          }}
                                        />
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          )
                        }}
                      />
                    ) : (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff3e0', borderColor: '#ffb74d' }}>
                        <Typography variant="body2" color="#e65100" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningAmberIcon fontSize="small" />
                           Seleccione una **Categoría** para cargar las opciones de Stack Tecnológico.
                        </Typography>
                      </Paper>
                    )}
                  </Box>

                </Stack>
              </SectionCard>

            </Box>

            {/* BOTONES */}
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={() => navigate(routes.componentes())}
                sx={{ minWidth: 140, borderRadius: 2, textTransform: 'none', borderColor: 'rgba(0, 0, 0, 0.23)' }}
              >
                Cancelar
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={props.loading}
                startIcon={<SaveIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #1565C0 0%, #7B1FA2 100%)',
                  boxShadow: 4, px: 4, minWidth: 160, borderRadius: 2, textTransform: 'none', fontWeight: 700
                }}
              >
                {props.loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Registrar Componente')}
              </LoadingButton>
            </Box>

        </Box>
      </Card>
    </Box>
  )
}

export default ComponenteForm