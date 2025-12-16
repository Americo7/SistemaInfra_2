import { db } from 'src/lib/db'

export const endpointSyncLogs = () => {
  return db.endpointSyncLog.findMany()
}

export const endpointSyncLog = ({ id }) => {
  return db.endpointSyncLog.findUnique({
    where: { id },
  })
}

export const createEndpointSyncLog = ({ input }) => {
  return db.endpointSyncLog.create({
    data: input,
  })
}

export const updateEndpointSyncLog = ({ id, input }) => {
  return db.endpointSyncLog.update({
    data: input,
    where: { id },
  })
}

export const deleteEndpointSyncLog = ({ id }) => {
  return db.endpointSyncLog.delete({
    where: { id },
  })
}

export const EndpointSyncLog = {
  proxmox_endpoint: (_obj, { root }) => {
    return db.endpointSyncLog
      .findUnique({ where: { id: root?.id } })
      .proxmox_endpoint()
  },
  k8s_endpoint: (_obj, { root }) => {
    return db.endpointSyncLog
      .findUnique({ where: { id: root?.id } })
      .k8s_endpoint()
  },
}
