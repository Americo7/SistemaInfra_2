import { db } from 'src/lib/db'

export const sistemas = () => {
  return db.sistema.findMany()
}

export const sistema = ({ id }) => {
  return db.sistema.findUnique({
    where: { id },
  })
}

export const createSistema = async ({ input }) => {
  try {
    // Buscar el sistema con el ID más alto
    const lastSistema = await db.sistema.findFirst({
      orderBy: {
        id: 'desc'
      }
    });

    // Calcular un nuevo ID superior al máximo existente
    const newId = lastSistema ? lastSistema.id + 1 : 1004;

    // Extraemos cualquier id del input
    const { id, ...dataSinId } = input;

    // Crear con ID explícito y todos los campos originales
    return await db.sistema.create({
      data: {
        id: newId,  // Asignar un ID que sabemos que no existe
        id_padre: input.id_padre,
        id_entidad: input.id_entidad,
        codigo: input.codigo,
        sigla: input.sigla,
        nombre: input.nombre,
        descripcion: input.descripcion,
        estado: input.estado,
        ra_creacion: input.ra_creacion,
        fecha_creacion: new Date(),
        usuario_creacion: input.usuario_creacion,
      },
    });
  } catch (error) {
    console.error("Error en la creación:", error);
    throw error;
  }
}
export const updateSistema = ({ id, input }) => {
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
      fecha_modificacion: new Date(),
      usuario_modificacion: input.usuario_modificacion,
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
}
