export const schema = gql`
  type Rol {
    id: Int!
    name: String!
    user_rol: [UserRol]!
  }

  type Query {
    rols: [Rol!]! @requireAuth
    rol(id: Int!): Rol @requireAuth
  }

  input CreateRolInput {
    name: String!
  }

  input UpdateRolInput {
    name: String
  }

  type Mutation {
    createRol(input: CreateRolInput!): Rol! @requireAuth
    updateRol(id: Int!, input: UpdateRolInput!): Rol! @requireAuth
    deleteRol(id: Int!): Rol! @requireAuth
  }
`
