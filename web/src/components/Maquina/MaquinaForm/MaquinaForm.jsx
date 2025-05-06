import React, { useState, useEffect } from 'react'
import { useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import {
  Box,
  Button,
  Checkbox,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Chip,
  Avatar,
  FormControlLabel,
  FormLabel,
  useTheme,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ComputerIcon from '@mui/icons-material/Computer'
import MemoryIcon from '@mui/icons-material/Memory'
import StorageIcon from '@mui/icons-material/Storage'
import DnsIcon from '@mui/icons-material/Dns'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'

const GET_PARAMETROS = gql`
  query GetParametrosMaquinas {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const MaquinaForm = (props) => {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const { data: parametrosData, loading: parametrosLoading } = useQuery(GET_PARAMETROS)
  const [nombreWarning, setNombreWarning] = useState('')
  const [discos, setDiscos] = useState([{ Disco: 1, Valor: 0 }])
  const [selectedSO, setSelectedSO] = useState('')
  const [soVersion, setSoVersion] = useState('')
  const [esVirtual, setEsVirtual] = useState(false)
  const [formValues, setFormValues] = useState({
    codigo: '',
    nombre: '',
    ip: '',
    so: '',
    ram: '',
    cpu: '',
    cod_plataforma: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    if (props.maquina && parametrosData) {
      const maquina = props.maquina

      // Determinar si es virtual basado en el tipo de máquina
      const tipoMaquina = parametrosData.parametros.find(
        p => p.codigo === maquina.cod_plataforma
      )
      const initialEsVirtual = tipoMaquina?.codigo.startsWith('VM') || false

      setEsVirtual(initialEsVirtual)

      // Cargar SO
      if (maquina.so) {
        const soParts = maquina.so.split(' ')
        setSelectedSO(soParts[0])
        setSoVersion(soParts.slice(1).join(' '))
      }

      // Cargar discos
      if (maquina.almacenamiento) {
        setDiscos(maquina.almacenamiento.map(d => ({
          Disco: d.Disco,
          Valor: d.Valor
        })))
      }

      // Establecer valores del formulario
      setFormValues({
        codigo: maquina.codigo || '',
        nombre: maquina.nombre || '',
        ip: maquina.ip || '',
        so: maquina.so || '',
        ram: maquina.ram || '',
        cpu: maquina.cpu || '',
        cod_plataforma: maquina.cod_plataforma || '',
      })
    } else if (!props.maquina) {
      // Resetear valores si es nueva máquina
      setEsVirtual(false)
      setFormValues({
        codigo: '',
        nombre: '',
        ip: '',
        so: '',
        ram: '',
        cpu: '',
        cod_plataforma: '',
      })
      setDiscos([{ Disco: 1, Valor: 0 }])
      setSelectedSO('')
      setSoVersion('')
    }
  }, [props.maquina, parametrosData])

  // Manejar cambio de virtual/física
  const handleVirtualChange = (e) => {
    const isVirtual = e.target.checked
    setEsVirtual(isVirtual)

    // Siempre limpiar el tipo de máquina al cambiar
    setFormValues(prev => ({ ...prev, cod_plataforma: '' }))
  }

  const parametrosDeTipoMaquina = parametrosData?.parametros?.filter((param) => {
    if (param.grupo !== 'TIPO_MAQUINA') return false
    return esVirtual ? param.codigo.startsWith('VM') : param.codigo.startsWith('BM')
  }) || []

  const cleanNombre = (nombre) => {
    return nombre
      ?.trim()
      ?.replace(/[\u200B-\u200D\uFEFF]/g, '')
      ?.slice(0, 50) || ''
  }

  const agregarDisco = () => {
    setDiscos([...discos, { Disco: discos.length + 1, Valor: 0 }])
  }

  const eliminarDisco = (index) => {
    if (discos.length > 1) {
      const nuevosDiscos = discos.filter((_, i) => i !== index)
      setDiscos(nuevosDiscos.map((d, i) => ({ ...d, Disco: i + 1 })))
    }
  }

  const actualizarDisco = (index, valor) => {
    setDiscos(discos.map((disco, i) =>
      i === index ? { ...disco, Valor: Number(valor) } : disco
    ))
  }

  const validateIP = (ip) => {
    if (!ip) return 'La IP es requerida'
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Pattern.test(ip) ? '' : 'IP inválida'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'ip') {
      setErrors(prev => ({
        ...prev,
        ip: validateIP(value)
      }))
    } else if (name === 'nombre') {
      const cleaned = cleanNombre(value)
      if (cleaned.length < value?.length) {
        setNombreWarning('Se han eliminado caracteres especiales o espacios extras')
      } else {
        setNombreWarning('')
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.nombre?.trim()) newErrors.nombre = 'El nombre es requerido'
    if (formValues.nombre?.length > 50) newErrors.nombre = 'Máximo 50 caracteres'

    const ipError = validateIP(formValues.ip)
    if (ipError) newErrors.ip = ipError

    const sistemaOperativo = selectedSO && soVersion
      ? `${selectedSO} ${soVersion}`
      : formValues.so

    if (!sistemaOperativo) newErrors.so = 'El sistema operativo es requerido'

    if (!formValues.ram) newErrors.ram = 'La RAM es requerida'
    if (formValues.ram && (Number(formValues.ram) < 1 || Number(formValues.ram) > 32767)) {
      newErrors.ram = 'Debe ser entre 1 y 32767'
    }

    if (!formValues.cpu) newErrors.cpu = 'Los CPUs son requeridos'
    if (formValues.cpu && (Number(formValues.cpu) < 1 || Number(formValues.cpu) > 32767)) {
      newErrors.cpu = 'Debe ser entre 1 y 32767'
    }

    if (!formValues.cod_plataforma) newErrors.cod_plataforma = 'El tipo de máquina es requerido'

    const discosInvalidos = discos.some(disco => !disco.Valor || Number(disco.Valor) < 1)
    if (discosInvalidos) {
      newErrors.discos = 'Todos los discos deben tener un valor mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!validateForm()) {
        setIsSubmitting(false)
        return
      }

      const cleanedNombre = cleanNombre(formValues.nombre)
      const sistemaOperativo = selectedSO && soVersion
        ? `${selectedSO} ${soVersion}`
        : formValues.so

      const formData = {
        ...formValues,
        nombre: cleanedNombre,
        almacenamiento: discos,
        estado: 'ACTIVO',
        usuario_creacion: props.maquina?.id ? props.maquina.usuario_creacion : currentUser?.id,
        usuario_modificacion: currentUser?.id,
        es_virtual: esVirtual,
        so: sistemaOperativo,
        ram: Number(formValues.ram),
        cpu: Number(formValues.cpu)
      }

      if (typeof props.onSave === 'function') {
        await props.onSave(formData, props?.maquina?.id)
      }
    } catch (error) {
      alert('Error al guardar: ' + (error.message || 'Revise los datos e intente nuevamente'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (parametrosLoading) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: '900px',
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
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <ComputerIcon fontSize="large" />
        <Box>
          <Typography variant="h5" fontWeight="600">
            {props.maquina?.id ? 'Editar Máquina' : 'Nueva Máquina'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {props.maquina?.id
              ? 'Actualice la configuración detallada de su infraestructura tecnológica'
              : 'Complete la información para registrar una nueva máquina en el sistema'}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {props.error && (
          <Box sx={{
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ErrorOutlineIcon />
            <Typography variant="body2">
              {props.error.message || 'Ha ocurrido un error al procesar su solicitud'}
            </Typography>
          </Box>
        )}

        {errors.discos && (
          <Box sx={{
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ErrorOutlineIcon />
            <Typography variant="body2">
              {errors.discos}
            </Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <FormLabel sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}>
                  <DevicesOtherIcon fontSize="small" sx={{ mr: 1 }} />
                  Información Básica
                </FormLabel>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: '8px',
                    borderColor: theme.palette.divider,
                  }}
                >
                  <TextField
                    label="Código"
                    name="codigo"
                    value={formValues.codigo}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    helperText="Identificador único opcional"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DnsIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={esVirtual}
                        onChange={handleVirtualChange}
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Máquina virtual
                        </Typography>
                        <Chip
                          label={esVirtual ? "VM" : "Física"}
                          size="small"
                          color={esVirtual ? "info" : "default"}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2.5 }} error={!!errors.cod_plataforma}>
                    <FormLabel sx={{
                      mb: 1,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: errors.cod_plataforma ? theme.palette.error.main : theme.palette.text.primary
                    }}>
                      Tipo de Máquina
                    </FormLabel>
                    <Select
                      value={formValues.cod_plataforma}
                      name="cod_plataforma"
                      onChange={handleChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em>Seleccionar tipo</em>
                        const selectedOption = parametrosDeTipoMaquina.find(p => p.codigo === selected)
                        return selectedOption?.nombre || selected
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 200,
                            boxShadow: theme.shadows[3]
                          }
                        }
                      }}
                      error={!!errors.cod_plataforma}
                    >
                      <MenuItem disabled value="">
                        <em>Seleccionar tipo...</em>
                      </MenuItem>
                      {parametrosDeTipoMaquina.map((tipoMaquina) => (
                        <MenuItem
                          key={tipoMaquina.id}
                          value={tipoMaquina.codigo}
                        >
                          {tipoMaquina.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cod_plataforma && (
                      <FormHelperText error>{errors.cod_plataforma}</FormHelperText>
                    )}
                  </FormControl>

                  <TextField
                    label="Nombre de la máquina"
                    name="nombre"
                    value={formValues.nombre}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.nombre}
                    helperText={errors.nombre || `Máximo 50 caracteres (${formValues.nombre?.length || 0}/50)`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ComputerIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: nombreWarning && (
                        <InputAdornment position="end">
                          <IconButton size="small" title={nombreWarning}>
                            <WarningAmberIcon color="warning" fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                  />

                  <TextField
                    label="Dirección IP"
                    name="ip"
                    value={formValues.ip}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.ip}
                    helperText={errors.ip || 'Formato: 192.168.1.1'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NetworkCheckIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <FormLabel sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}>
                  <MemoryIcon fontSize="small" sx={{ mr: 1 }} />
                  Especificaciones Técnicas
                </FormLabel>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: '8px',
                    borderColor: theme.palette.divider,
                  }}
                >
                  <Box sx={{ mb: 2.5 }}>
                    <FormLabel sx={{
                      mb: 1,
                      display: 'block',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: errors.so ? theme.palette.error.main : theme.palette.text.primary
                    }}>
                      Sistema Operativo
                    </FormLabel>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <Select
                          value={selectedSO}
                          onChange={(e) => setSelectedSO(e.target.value)}
                          fullWidth
                          displayEmpty
                          error={!!errors.so}
                          renderValue={(selected) => selected || <em>Distribución</em>}
                        >
                          <MenuItem value="Debian">Debian</MenuItem>
                          <MenuItem value="Ubuntu">Ubuntu</MenuItem>
                          <MenuItem value="CentOS">CentOS</MenuItem>
                          <MenuItem value="RedHat">RedHat</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={7}>
                        <TextField
                          value={soVersion}
                          onChange={(e) => setSoVersion(e.target.value)}
                          placeholder="Versión (ej: 22.04 LTS)"
                          fullWidth
                          disabled={!selectedSO}
                          error={!!errors.so && !soVersion}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MemoryIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      {errors.so && (
                        <Grid item xs={12}>
                          <FormHelperText error>{errors.so}</FormHelperText>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid item xs={6}>
                      <TextField
                        label="CPUs"
                        name="cpu"
                        type="number"
                        value={formValues.cpu}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.cpu}
                        helperText={errors.cpu || 'Núcleos de procesamiento'}
                        InputProps={{
                          inputProps: { min: 1, max: 32767 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <MemoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="RAM (GB)"
                        name="ram"
                        type="number"
                        value={formValues.ram}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.ram}
                        helperText={errors.ram || 'Memoria principal'}
                        InputProps={{
                          inputProps: { min: 1, max: 32767 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <MemoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <FormLabel sx={{
                      mb: 1,
                      display: 'block',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: errors.discos ? theme.palette.error.main : theme.palette.text.primary
                    }}>
                      Almacenamiento
                    </FormLabel>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: theme.palette.background.default,
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {discos.map((disco, index) => (
                        <Box key={`disco-${index}`} sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: index !== discos.length - 1 ? 2 : 0,
                        }}>
                          <Chip
                            avatar={
                              <Avatar sx={{
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText
                              }}>
                                {disco.Disco}
                              </Avatar>
                            }
                            label={`Disco ${disco.Disco}`}
                            variant="outlined"
                            sx={{ width: 120 }}
                          />
                          <TextField
                            type="number"
                            value={disco.Valor}
                            onChange={(e) => actualizarDisco(index, e.target.value)}
                            fullWidth
                            size="small"
                            error={!disco.Valor || Number(disco.Valor) < 1}
                            inputProps={{ min: 1 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StorageIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption">GB</Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {discos.length > 1 && (
                            <IconButton
                              onClick={() => eliminarDisco(index)}
                              color="error"
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={agregarDisco}
                        size="small"
                        sx={{ mt: 2 }}
                      >
                        Añadir disco
                      </Button>
                    </Paper>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={props.loading || isSubmitting}
              loadingPosition="start"
              startIcon={props.loading || isSubmitting ? null : <CheckCircleOutlineIcon fontSize="small" />}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {props.loading || isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
            </LoadingButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MaquinaForm
