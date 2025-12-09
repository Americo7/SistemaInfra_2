import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const componentes = () => {
  return db.componente.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const componente = ({ id }) => {
  return db.componente.findUnique({
    where: { id },
  })
}

export const parametrosFormularioComponente = () => {
  return db.parametro.findMany({
    where: {
      grupo: {
        in: ['ENTORNO', 'CATEGORIA', 'COMP_TECH']
      },
      estado: 'ACTIVO'
    },
    orderBy: [{ grupo: 'asc' }, { nombre: 'asc' }]
  })
}

export const createComponente = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

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
      usuario_creacion: currentUserId,
      fecha_creacion: new Date(),
    },
  })
}

export const updateComponente = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

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
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
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

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },

  entornoInfo: (_obj, { root }) => {
    if (!root.cod_entorno) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_entorno,
        grupo: 'ENTORNO'
      }
    })
  },
  tecnologiaInfo: (_obj, { root }) => {
    if (!root.tecnologia) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.tecnologia,
        grupo: 'COMP_TECH'
      }
    })
  },
  categoriaInfo: (_obj, { root }) => {
    if (!root.cod_categoria) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_categoria,
        grupo: 'CATEGORIA'
      }
    })
  },
}

/* ============================================================
   QUERY RESOLVERS (Permitir que GraphQL acceda a las queries)
============================================================ */
export const Query = {
  componentes,
  componente,
  parametrosFormularioComponente,
}
