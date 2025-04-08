import { useState } from 'react'

import Select from 'react-select'

import { Form, FormError, Label, Submit } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const GET_USUARIOS = gql`
  query ObtenerUsuariosAsignacion {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
      estado
    }
  }
`
const GET_ROLES = gql`
  query ObtenerRolesAsignacion {
    roles {
      id
      nombre
      estado
    }
  }
`

const GET_MAQUINAS = gql`
  query GetMaquinasAsignacion {
    maquinas {
      id
      nombre
      estado
    }
  }
`
const GET_SISTEMAS = gql`
  query GetSistemasAsignacion {
    sistemas {
      id
      nombre
      estado
    }
  }
`
const UsuarioRolForm = (props) => {
  const { data: usuariosData } = useQuery(GET_USUARIOS)
  const { data: rolesData } = useQuery(GET_ROLES)
  const { data: maquinasData } = useQuery(GET_MAQUINAS)
  const { data: sistemasData } = useQuery(GET_SISTEMAS)

  const [selectedUsuario, setSelectedUsuario] = useState(
    props.usuarioRol?.id_usuario || null
  )
  const [selectedRol, setSelectedRol] = useState(
    props.usuarioRol?.id_rol || null
  )
  const [selectedMaquina, setSelectedMaquina] = useState(
    props.usuarioRol?.id_maquina || null
  )
  const [selectedSistema, setSelectedSistema] = useState(
    props.usuarioRol?.id_sistema || null
  )
  const usuarioOptions =
    usuariosData?.usuarios
      ?.filter((usuario) => usuario.estado === 'ACTIVO')
      .map((usuario) => ({
        value: usuario.id,
        label:
          usuario.nombres +
          ' ' +
          usuario.primer_apellido +
          ' ' +
          usuario.segundo_apellido,
      })) || []

  const rolOptions =
    rolesData?.roles
      ?.filter((rol) => rol.estado === 'ACTIVO')
      .map((rol) => ({
        value: rol.id,
        label: rol.nombre,
      })) || []

  const maquinasOptions =
    maquinasData?.maquinas
      ?.filter((maquina) => maquina.estado === 'ACTIVO')
      .map((maquina) => ({
        value: maquina.id,
        label: maquina.nombre,
      })) || []

  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((sistema) => sistema.estado === 'ACTIVO')
      .map((sistema) => ({
        value: sistema.id,
        label: sistema.nombre,
      })) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_usuario: selectedUsuario,
      id_rol: selectedRol,
      id_maquina: selectedMaquina,
      id_sistema: selectedSistema,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.usuarioRol?.id)
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

        <Label className="input-label">Usuario</Label>
        <Select
          name="id_usuario"
          value={
            usuarioOptions.find((option) => option.value === selectedUsuario) ||
            ''
          }
          options={usuarioOptions}
          onChange={(selectedOption) =>
            setSelectedUsuario(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un usuario..."
        />

        <Label className="input-label">Rol</Label>
        <Select
          name="id_rol"
          value={
            rolOptions.find((option) => option.value === selectedRol) || ''
          }
          options={rolOptions}
          onChange={(selectedOption) =>
            setSelectedRol(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un Rol..."
        />

        <Label className="input-label">Maquina</Label>
        <Select
          name="id_maquina"
          value={
            maquinasOptions.find(
              (option) => option.value === selectedMaquina
            ) || ''
          }
          options={maquinasOptions}
          onChange={(selectedOption) =>
            setSelectedMaquina(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar una maquina..."
        />

        <Label className="input-label">Sistema</Label>
        <Select
          name="id_sistema"
          value={
            sistemasOptions.find(
              (option) => option.value === selectedSistema
            ) || ''
          }
          options={sistemasOptions}
          onChange={(selectedOption) =>
            setSelectedSistema(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un Sistema..."
        />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default UsuarioRolForm
