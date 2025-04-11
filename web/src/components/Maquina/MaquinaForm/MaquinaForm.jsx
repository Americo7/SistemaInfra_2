import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  SelectField,
  Submit,
  CheckboxField,
  useForm,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { useState } from 'react'

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
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const { watch } = useForm()
  const [nombreWarning, setNombreWarning] = useState('')
  const [discos, setDiscos] = useState(
    props.maquina?.almacenamiento?.length > 0
      ? props.maquina.almacenamiento
      : [{ Disco: 1, Valor: 0 }]
  )
  const esVirtual = watch('es_virtual')

  const parametrosDeTipoMaquina = parametrosData?.parametros?.filter((param) => {
    if (param.grupo !== 'TIPO_MAQUINA') return false
    if (esVirtual === undefined) return true
    return esVirtual ? param.codigo === 'VM' : param.codigo === 'BM'
  }) || []

  const cleanNombre = (nombre) => {
    return nombre
      ?.trim()
      ?.replace(/[\u200B-\u200D\uFEFF]/g, '')
      ?.slice(0, 25) || ''
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
    const nuevosDiscos = [...discos]
    nuevosDiscos[index].Valor = Number(valor)
    setDiscos(nuevosDiscos)
  }

  const onSubmit = (data) => {
    const originalNombre = data.nombre
    const cleanedNombre = cleanNombre(originalNombre)

    if (cleanedNombre.length < originalNombre?.length) {
      setNombreWarning('Se han eliminado caracteres especiales o espacios extras')
    }

    const formData = {
      ...data,
      nombre: cleanedNombre,
      almacenamiento: discos,
      cod_plataforma: data.cod_plataforma,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
      es_virtual: data.es_virtual || false,
    }

    props.onSave(formData, props?.maquina?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Campo Código */}
        <Label name="codigo" className="rw-label" errorClassName="rw-label rw-label-error">
          Código
        </Label>
        <NumberField
          name="codigo"
          defaultValue={props.maquina?.codigo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="codigo" className="rw-field-error" />

        {/* Checkbox Es Virtual */}
        <div className="rw-checkbox-field mt-4">
          <CheckboxField
            name="es_virtual"
            defaultChecked={props.maquina?.es_virtual || false}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <Label name="es_virtual" className="rw-label ml-2">
            Es virtual
          </Label>
        </div>
        <FieldError name="es_virtual" className="rw-field-error" />

        {/* Selector de Tipo de Máquina */}
        <Label className="rw-label">Tipo de Máquina</Label>
        <SelectField
          name="cod_plataforma"
          defaultValue={props.maquina?.cod_plataforma || ''}
          className="rw-input"
          validation={{ required: true }}
        >
          <option value="">Seleccionar...</option>
          {parametrosDeTipoMaquina.map((tipoMaquina) => (
            <option key={tipoMaquina.id} value={tipoMaquina.codigo}>
              {tipoMaquina.nombre}
            </option>
          ))}
        </SelectField>
        <FieldError name="cod_plataforma" className="rw-field-error" />

        {/* Campo Nombre */}
        <Label name="nombre" className="rw-label" errorClassName="rw-label rw-label-error">
          Nombre (max 25 caracteres)
        </Label>
        <div className="relative">
          <TextField
            name="nombre"
            defaultValue={props.maquina?.nombre}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{
              required: "Requerido",
              validate: (value) => {
                const cleaned = cleanNombre(value)
                return cleaned.length > 0 || "El nombre no puede estar vacío"
              }
            }}
            onChange={(e) => {
              if (e.target.value.length > 25) {
                e.target.value = e.target.value.slice(0, 25)
              }
            }}
          />
          <span className="absolute right-2 bottom-2 text-xs text-gray-500">
            {watch('nombre')?.length || 0}/25
          </span>
        </div>
        <FieldError name="nombre" className="rw-field-error" />
        {nombreWarning && (
          <div className="rw-text-sm rw-text-yellow-600 mt-1">{nombreWarning}</div>
        )}

        {/* Campo IP */}
        <Label name="ip" className="rw-label" errorClassName="rw-label rw-label-error">
          IP
        </Label>
        <TextField
          name="ip"
          defaultValue={props.maquina?.ip}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{
            required: true,
            pattern: {
              value: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
              message: 'IP inválida'
            }
          }}
          placeholder="Ej: 192.168.1.1"
        />
        <FieldError name="ip" className="rw-field-error" />

        {/* Campo Sistema Operativo */}
        <Label name="so" className="rw-label" errorClassName="rw-label rw-label-error">
          Sistema Operativo
        </Label>
        <TextField
          name="so"
          defaultValue={props.maquina?.so}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{
            required: true,
            maxLength: {
              value: 25,
              message: "Máximo 25 caracteres"
            }
          }}
        />
        <FieldError name="so" className="rw-field-error" />

        {/* Campo RAM */}
        <Label name="ram" className="rw-label" errorClassName="rw-label rw-label-error">
          RAM (GB)
        </Label>
        <NumberField
          name="ram"
          defaultValue={props.maquina?.ram}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{
            required: true,
            min: { value: 1, message: "Mínimo 1 GB" },
            max: { value: 32767, message: "Máximo 32767" }
          }}
        />
        <FieldError name="ram" className="rw-field-error" />

        {/* Campo Discos dinámicos */}
        <Label name="almacenamiento" className="rw-label">
          Discos (GB)
        </Label>
        <div className="space-y-2">
          {discos.map((disco, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1">
                <Label>Disco {disco.Disco}</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={disco.Valor}
                    onChange={(e) => actualizarDisco(index, e.target.value)}
                    className="rw-input"
                    min="1"
                    required
                  />
                </div>
              </div>
              {discos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarDisco(index)}
                  className="rw-button rw-button-red mt-5"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={agregarDisco}
            className="rw-button rw-button-green"
          >
            + Agregar Disco
          </button>
        </div>

        {/* Campo CPU */}
        <Label name="cpu" className="rw-label" errorClassName="rw-label rw-label-error">
          CPUs
        </Label>
        <NumberField
          name="cpu"
          defaultValue={props.maquina?.cpu}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{
            required: true,
            min: { value: 1, message: "Mínimo 1 CPU" },
            max: { value: 32767, message: "Máximo 32767" }
          }}
        />
        <FieldError name="cpu" className="rw-field-error" />

        {/* Botón de Guardar */}
        <div className="rw-button-group mt-6">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default MaquinaForm
