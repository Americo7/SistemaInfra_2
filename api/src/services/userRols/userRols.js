import { db } from 'src/lib/db'

export const userRols = () => {
  return db.userRol.findMany()
}

export const userRol = ({ id }) => {
  return db.userRol.findUnique({
    where: { id },
  })
}

export const createUserRol = ({ input }) => {
  return db.userRol.create({
    data: input,
  })
}

export const updateUserRol = ({ id, input }) => {
  return db.userRol.update({
    data: input,
    where: { id },
  })
}

export const deleteUserRol = ({ id }) => {
  return db.userRol.delete({
    where: { id },
  })
}

export const UserRol = {
  rol: (_obj, { root }) => {
    return db.userRol.findUnique({ where: { id: root?.id } }).rol()
  },
  user: (_obj, { root }) => {
    return db.userRol.findUnique({ where: { id: root?.id } }).user()
  },
}
