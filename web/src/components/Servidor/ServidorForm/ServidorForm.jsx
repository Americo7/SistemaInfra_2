import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { Form, FormError, Label, TextField, Submit } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  TextField as MuiTextField,
  InputAdornment
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  Storage,
  DataObject,
  Memory,
  Architecture,
  Inventory,
  Numbers as SerialNumber,
  Computer,
  DataArray,
  Hub,
  Dashboard
} from '@mui/icons-material'

const GET_DATA_CENTERS = gql`
  query GetDataCenters {
    dataCenters {
      id
      nombre
    }
  }
`

const GET_SERVIDORES = gql`
  query GetServidoresPadre {
    servidores {
      id
      nombre
      serie
      marca
      modelo
      estado
      cod_tipo_servidor
      id_data_center
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametrosServidor {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const ServidorForm = (props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      ...props.servidor,
      estado: 'ACTIVO',
      usuario_creacion: 2,
      ram: props.servidor?.ram?.toString() || '',
      almacenamiento: props.servidor?.almacenamiento?.toString() || '',
    },
  })

  const { data: dataCentersData, loading: dataCentersLoading } = useQuery(GET_DATA_CENTERS)
  const { data: servidoresData, loading: servidoresLoading } = useQuery(GET_SERVIDORES)
  const { data: parametrosData, loading: parametrosLoading } = useQuery(GET_PARAMETROS)

  const [tipoServidorPadre, setTipoServidorPadre] = useState('')
  const idPadre = watch('id_padre')
  const idDataCenter = watch('id_data_center')
  const tipoServidor = watch('cod_tipo_servidor')

  const loading = dataCentersLoading || servidoresLoading || parametrosLoading || props.loading

  useEffect(() => {
    if (idPadre) {
      const padreSeleccionado = servidoresData?.servidores?.find(
        (serv) => serv.id === idPadre
      )
      if (padreSeleccionado) {
        const tipo = parametrosData?.parametros?.find(
          (param) => param.codigo === padreSeleccionado.cod_tipo_servidor
        )?.nombre
        setTipoServidorPadre(tipo || padreSeleccionado.cod_tipo_servidor || '')
      }
    } else {
      setTipoServidorPadre('')
    }
  }, [idPadre, servidoresData, parametrosData])

  const parametrosDeEstadoOperativo = parametrosData?.parametros?.filter(
    (param) => param.grupo === 'ESTADO_OPERATIVO'
  )

  const parametrosTipoServidor = parametrosData?.parametros?.filter(
    (param) => param.grupo === 'TIPO_SERVIDOR'
  ) || [
    { id: 6, codigo: 'BLADE', nombre: 'Blade' },
    { id: 7, codigo: 'RACK', nombre: 'Rack' },
    { id: 9, codigo: 'TORRE', nombre: 'Torre' },
    { id: 59, codigo: 'CHASIS', nombre: 'Chasis' }
  ]

  const dataCenterOptions =
    dataCentersData?.dataCenters?.map((dc) => ({
      value: dc.id,
      label: dc.nombre,
    })) || []

  // Filtrar servidores por data center seleccionado y excluir el servidor actual
  const servidoresFiltrados = servidoresData?.servidores?.filter(
    (serv) => serv.id !== props.servidor?.id &&
            serv.estado === 'ACTIVO' &&
            (idDataCenter ? serv.id_data_center === idDataCenter : true)
  ) || []

  const servidoresChasis = servidoresFiltrados.filter(
    (serv) => serv.cod_tipo_servidor === 'CHASIS'
  )

  const servidoresNoChasis = servidoresFiltrados.filter(
    (serv) => serv.cod_tipo_servidor !== 'CHASIS'
  )

  // Combinamos ambos arrays para que los CHASIS aparezcan primero
  const servidorPadreOptions = [
    ...(servidoresChasis.map((serv) => ({
      value: serv.id,
      label: `${serv.nombre} | ${serv.marca} ${serv.modelo} (${serv.serie})`,
      servidor: serv,
      isChasis: true
    }))),
    ...(servidoresNoChasis.map((serv) => ({
      value: serv.id,
      label: `${serv.nombre} | ${serv.marca} ${serv.modelo} (${serv.serie})`,
      servidor: serv,
      isChasis: false
    })))
  ]

  const tipoServidorOptions = parametrosTipoServidor?.map((param) => ({
    value: param.codigo,
    label: param.nombre
  })) || []

  const formatOptionLabel = ({ label, servidor, isChasis }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isChasis ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
      padding: '4px',
      borderRadius: '4px'
    }}>
      <div>
        <strong>{servidor?.nombre || 'Sin nombre'}</strong>
        {isChasis && <span style={{ marginLeft: '8px', color: '#1976d2', fontWeight: 'bold' }}>(CHASIS)</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{servidor?.marca} {servidor?.modelo}</span>
        <span style={{ color: '#666' }}>{servidor?.serie}</span>
      </div>
    </div>
  )

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '50px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#1976d2' : '#e0e0e0',
      boxShadow: state.isFocused ? '0 0 0 1px #1976d2' : 'none',
      '&:hover': {
        borderColor: '#1976d2',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#e3f2fd'
        : state.isFocused
        ? '#f5f5f5'
        : 'transparent',
      color: state.isSelected
        ? '#1976d2'
        : '#333',
      padding: '8px 16px',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    group: (base) => ({
      ...base,
      paddingTop: 8,
      paddingBottom: 8,
    }),
  }

  const onSubmit = (data) => {
    const cleanData = {
      cod_inventario_agetic: data.cod_inventario_agetic,
      nombre: data.nombre,
      serie: data.serie,
      marca: data.marca,
      modelo: data.modelo,
      cod_tipo_servidor: data.cod_tipo_servidor,
      id_data_center: data.id_data_center,
      id_padre: data.id_padre,
      chasis: data.chasis,
      cuchilla: data.cuchilla,
      ram: data.ram ? parseInt(data.ram) : null,
      almacenamiento: data.almacenamiento ? parseInt(data.almacenamiento) : null,
      estado_operativo: data.estado_operativo,
      estado: data.estado,
      usuario_creacion: data.usuario_creacion,
      usuario_modificacion: props.servidor?.id ? 2 : undefined
    }

    props.onSave(cleanData, props?.servidor?.id)
  }

  if (loading && !props.servidor) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: '1000px',
        margin: 'auto',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        borderRadius: '12px',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: '#fff',
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginTop: '-1px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.servidor?.id ? 'Editar Servidor' : 'Nuevo Servidor'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {props.servidor?.id
            ? 'Actualice la información del servidor'
            : 'Complete la información para crear un nuevo servidor'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Form onSubmit={handleSubmit(onSubmit)} error={props.error}>
          <FormError
            error={props.error}
            wrapperStyle={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            titleStyle={{
              fontWeight: '600',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            listStyle={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
            }}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label
                className="input-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Dashboard fontSize="small" sx={{ mr: 1 }} />
                Data Center*
              </Label>
              <Controller
                name="id_data_center"
                control={control}
                rules={{ required: 'Data Center es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={dataCenterOptions}
                    value={dataCenterOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(selected) => {
                      field.onChange(selected?.value)
                      setValue('id_data_center', selected?.value, { shouldValidate: true })
                      // Limpiar el servidor padre cuando cambia el data center
                      setValue('id_padre', null)
                    }}
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Seleccionar Data Center..."
                    isSearchable
                    isDisabled={loading}
                  />
                )}
              />
              {errors.id_data_center && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.id_data_center.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                className="input-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Hub fontSize="small" sx={{ mr: 1 }} />
                Servidor Padre (Opcional)
              </Label>
              <Controller
                name="id_padre"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={servidorPadreOptions}
                    value={servidorPadreOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(selected) => {
                      field.onChange(selected?.value || null)
                      setValue('id_padre', selected?.value || null, { shouldValidate: true })
                    }}
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder={idDataCenter ? "Seleccionar servidor padre..." : "Primero seleccione un Data Center"}
                    isClearable
                    isSearchable
                    formatOptionLabel={formatOptionLabel}
                    isDisabled={loading || !idDataCenter}
                    noOptionsMessage={() => idDataCenter ? "No hay servidores disponibles" : "Seleccione un Data Center primero"}
                  />
                )}
              />
              {tipoServidorPadre && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.75rem' }}>
                  <Typography variant="caption" style={{ display: 'flex', alignItems: 'center' }}>
                    <Computer fontSize="small" sx={{ mr: 1, fontSize: '14px' }} />
                    Tipo del servidor padre: <strong style={{ marginLeft: '4px' }}>{tipoServidorPadre}</strong>
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="nombre"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Computer fontSize="small" sx={{ mr: 1 }} />
                Nombre del Servidor*
              </Label>
              <Controller
                name="nombre"
                control={control}
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.nombre ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                    }}
                  />
                )}
              />
              {errors.nombre && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.nombre.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="serie"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <SerialNumber fontSize="small" sx={{ mr: 1 }} />
                Serie*
              </Label>
              <Controller
                name="serie"
                control={control}
                rules={{ required: 'Serie es requerida' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.serie ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                    }}
                  />
                )}
              />
              {errors.serie && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.serie.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="cod_inventario_agetic"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Inventory fontSize="small" sx={{ mr: 1 }} />
                Código Inventario AGETIC*
              </Label>
              <Controller
                name="cod_inventario_agetic"
                control={control}
                rules={{
                  required: 'Código de inventario es requerido',
                  maxLength: { value: 10, message: 'Máximo 10 caracteres' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.cod_inventario_agetic ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                    }}
                  />
                )}
              />
              {errors.cod_inventario_agetic && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.cod_inventario_agetic.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="marca"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Storage fontSize="small" sx={{ mr: 1 }} />
                Marca*
              </Label>
              <Controller
                name="marca"
                control={control}
                rules={{ required: 'Marca es requerida' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.marca ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                    }}
                  />
                )}
              />
              {errors.marca && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.marca.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="modelo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <Architecture fontSize="small" sx={{ mr: 1 }} />
                Modelo*
              </Label>
              <Controller
                name="modelo"
                control={control}
                rules={{ required: 'Modelo es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.modelo ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                    }}
                  />
                )}
              />
              {errors.modelo && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.modelo.message}
                </span>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <DataObject fontSize="small" sx={{ mr: 1 }} />
                Tipo de Servidor*
              </Label>
              <Controller
                name="cod_tipo_servidor"
                control={control}
                rules={{ required: 'Tipo de servidor es requerido' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={tipoServidorOptions}
                    value={tipoServidorOptions.find((opt) => opt.value === field.value) || null}
                    onChange={(selected) => {
                      field.onChange(selected?.value)
                      setValue('cod_tipo_servidor', selected?.value, { shouldValidate: true })
                    }}
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Seleccionar tipo de servidor..."
                    isSearchable
                    isDisabled={loading}
                  />
                )}
              />
              {errors.cod_tipo_servidor && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.cod_tipo_servidor.message}
                </span>
              )}
            </Grid>

            {tipoServidor !== 'CHASIS' && (
              <>
                <Grid item xs={12} md={4}>
                  <Label
                    name="ram"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#333',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Memory fontSize="small" sx={{ mr: 1 }} />
                    RAM (GB)
                  </Label>
                  <Controller
                    name="ram"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="rw-input"
                        type="number"
                        min="0"
                        style={{
                          minHeight: '50px',
                          borderRadius: '8px',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e0e0e0',
                          fontSize: '0.9375rem',
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : value)
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Label
                    name="almacenamiento"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#333',
                      fontSize: '0.875rem',
                    }}
                  >
                    <DataArray fontSize="small" sx={{ mr: 1 }} />
                    Almacenamiento (GB)
                  </Label>
                  <Controller
                    name="almacenamiento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        className="rw-input"
                        type="number"
                        min="0"
                        style={{
                          minHeight: '50px',
                          borderRadius: '8px',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e0e0e0',
                          fontSize: '0.9375rem',
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : value)
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Label
                className="input-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircleOutline fontSize="small" sx={{ mr: 1 }} />
                Estado Operativo*
              </Label>
              <Controller
                name="estado_operativo"
                control={control}
                rules={{ required: 'Estado operativo es requerido' }}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={!parametrosDeEstadoOperativo?.length || loading}
                    style={{
                      minHeight: '50px',
                      borderRadius: '8px',
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.estado_operativo ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      fontSize: '0.9375rem',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">Seleccionar estado...</option>
                    {parametrosDeEstadoOperativo?.map((param) => (
                      <option key={param.id} value={param.codigo}>
                        {param.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.estado_operativo && (
                <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.estado_operativo.message}
                </span>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: '#e0e0e0' }} />

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
              loading={props.loading}
              loadingPosition="start"
              startIcon={props.loading ? null : <CheckCircleOutline fontSize="small" />}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#1976d2',
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#1565c0',
                },
              }}
            >
              {props.loading
                ? 'Guardando...'
                : props.servidor?.id
                  ? 'Actualizar Servidor'
                  : 'Guardar Servidor'
              }
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ServidorForm
