// scripts/cleanDatabase.js
// Script interactivo para limpiar la base de datos manteniendo 1 usuario, parámetros y data centers

import { db } from 'api/src/lib/db'
import { createInterface } from 'readline'

const cleanDatabase = async ({ args }) => {
  console.log('🧹 Iniciando limpieza de base de datos...')
  
  try {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    // Función helper para preguntas
    const question = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve)
      })
    }
    
    // Mostrar usuarios disponibles (esquema registro)
    const usuarios = await db.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        primer_apellido: true,
        segundo_apellido: true,
        email: true,
        nro_documento: true,
        nombre_usuario: true
      }
    })
    
    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
      rl.close()
      return
    }
    
    console.log('\n📋 Usuarios disponibles:')
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ID: ${usuario.id} - ${usuario.nombres} ${usuario.primer_apellido} ${usuario.segundo_apellido || ''}`)
      console.log(`    📧 ${usuario.email} | 👤 ${usuario.nombre_usuario} | 📄 CI: ${usuario.nro_documento}`)
      console.log('    ────────────────────────────────────────────────────────')
    })
    
    const userChoice = await question('\n¿Cuál usuario deseas mantener? (ingresa el número): ')
    
    const selectedUser = usuarios[parseInt(userChoice) - 1]
    
    if (!selectedUser) {
      console.log('❌ Usuario no válido')
      rl.close()
      return
    }
    
    console.log(`✅ Usuario seleccionado: ${selectedUser.nombres} ${selectedUser.primer_apellido} (ID: ${selectedUser.id})`)
    
    // Mostrar resumen de lo que se eliminará
    console.log('\n⚠️  SE ELIMINARÁN TODOS LOS DATOS EXCEPTO:')
    console.log(`   ✅ Usuario: ${selectedUser.nombres} ${selectedUser.primer_apellido}`)
    console.log('   ✅ Todos los parámetros (esquema parametricas)')
    console.log('   ✅ Todos los data centers')
    console.log('   ✅ Estructura completa de la base de datos')
    console.log('\n❌ SE ELIMINARÁN:')
    console.log('   - Todos los demás usuarios')
    console.log('   - Todos los eventos y bitácoras')
    console.log('   - Todos los despliegues y componentes')
    console.log('   - Todos los sistemas y entidades')
    console.log('   - Clusters, máquinas y servidores (pero NO data centers)')
    console.log('   - Todos los roles y asignaciones')
    console.log('   - Usuarios y roles del esquema autenticacion')
    
    const confirm = await question('\n🚨 ¿Estás ABSOLUTAMENTE SEGURO de proceder? (escribe "CONFIRMO" para continuar): ')
    
    rl.close()
    
    if (confirm !== 'CONFIRMO') {
      console.log('❌ Operación cancelada por seguridad')
      return
    }
    
    console.log('\n🗑️  Iniciando eliminación de registros...')
    
    // ELIMINACIÓN EN ORDEN CORRECTO (respetando foreign keys)
    // Orden: desde las tablas más dependientes hacia las menos dependientes
    
    // 1. Bitácoras y eventos (son las más dependientes)
    console.log('🔄 [1/22] Eliminando bitácoras de eventos...')
    const deletedEventosBitacora = await db.eventosBitacora.deleteMany({})
    console.log(`   ✅ ${deletedEventosBitacora.count} bitácoras de eventos`)
    
    console.log('🔄 [2/22] Eliminando bitácoras de despliegues...')
    const deletedDespliegueBitacora = await db.despliegueBitacora.deleteMany({})
    console.log(`   ✅ ${deletedDespliegueBitacora.count} bitácoras de despliegues`)
    
    // 2. Infraestructura afectada
    console.log('🔄 [3/22] Eliminando infraestructura afectada...')
    const deletedInfraAfectada = await db.infraAfectada.deleteMany({})
    console.log(`   ✅ ${deletedInfraAfectada.count} registros de infraestructura afectada`)
    
    // 3. Eventos
    console.log('🔄 [4/22] Eliminando eventos...')
    const deletedEventos = await db.evento.deleteMany({})
    console.log(`   ✅ ${deletedEventos.count} eventos`)
    
    // 4. Despliegues
    console.log('🔄 [5/22] Eliminando despliegues...')
    const deletedDespliegues = await db.despliegue.deleteMany({})
    console.log(`   ✅ ${deletedDespliegues.count} despliegues`)
    
    // 5. Componentes (dependen de sistemas)
    console.log('🔄 [6/22] Eliminando componentes...')
    const deletedComponentes = await db.componente.deleteMany({})
    console.log(`   ✅ ${deletedComponentes.count} componentes`)
    
    // 6. Usuario Roles PRIMERO (dependen de sistemas)
    console.log('🔄 [7/22] Eliminando roles de usuarios (excepto el seleccionado)...')
    const deletedUsuarioRoles = await db.usuarioRol.deleteMany({
      where: {
        id_usuario: {
          not: selectedUser.id
        }
      }
    })
    console.log(`   ✅ ${deletedUsuarioRoles.count} relaciones usuario-rol`)
    
    // 7. SISTEMAS - Manejar jerarquía (sistemas hijos primero, luego padres)
    console.log('🔄 [8/22] Eliminando sistemas (primero hijos, luego padres)...')
    
    // Primero eliminamos sistemas que tienen padre (hijos)
    const deletedSistemasHijos = await db.sistema.deleteMany({
      where: {
        id_padre: {
          not: null
        }
      }
    })
    console.log(`   ✅ ${deletedSistemasHijos.count} sistemas hijos`)
    
    // Luego eliminamos sistemas padre (que no tienen padre)
    const deletedSistemasPadres = await db.sistema.deleteMany({
      where: {
        id_padre: null
      }
    })
    console.log(`   ✅ ${deletedSistemasPadres.count} sistemas padre`)
    
    // 8. Entidades (ahora que no hay sistemas que las referencien)
    console.log('🔄 [9/22] Eliminando entidades...')
    const deletedEntidades = await db.entidad.deleteMany({})
    console.log(`   ✅ ${deletedEntidades.count} entidades`)
    
    // 9. Asignaciones servidor-máquina (dependen de servidores, máquinas y clusters)
    console.log('🔄 [10/22] Eliminando asignaciones servidor-máquina...')
    const deletedAsignaciones = await db.asignacionServidorMaquina.deleteMany({})
    console.log(`   ✅ ${deletedAsignaciones.count} asignaciones`)
    
    // 10. Máquinas (ya no tienen referencias)
    console.log('🔄 [11/22] Eliminando máquinas...')
    const deletedMaquinas = await db.maquina.deleteMany({})
    console.log(`   ✅ ${deletedMaquinas.count} máquinas`)
    
    // 11. Servidores (manejar jerarquía padre-hijo)
    console.log('🔄 [12/22] Eliminando servidores (primero hijos, luego padres)...')
    
    // Primero servidores que tienen padre (hijos)
    const deletedServidoresHijos = await db.servidor.deleteMany({
      where: {
        id_padre: {
          not: null
        }
      }
    })
    console.log(`   ✅ ${deletedServidoresHijos.count} servidores hijos`)
    
    // Luego servidores padre (que no tienen padre)
    const deletedServidoresPadres = await db.servidor.deleteMany({
      where: {
        id_padre: null
      }
    })
    console.log(`   ✅ ${deletedServidoresPadres.count} servidores padre`)
    
    // 12. Clusters (ya no tienen referencias)
    console.log('🔄 [13/22] Eliminando clusters...')
    const deletedClusters = await db.cluster.deleteMany({})
    console.log(`   ✅ ${deletedClusters.count} clusters`)
    
    // 13. Data Centers - NO SE ELIMINAN (PRESERVADOS)
    console.log('🔄 [14/22] Verificando data centers...')
    const dataCentersCount = await db.dataCenter.count()
    console.log(`   ✅ Data centers preservados: ${dataCentersCount}`)
    
    // 14. Usuarios (registro schema) - excepto el seleccionado
    console.log('🔄 [15/22] Eliminando usuarios (excepto el seleccionado)...')
    const deletedUsuarios = await db.usuario.deleteMany({
      where: {
        id: {
          not: selectedUser.id
        }
      }
    })
    console.log(`   ✅ ${deletedUsuarios.count} usuarios`)
    
    // 15. Roles huérfanos (registro schema)
    console.log('🔄 [16/22] Limpiando roles huérfanos...')
    const rolesWithUsers = await db.usuarioRol.findMany({
      select: { id_rol: true },
      distinct: ['id_rol']
    })
    
    const roleIdsWithUsers = rolesWithUsers.map(r => r.id_rol)
    let deletedRoles = { count: 0 }
    
    if (roleIdsWithUsers.length > 0) {
      deletedRoles = await db.role.deleteMany({
        where: {
          id: {
            notIn: roleIdsWithUsers
          }
        }
      })
    } else {
      deletedRoles = await db.role.deleteMany({})
    }
    console.log(`   ✅ ${deletedRoles.count} roles huérfanos`)
    
    // 16. ESQUEMA AUTENTICACION - UserRol
    console.log('🔄 [17/22] Eliminando relaciones user-rol (esquema autenticacion)...')
    const deletedUserRol = await db.userRol.deleteMany({})
    console.log(`   ✅ ${deletedUserRol.count} relaciones user-rol`)
    
    // 17. ESQUEMA AUTENTICACION - Users
    console.log('🔄 [18/22] Eliminando usuarios (esquema autenticacion)...')
    const deletedUsers = await db.user.deleteMany({})
    console.log(`   ✅ ${deletedUsers.count} users`)
    
    // 18. ESQUEMA AUTENTICACION - Roles
    console.log('🔄 [19/22] Eliminando roles (esquema autenticacion)...')
    const deletedRol = await db.rol.deleteMany({})
    console.log(`   ✅ ${deletedRol.count} roles`)
    
    // Verificar parámetros (NO los eliminamos)
    console.log('🔄 [20/22] Verificando parámetros...')
    const parametrosCount = await db.parametro.count()
    console.log(`   ✅ Parámetros preservados: ${parametrosCount}`)
    
    // Verificar usuario final
    console.log('🔄 [21/22] Verificando usuario preservado...')
    const usuarioFinal = await db.usuario.findUnique({
      where: { id: selectedUser.id }
    })
    console.log(`   ✅ Usuario preservado: ${usuarioFinal?.nombres} ${usuarioFinal?.primer_apellido}`)
    
    // Resumen final
    console.log('🔄 [22/22] Generando resumen final...')
    const totalUsuarios = await db.usuario.count()
    const totalParametros = await db.parametro.count()
    const totalDataCenters = await db.dataCenter.count()
    
    console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!')
    console.log('📊 Resumen final:')
    console.log(`   ✅ Usuarios restantes: ${totalUsuarios} (${selectedUser.nombres} ${selectedUser.primer_apellido})`)
    console.log(`   ✅ Parámetros mantenidos: ${totalParametros}`)
    console.log(`   ✅ Data centers mantenidos: ${totalDataCenters}`)
    console.log('   ✅ Estructura de BD: Intacta (3 esquemas)')
    console.log('   ✅ Todos los demás datos: Eliminados correctamente')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    console.error('Stack:', error.stack)
    
    if (error.code) {
      console.error('Código de error:', error.code)
    }
    if (error.meta) {
      console.error('Meta información:', error.meta)
    }
    
  } finally {
    await db.$disconnect()
  }
}

export default cleanDatabase