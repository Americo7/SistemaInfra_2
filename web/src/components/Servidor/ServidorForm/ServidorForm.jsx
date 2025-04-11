import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import {
  Form,
  FormError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

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

  const { data: dataCentersData } = useQuery(GET_DATA_CENTERS)
  const { data: servidoresData } = useQuery(GET_SERVIDORES)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const [tipoServidorPadre, setTipoServidorPadre] = useState('')
  const idPadre = watch('id_padre')

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

  const servidorPadreOptions =
    servidoresData?.servidores
      ?.filter((serv) => serv.id !== props.servidor?.id && serv.estado === 'ACTIVO')
      ?.map((serv) => ({
        value: serv.id,
        label: `${serv.nombre} | ${serv.marca} ${serv.modelo} (${serv.serie})`,
        servidor: serv
      })) || []

  const tipoServidorOptions = parametrosTipoServidor?.map((param) => ({
    value: param.codigo,
    label: param.nombre
  })) || []

  const formatOptionLabel = ({ label, servidor }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <strong>{servidor?.nombre || 'Sin nombre'}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{servidor?.marca} {servidor?.modelo}</span>
        <span style={{ color: '#666' }}>{servidor?.serie}</span>
      </div>
    </div>
  )

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

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={handleSubmit(onSubmit)} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <div className="form-group">
          <Label className="input-label">Data Center*</Label>
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
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Seleccionar Data Center..."
                isSearchable
              />
            )}
          />
          {errors.id_data_center && (
            <span className="rw-field-error">{errors.id_data_center.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label className="input-label">Servidor Padre (Opcional)</Label>
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
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Seleccionar servidor padre..."
                isClearable
                isSearchable
                formatOptionLabel={formatOptionLabel}
              />
            )}
          />
          {tipoServidorPadre && (
            <div className="mt-2 text-sm text-gray-500">
              Tipo del servidor padre: {tipoServidorPadre}
            </div>
          )}
        </div>

        <div className="form-group">
          <Label name="nombre" className="rw-label" errorClassName="rw-label rw-label-error">
            Nombre del Servidor*
          </Label>
          <Controller
            name="nombre"
            control={control}
            rules={{ required: 'El nombre es requerido' }}
            render={({ field }) => (
              <TextField {...field} className="rw-input" errorClassName="rw-input rw-input-error" />
            )}
          />
          {errors.nombre && (
            <span className="rw-field-error">{errors.nombre.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label name="serie" className="rw-label" errorClassName="rw-label rw-label-error">
            Serie*
          </Label>
          <Controller
            name="serie"
            control={control}
            rules={{ required: 'Serie es requerida' }}
            render={({ field }) => (
              <TextField {...field} className="rw-input" errorClassName="rw-input rw-input-error" />
            )}
          />
          {errors.serie && (
            <span className="rw-field-error">{errors.serie.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label name="cod_inventario_agetic" className="rw-label" errorClassName="rw-label rw-label-error">
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
              <TextField {...field} className="rw-input" errorClassName="rw-input rw-input-error" />
            )}
          />
          {errors.cod_inventario_agetic && (
            <span className="rw-field-error">{errors.cod_inventario_agetic.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label name="marca" className="rw-label" errorClassName="rw-label rw-label-error">
            Marca*
          </Label>
          <Controller
            name="marca"
            control={control}
            rules={{ required: 'Marca es requerida' }}
            render={({ field }) => (
              <TextField {...field} className="rw-input" errorClassName="rw-input rw-input-error" />
            )}
          />
          {errors.marca && (
            <span className="rw-field-error">{errors.marca.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label name="modelo" className="rw-label" errorClassName="rw-label rw-label-error">
            Modelo*
          </Label>
          <Controller
            name="modelo"
            control={control}
            rules={{ required: 'Modelo es requerido' }}
            render={({ field }) => (
              <TextField {...field} className="rw-input" errorClassName="rw-input rw-input-error" />
            )}
          />
          {errors.modelo && (
            <span className="rw-field-error">{errors.modelo.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label className="input-label">Tipo de Servidor*</Label>
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
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Seleccionar tipo de servidor..."
                isSearchable
              />
            )}
          />
          {errors.cod_tipo_servidor && (
            <span className="rw-field-error">{errors.cod_tipo_servidor.message}</span>
          )}
        </div>

        <div className="form-group">
          <Label name="ram" className="rw-label">RAM (GB)</Label>
          <Controller
            name="ram"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="rw-input"
                type="number"
                min="0"
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === '' ? null : value)
                }}
              />
            )}
          />
        </div>

        <div className="form-group">
          <Label name="almacenamiento" className="rw-label">Almacenamiento (GB)</Label>
          <Controller
            name="almacenamiento"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="rw-input"
                type="number"
                min="0"
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === '' ? null : value)
                }}
              />
            )}
          />
        </div>

        <div className="form-group">
          <Label className="input-label">Estado Operativo*</Label>
          <Controller
            name="estado_operativo"
            control={control}
            rules={{ required: 'Estado operativo es requerido' }}
            render={({ field }) => (
              <select {...field} className="rw-input" disabled={!parametrosDeEstadoOperativo?.length}>
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
            <span className="rw-field-error">{errors.estado_operativo.message}</span>
          )}
        </div>

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            {props.servidor?.id ? 'Actualizar' : 'Guardar'}
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ServidorForm
