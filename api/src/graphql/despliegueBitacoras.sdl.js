export const schema = gql`
  type DespliegueBitacora {
    id: Int!
    id_despliegue: Int!
    estado_anterior: String!
    estado_actual: String!
    fecha_creacion: DateTime!
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
    despliegue: Despliegue!
    descripcion: String!
  }

  type Query {
    despliegueBitacoras: [DespliegueBitacora!]! @requireAuth
    despliegueBitacora(id: Int!): DespliegueBitacora @requireAuth
  }

  input CreateDespliegueBitacoraInput {
    id_despliegue: Int!
    estado_anterior: String!
    estado_actual: String!
    descripcion: String
    fecha_creacion: DateTime
    usuario_creacion: Int!
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  input UpdateDespliegueBitacoraInput {
    id_despliegue: Int
    estado_anterior: String
    estado_actual: String
    descripcion: String
    fecha_creacion: DateTime
    usuario_creacion: Int
    fecha_modificacion: DateTime
    usuario_modificacion: Int
  }

  type Mutation {
    createDespliegueBitacora(
      input: CreateDespliegueBitacoraInput!
    ): DespliegueBitacora! @requireAuth
    updateDespliegueBitacora(
      id: Int!
      input: UpdateDespliegueBitacoraInput!
    ): DespliegueBitacora! @requireAuth
    deleteDespliegueBitacora(id: Int!): DespliegueBitacora! @requireAuth
  }
`
