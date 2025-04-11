import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
  SelectField,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { useState } from 'react'

const PARAMETROS_QUERY = gql`
  query ParametrosGrupos {
    parametros {
      grupo
    }
  }
`

const ParametroForm = (props) => {
  const { data } = useQuery(PARAMETROS_QUERY)
  const [mostrarCampoNuevoGrupo, setMostrarCampoNuevoGrupo] = useState(false)

  // Extraer grupos únicos
  const gruposExistentes = [...new Set(data?.parametros?.map(p => p.grupo) )|| []]
    .filter(grupo => grupo)
    .sort()

  const onSubmit = (data) => {
    const formData = {
      ...data,
      grupo: mostrarCampoNuevoGrupo ? data.nuevoGrupo : data.grupo,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    delete formData.nuevoGrupo // Eliminamos el campo temporal
    props.onSave(formData, props?.parametro?.id)
  }

  const handleChangeGrupo = (e) => {
    setMostrarCampoNuevoGrupo(e.target.value === '__nuevo_grupo')
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
        <div className="mb-4">
          <Label name="codigo" className="rw-label" errorClassName="rw-label rw-label-error">
            Código
          </Label>
          <TextField
            name="codigo"
            defaultValue={props.parametro?.codigo}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{
              required: 'El código es obligatorio',
              pattern: {
                value: /^[A-Z0-9_]{1,20}$/,
                message: 'Solo mayúsculas, números y guiones bajos (max 20 caracteres)'
              }
            }}
            placeholder="Ej: TIPO_CLIENTE"
          />
          <p className="rw-help-text">Usa mayúsculas y guiones bajos, sin espacios</p>
          <FieldError name="codigo" className="rw-field-error" />
        </div>

        {/* Campo Nombre */}
        <div className="mb-4">
          <Label name="nombre" className="rw-label" errorClassName="rw-label rw-label-error">
            Nombre
          </Label>
          <TextField
            name="nombre"
            defaultValue={props.parametro?.nombre}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{
              required: 'El nombre es obligatorio',
              maxLength: {
                value: 100,
                message: 'Máximo 100 caracteres'
              }
            }}
            placeholder="Ej: Tipo de Cliente"
          />
          <p className="rw-help-text">Nombre descriptivo del parámetro</p>
          <FieldError name="nombre" className="rw-field-error" />
        </div>

        {/* Campo Grupo */}
        <div className="mb-4">
          {!mostrarCampoNuevoGrupo ? (
            <>
              <Label name="grupo" className="rw-label" errorClassName="rw-label rw-label-error">
                Grupo
              </Label>
              <SelectField
                name="grupo"
                defaultValue={props.parametro?.grupo || ''}
                className="rw-input"
                errorClassName="rw-input rw-input-error"
                onChange={handleChangeGrupo}
              >
                <option value="">Selecciona un grupo...</option>
                {gruposExistentes.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    {grupo}
                  </option>
                ))}
                <option value="__nuevo_grupo">[+] Crear nuevo grupo</option>
              </SelectField>
              <p className="rw-help-text">Agrupa parámetros relacionados</p>
              <FieldError name="grupo" className="rw-field-error" />
            </>
          ) : (
            <>
              <Label name="nuevoGrupo" className="rw-label" errorClassName="rw-label rw-label-error">
                Nuevo Grupo
              </Label>
              <div className="flex items-center gap-2">
                <TextField
                  name="nuevoGrupo"
                  className="rw-input flex-1"
                  errorClassName="rw-input rw-input-error"
                  validation={{
                    required: 'Debes ingresar un nombre para el nuevo grupo',
                    pattern: {
                      value: /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ ]{3,50}$/,
                      message: 'Entre 3 y 50 caracteres (letras, números y espacios)'
                    }
                  }}
                  placeholder="Ej: Configuración del Sistema"
                  autoFocus
                />
                <button
                  type="button"
                  className="rw-button rw-button-small rw-button-red"
                  onClick={() => setMostrarCampoNuevoGrupo(false)}
                >
                  Cancelar
                </button>
              </div>
              <p className="rw-help-text">Usa un nombre descriptivo para el nuevo grupo</p>
              <FieldError name="nuevoGrupo" className="rw-field-error" />
            </>
          )}
        </div>

        {/* Campo Descripción */}
        <div className="mb-4">
          <Label name="descripcion" className="rw-label" errorClassName="rw-label rw-label-error">
            Descripción
          </Label>
          <TextField
            name="descripcion"
            defaultValue={props.parametro?.descripcion}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            as="textarea"
            rows={3}
            validation={{
              maxLength: {
                value: 255,
                message: 'Máximo 255 caracteres'
              }
            }}
            placeholder="Ej: Define los diferentes tipos de clientes del sistema"
          />
          <p className="rw-help-text">Descripción detallada del propósito del parámetro</p>
          <FieldError name="descripcion" className="rw-field-error" />
        </div>

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            {props.loading ? 'Guardando...' : 'Guardar'}
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ParametroForm
