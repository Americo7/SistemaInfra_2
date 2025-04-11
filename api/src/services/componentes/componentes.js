import { db } from 'src/lib/db'

export const componentes = () => {
  return db.componente.findMany()
}

export const componente = ({ id }) => {
  return db.componente.findUnique({
    where: { id },
  })
}

export const createComponente = ({ input }) => {

  return db.componente.create({
    data: {
      id_sistema: input.id_sistema,
      nombre: input.nombre,
      dominio: input.dominio,
      descripcion: input.descripcion,
      cod_entorno: input.cod_entorno,
      cod_categoria: input.cod_categoria,
      gitlab_repo: input.gitlab_repo,
      gitlab_rama: input.gitlab_rama,
      tecnologia: input.tecnologia,
      estado: input.estado,
      fecha_creacion: new Date(),
      usuario_creacion: input.usuario_creacion,
    },
  })
}

export const updateComponente = ({ id, input }) => {

  return db.componente.update({
    data: {
      id_sistema: input.id_sistema,
      nombre: input.nombre,
      dominio: input.dominio,
      descripcion: input.descripcion,
      cod_entorno: input.cod_entorno,
      cod_categoria: input.cod_categoria,
      gitlab_repo: input.gitlab_repo,
      gitlab_rama: input.gitlab_rama,
      tecnologia: input.tecnologia,
      estado: input.estado,
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
    },
    where: { id },
  })
}

export const deleteComponente = ({ id }) => {
  return db.componente.delete({
    where: { id },
  })
}

export const Componente = {
  sistemas: (_obj, { root }) => {
    return db.componente.findUnique({ where: { id: root?.id } }).sistemas()
  },
  despliegue: (_obj, { root }) => {
    return db.componente.findUnique({ where: { id: root?.id } }).despliegue()
  },
}
