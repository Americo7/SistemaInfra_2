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
  categoriaInfo: (_obj, { root }) => {
    if (!root.cod_categoria) return null
    return db.parametro.findFirst({
      where: {
        codigo: root.cod_categoria,
        grupo: 'CATEGORIA'
      }
    })
  },
  tecnologiaInfo: (_obj, { root }) => {
    // 1. Verificar si el campo existe y es un array válido (o tratarlo como vacío si es null/undefined)
    if (!root.tecnologia || !Array.isArray(root.tecnologia) || root.tecnologia.length === 0) {
        return [] // Devolver un array vacío si no hay tecnologías
    }
    
    // 2. Mapear el array de objetos a un array de solo los códigos (strings)
    const codigosTecnologias = root.tecnologia.map(tech => tech.codigo)

    // 3. Usar findMany con el filtro `in` para buscar todos los parámetros
    return db.parametro.findMany({ // <--- CAMBIADO a findMany
      where: {
        codigo: {
          in: codigosTecnologias // <--- Usando el filtro `in` con el array de strings
        },
        grupo: 'COMP_TECH'
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
