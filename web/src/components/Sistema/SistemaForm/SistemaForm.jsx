import { useState } from 'react'

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

  const [selectedPadre, setSelectedPadre] = useState(
    props.sistema?.id_padre ?? null
  )
  const [selectedEntidad, setSelectedEntidad] = useState(
    props.sistema?.id_entidad ?? null
  )

  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((s) => s.estado === 'ACTIVO')
      .map((s) => ({ value: s.id, label: s.nombre })) || []

  const entidadesOptions =
    entidadesData?.entidads
      ?.filter((e) => e.estado === 'ACTIVO')
      .map((e) => ({ value: e.id, label: e.nombre })) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_padre: selectedPadre ?? null,
      id_entidad: selectedEntidad,
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }

    props.onSave(formData, props?.sistema?.id)
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
          value={
            sistemasOptions.find((opt) => opt.value === selectedPadre) || null
          }
          options={sistemasOptions}
          onChange={(option) => setSelectedPadre(option?.value || null)}
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un sistema..."
        />

        <Label className="input-label">Entidad</Label>
        <Select
          value={
            entidadesOptions.find((opt) => opt.value === selectedEntidad) ||
            null
          }
          options={entidadesOptions}
          onChange={(option) => setSelectedEntidad(option?.value || null)}
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
