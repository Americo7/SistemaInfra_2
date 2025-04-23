import React, { useState } from 'react'
import { useForm } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  ErrorOutline,
  HelpOutline,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code,
  Storage,
  Web,
  FolderShared,
  Link,
  Category,
  Info,
  Apps,
} from '@mui/icons-material'

const OBTENER_SISTEMAS = gql`
  query ObtenerSistemas {
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

const TecnologiasSelector = ({ tecnologias, value, onChange }) => {
  const theme = useTheme()
  const [selectedTechs, setSelectedTechs] = useState(value ? JSON.parse(value) : [])

  const handleTechChange = (tech, isChecked) => {
    const newTechs = isChecked
      ? [...selectedTechs, { codigo: tech.codigo, nombre: tech.nombre, version: '' }]
      : selectedTechs.filter(t => t.codigo !== tech.codigo)

    setSelectedTechs(newTechs)
    onChange(JSON.stringify(newTechs))
  }

  const handleVersionChange = (codigo, version) => {
    const updatedTechs = selectedTechs.map(t =>
      t.codigo === codigo ? { ...t, version } : t
    )
    setSelectedTechs(updatedTechs)
    onChange(JSON.stringify(updatedTechs))
  }

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Code sx={{ mr: 1, color: theme.palette.text.secondary }} />
        Tecnologías asociadas
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          {tecnologias?.map(tech => (
            <Grid item xs={12} sm={6} key={tech.codigo}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTechs.some(t => t.codigo === tech.codigo)}
                      onChange={e => handleTechChange(tech, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={tech.nombre}
                />
                {selectedTechs.some(t => t.codigo === tech.codigo) && (
                  <TextField
                    size="small"
                    placeholder="Versión (ej: 1.0.0)"
                    value={selectedTechs.find(t => t.codigo === tech.codigo)?.version || ''}
                    onChange={e => handleVersionChange(tech.codigo, e.target.value)}
                    sx={{ ml: 2, width: 150 }}
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </FormGroup>
    </Box>
  )
}

const ComponenteForm = (props) => {
  const theme = useTheme()
  const { register, formState: { errors }, handleSubmit } = useForm()
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const [selectedSistema, setSelectedSistema] = useState(props.componente?.id_sistema || null)
  const [selectedCategoria, setSelectedCategoria] = useState(props.componente?.cod_categoria || '')
  const [tecnologiaJson, setTecnologiaJson] = useState(props.componente?.tecnologia || '[]')

  const sistemasOptions = sistemasData?.sistemas
    ?.filter(s => s.estado === 'ACTIVO')
    ?.map(s => ({ value: s.id, label: s.nombre })) || []

  const CATEGORY_PREFIXES = {
    BACKEND: 'BACKEND_',
    DATABASE: 'BD_',
    FRONTEND: 'FRONTEND_',
    NFS: 'NFS_',
    BLOCKCHAIN: 'BLOCKCHAIN_',
    OTHER: 'OTHER_'
  }

  const categorias = parametrosData?.parametros?.filter(p => p.grupo === 'CATEGORIA') || []
  const entornos = parametrosData?.parametros?.filter(p => p.grupo === 'ENTORNO') || []
  const tecnologias = parametrosData?.parametros?.filter(p =>
    p.grupo === 'COMP_TECH' &&
    p.codigo.startsWith(CATEGORY_PREFIXES[selectedCategoria] || '')
  ) || []

  const handleCategoriaChange = (e) => {
    setSelectedCategoria(e.target.value)
    setTecnologiaJson('[]')
  }

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_sistema: selectedSistema,
      cod_categoria: selectedCategoria,
      tecnologia: tecnologiaJson,
      estado: 'ACTIVO',
      usuario_creacion: 3,
      usuario_modificacion: 2
    }
    props.onSave(formData, props?.componente?.id)
  }

  return (
    <Card
      sx={{
        maxWidth: '1200px',
        margin: 'auto',
        boxShadow: theme.shadows[6],
        borderRadius: '12px',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginTop: '-1px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.componente?.id ? 'Editar Componente' : 'Nuevo Componente'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.componente?.id ? 'Actualice los datos del componente' : 'Complete los datos del nuevo componente'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }} variant="outlined">
                <InputLabel id="sistema-label" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Apps sx={{ mr: 1, fontSize: '1rem' }} />
                  Sistema
                </InputLabel>
                <Select
                  labelId="sistema-label"
                  value={selectedSistema || ''}
                  label="Sistema"
                  onChange={(e) => setSelectedSistema(e.target.value)}
                  error={!selectedSistema && errors.id_sistema}
                >
                  {sistemasOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1, fontSize: '1rem' }} />
                    Nombre
                  </Box>
                }
                defaultValue={props.componente?.nombre}
                {...register('nombre', { required: true })}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre && 'Nombre es requerido'}
                sx={{ mb: 3 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Link sx={{ mr: 1, fontSize: '1rem' }} />
                    Dominio
                  </Box>
                }
                defaultValue={props.componente?.dominio}
                {...register('dominio', { required: true })}
                error={Boolean(errors.dominio)}
                helperText={errors.dominio && 'Dominio es requerido'}
                sx={{ mb: 3 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                defaultValue={props.componente?.descripcion}
                {...register('descripcion')}
                sx={{ mb: 3 }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }} variant="outlined">
                <InputLabel id="entorno-label" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage sx={{ mr: 1, fontSize: '1rem' }} />
                  Entorno
                </InputLabel>
                <Select
                  labelId="entorno-label"
                  defaultValue={props.componente?.cod_entorno || ''}
                  label="Entorno"
                  {...register('cod_entorno')}
                >
                  {entornos.map(entorno => (
                    <MenuItem key={entorno.codigo} value={entorno.codigo}>
                      {entorno.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }} variant="outlined">
                <InputLabel id="categoria-label" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ mr: 1, fontSize: '1rem' }} />
                  Categoría
                </InputLabel>
                <Select
                  labelId="categoria-label"
                  value={selectedCategoria}
                  onChange={handleCategoriaChange}
                  label="Categoría"
                  error={!selectedCategoria && errors.cod_categoria}
                >
                  {categorias.map(cat => (
                    <MenuItem key={cat.codigo} value={cat.codigo}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCategoria && (
                <TecnologiasSelector
                  tecnologias={tecnologias}
                  value={tecnologiaJson}
                  onChange={setTecnologiaJson}
                />
              )}

              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Web sx={{ mr: 1, fontSize: '1rem' }} />
                    Repositorio GitLab
                  </Box>
                }
                defaultValue={props.componente?.gitlab_repo}
                {...register('gitlab_repo')}
                sx={{ mb: 3 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderShared sx={{ mr: 1, fontSize: '1rem' }} />
                    Rama GitLab
                  </Box>
                }
                defaultValue={props.componente?.gitlab_rama}
                {...register('gitlab_rama')}
                sx={{ mb: 3 }}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <LoadingButton
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={props.onCancel}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
              }}
            >
              Cancelar
            </LoadingButton>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={props.loading}
              loadingPosition="start"
              startIcon={props.loading ? null : <SaveIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {props.loading ? 'Guardando...' : (props.componente?.id ? 'Actualizar' : 'Guardar')}
            </LoadingButton>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default ComponenteForm
