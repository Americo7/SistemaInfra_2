import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const sistemas = () => {
  return db.sistema.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export const sistema = ({ id }) => {
  return db.sistema.findUnique({
    where: { id },
  })
}

export const createSistema = async ({ input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  try {
    // Buscar el sistema con el ID más alto
    const lastSistema = await db.sistema.findFirst({
      orderBy: {
        id: 'desc'
      }
    });

    // Calcular un nuevo ID superior al máximo existente
    const newId = lastSistema ? lastSistema.id + 1 : 1004;

    // Crear con ID explícito y todos los campos originales
    return await db.sistema.create({
      data: {
        id: newId,
        id_padre: input.id_padre,
        id_entidad: input.id_entidad,
        codigo: input.codigo,
        sigla: input.sigla,
        nombre: input.nombre,
        descripcion: input.descripcion,
        estado: input.estado,
        ra_creacion: input.ra_creacion,
        usuario_creacion: currentUserId,
        fecha_creacion: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en la creación:", error);
    throw error;
  }
}

export const updateSistema = async ({ id, input }) => {
  const currentUserId = context.currentUser?.id ?? 1

  return db.sistema.update({
    data: {
      id_padre: input.id_padre,
      id_entidad: input.id_entidad,
      codigo: input.codigo,
      sigla: input.sigla,
      nombre: input.nombre,
      descripcion: input.descripcion,
      estado: input.estado,
      ra_creacion: input.ra_creacion,
      usuario_modificacion: currentUserId,
      fecha_modificacion: new Date(),
    },
    where: { id },
  })
}

export const deleteSistema = ({ id }) => {
  return db.sistema.delete({
    where: { id },
  })
}

export const Sistema = {
  componentes: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).componentes()
  },
  entidades: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).entidades()
  },
  sistemas: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).sistemas()
  },
  other_sistemas: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).other_sistemas()
  },
  usuario_roles: (_obj, { root }) => {
    return db.sistema.findUnique({ where: { id: root?.id } }).usuario_roles()
  },

  creadoPor: (_obj, { root }) => {
    if (!root.usuario_creacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_creacion } })
  },

  modificadoPor: (_obj, { root }) => {
    if (!root.usuario_modificacion) return null
    return db.usuario.findUnique({ where: { id: root.usuario_modificacion } })
  },
}

export const Query = {
  sistemas,
  sistema,
}
