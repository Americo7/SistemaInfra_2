import React, { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { LoadingButton } from '@mui/lab'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'

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
      <Typography variant="h6" gutterBottom>
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
      usuario_creacion: 1,
      usuario_modificacion: 1
    }
    props.onSave(formData, props?.componente?.id)
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, color: '#0F284D' }}>
        {props.componente?.id ? 'Editar Componente' : 'Nuevo Componente'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="sistema-label">Sistema</InputLabel>
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
              label="Nombre"
              defaultValue={props.componente?.nombre}
              {...register('nombre', { required: true })}
              error={Boolean(errors.nombre)}
              helperText={errors.nombre && 'Nombre es requerido'}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Dominio"
              defaultValue={props.componente?.dominio}
              {...register('dominio', { required: true })}
              error={Boolean(errors.dominio)}
              helperText={errors.dominio && 'Dominio es requerido'}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              defaultValue={props.componente?.descripcion}
              {...register('descripcion')}
              sx={{ mb: 3 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="entorno-label">Entorno</InputLabel>
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="categoria-label">Categoría</InputLabel>
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
              label="Repositorio GitLab"
              defaultValue={props.componente?.gitlab_repo}
              {...register('gitlab_repo')}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Rama GitLab"
              defaultValue={props.componente?.gitlab_rama}
              {...register('gitlab_rama')}
              sx={{ mb: 3 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={props.onCancel}
          >
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={props.loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
          >
            {props.componente?.id ? 'Actualizar' : 'Guardar'}
          </LoadingButton>
        </Box>
      </form>
    </Paper>
  )
}

export default ComponenteForm
