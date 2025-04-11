import { useState, useEffect } from 'react'
import Select from 'react-select'
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const OBTENER_SISTEMAS = gql`
  query ObtenerSistemasPadre {
    sistemas {
      id
      nombre
      estado
    }
  }
`

const OBTENER_ENTIDADES = gql`
  query ObtenerEntidades {
    entidads {
      id
      nombre
      estado
    }
  }
`

const SistemaForm = (props) => {
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)
  const { data: entidadesData } = useQuery(OBTENER_ENTIDADES)

  const [selectedPadre, setSelectedPadre] = useState(null)
  const [selectedEntidad, setSelectedEntidad] = useState(null)

  // Inicializar valores cuando se carga el componente o cambian las props
  useEffect(() => {
    if (props.sistema) {
      setSelectedPadre(props.sistema.id_padre)
      setSelectedEntidad(props.sistema.id_entidad)
    }
  }, [props.sistema])

  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((s) => s.estado === 'ACTIVO')
      .map((s) => ({ value: s.id, label: s.nombre })) || []

  const entidadesOptions =
    entidadesData?.entidads
      ?.filter((e) => e.estado === 'ACTIVO')
      .map((e) => ({ value: e.id, label: e.nombre })) || []

  const onSubmit = (data) => {
    // Construir el objeto de datos completo
    const formData = {
      ...data,
      id_padre: selectedPadre,
      id_entidad: selectedEntidad,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    console.log('Enviando datos:', formData)

    // Si tenemos un ID de sistema, estamos editando; de lo contrario, creamos
    if (props?.sistema?.id) {
      props.onSave(formData, props.sistema.id)
    } else {
      props.onSave(formData)
    }
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

        <Label className="input-label">Sistema Padre (Opcional)</Label>
        <Select
          name="id_padre"
          value={
            sistemasOptions.find((opt) => opt.value === selectedPadre) || null
          }
          options={sistemasOptions}
          onChange={(option) => {
            console.log('Sistema Padre seleccionado:', option)
            setSelectedPadre(option?.value || null)
          }}
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un sistema..."
        />

        <Label className="input-label">Entidad</Label>
        <Select
          name="id_entidad"
          value={
            entidadesOptions.find((opt) => opt.value === selectedEntidad) ||
            null
          }
          options={entidadesOptions}
          onChange={(option) => {
            console.log('Entidad seleccionada:', option)
            setSelectedEntidad(option?.value || null)
          }}
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar una entidad..."
        />

        <Label
          name="codigo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Codigo
        </Label>
        <TextField
          name="codigo"
          defaultValue={props.sistema?.codigo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="codigo" className="rw-field-error" />

        <Label
          name="sigla"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Sigla
        </Label>
        <TextField
          name="sigla"
          defaultValue={props.sistema?.sigla}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="sigla" className="rw-field-error" />

        <Label
          name="nombre"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombre
        </Label>
        <TextField
          name="nombre"
          defaultValue={props.sistema?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="nombre" className="rw-field-error" />

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripción
        </Label>
        <TextField
          name="descripcion"
          defaultValue={props.sistema?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="descripcion" className="rw-field-error" />

        <Label
          name="ra_creacion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          RA Creación
        </Label>
        <TextField
          name="ra_creacion"
          defaultValue={props.sistema?.ra_creacion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="ra_creacion" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default SistemaForm
