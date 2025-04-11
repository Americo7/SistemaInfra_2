import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatEnum, timeTag } from 'src/lib/formatters'

// ESTE ES EL MUTATION PARA ELIMINAR UN SISTEMA
const DELETE_SISTEMA_MUTATION = gql`
  mutation DeleteSistemaMutation($id: Int!) {
    deleteSistema(id: $id) {
      id
    }
  }
`

const Sistema = ({ sistema }) => {
  const [deleteSistema] = useMutation(DELETE_SISTEMA_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema eliminado correctamente.')
      navigate(routes.sistemas())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar el sistema ' + id + '?')) {
      deleteSistema({ variables: { id } })
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Establecer fuente y tamaño base
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    // Encabezado
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(
      'AGENCIA DE GOBIERNO ELECTRÓNICO Y TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN',
      20,
      15
    )
    doc.setFontSize(12)
    doc.text('UNIDAD DE INFRAESTRUCTURA TECNOLÓGICA', 20, 20)
    doc.setFontSize(16)
    doc.text('FORMULARIO DE REGISTRO DE SISTEMA', 20, 30)

    // Información General (solo un ejemplo de cómo podrías usar datos reales)
    // Nota: Ajusta las celdas según lo que quieras mostrar: sistema.sigla, sistema.codigo, etc.
    doc.autoTable({
      startY: 40,
      head: [
        [
          {
            content: 'Información General',
            styles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' }
          },
          { content: sistema.sigla || '---', styles: { textColor: 0 } },
          { content: 'Código', styles: { textColor: 0 } },
          { content: sistema.codigo || sistema.id, styles: { textColor: 0 } }
        ]
      ],
      body: [
        [
          { content: 'Sistema', styles: { fillColor: [240, 240, 240] } },
          sistema.nombre || '',
          '',
          ''
        ],
        [
          { content: 'Entornos de Despliegue', styles: { fillColor: [240, 240, 240] } },
          '',
          '',
          ''
        ]
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 45, fillColor: [240, 240, 240] },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 }
      }
    })

    // ------------------------------------------------------------
    // EJEMPLO DE DATOS HARDCODEADOS DE ENTORNOS:
    // Aquí puedes ajustar la lógica para traer la data real de tu "sistema" o de tu DB
    // ------------------------------------------------------------
    const entornos = [
      {
        nombre: 'PRODUCCION',
        estado: 'DESPLEGADO',
        dominio: 'https://ciudadaniadigital.bo',
        componentes: [
          {
            nombre: 'gid_registrador_frontend',
            tecnologia: 'NextJS, ReactJS v5, MU, React Hook Forms v1, Axios, ESLint'
          },
          {
            nombre: 'gid_registrador_backend',
            tecnologia: 'NodeJS v20, NPM, NestJS, TypeORM'
          },
          {
            nombre: 'gid_portal_backend',
            tecnologia: 'NextJS, ReactJS v5, MU, React Hook Forms v1, Axios, ESLint'
          },
          {
            nombre: 'gid_portal_frontend',
            tecnologia: 'NodeJS v20, NPM, NestJS, TypeORM'
          },
          {
            nombre: 'gid_database',
            tecnologia: 'postgreSQL 16, postGIS'
          }
        ]
      },
      {
        nombre: 'PRE',
        estado: 'DESPLEGADO',
        dominio: 'https://preprod.ciudadaniadigital.bo',
        componentes: [
          {
            nombre: 'gid_registrador_frontend',
            tecnologia: 'NextJS, ReactJS v5, MU, React Hook Forms v1, Axios, ESLint'
          },
          // Puedes añadir más componentes o ajustarlos
        ]
      },
      {
        nombre: 'DEMO',
        estado: 'DESPLEGADO',
        dominio: 'https://demo.ciudadaniadigital.bo',
        componentes: [
          {
            nombre: 'gid_registrador_frontend',
            tecnologia: 'NextJS, ReactJS v5, MU, React Hook Forms v1, Axios, ESLint'
          },
          // Puedes añadir más componentes o ajustarlos
        ]
      }
    ]

    // Generar tablas para cada entorno
    entornos.forEach((entorno) => {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 }
        },
        body: [
          [
            {
              content: entorno.nombre,
              styles: {
                fillColor: [240, 240, 240],
                fontStyle: 'bold',
                textColor: 0
              }
            },
            {
              content: `Estado: ${entorno.estado}`,
              styles: {
                fillColor: [240, 240, 240],
                textColor: 0
              }
            },
            {
              content: 'Dominio',
              styles: {
                fillColor: [240, 240, 240],
                textColor: 0
              }
            },
            {
              content: entorno.dominio,
              styles: { textColor: 0 }
            }
          ],
          ...entorno.componentes.map((c) => [
            { content: '', styles: { textColor: 0 } },
            { content: '', styles: { textColor: 0 } },
            {
              content: c.nombre,
              styles: {
                fillColor: [255, 255, 255],
                textColor: 0
              }
            },
            {
              content: c.tecnologia,
              styles: { textColor: 0 }
            }
          ])
        ],
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 1.5,
          textColor: 0
        }
      })
    })

    // ------------------------------------------------------------
    // Respaldo de Despliegue (HARDCODEADO, ajusta a tu realidad):
    // ------------------------------------------------------------
    const respaldos = [
      ['Clic', 'AGETIC/RA//001/2025', 'UGAT', 'Cristian Mamani', '05/03/2025'],
      ['Clic', 'AGETIC/NI//005/2025', 'UGAT', 'Cristian Mamani', '10/03/2025'],
      ['Ticket', '#10881', 'UIT', 'Dery Alzares', '15/03/2025']
    ]

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          {
            content: 'Respaldo de Despliegue',
            colSpan: 5,
            styles: {
              fillColor: [220, 220, 220],
              textColor: 0,
              fontStyle: 'bold'
            }
          }
        ]
      ],
      body: [
        [
          {
            content: 'Tipo',
            styles: { fillColor: [240, 240, 240], textColor: 0 }
          },
          {
            content: 'Referencia',
            styles: { fillColor: [240, 240, 240], textColor: 0 }
          },
          {
            content: 'Unidad Solicitante',
            styles: { fillColor: [240, 240, 240], textColor: 0 }
          },
          {
            content: 'Solicitante',
            styles: { fillColor: [240, 240, 240], textColor: 0 }
          },
          {
            content: 'Fecha Respaldo',
            styles: { fillColor: [240, 240, 240], textColor: 0 }
          }
        ],
        ...respaldos.map((r) =>
          r.map((cell) => ({ content: cell, styles: { textColor: 0 } }))
        )
      ],
      theme: 'grid',
      styles: {
        fontSize: 9,
        textColor: 0
      }
    })

    // ------------------------------------------------------------
    // Administradores (HARDCODEADO, ajusta a tu realidad):
    // ------------------------------------------------------------
    const administradores = [
      ['Jorge Ayllon', 'AGETIC', 'Administrador del Sistema'],
      [
        'Oscar Flores',
        'AGETIC',
        'Administrador de Sistema Operativo, Administrador de Base de datos'
      ],
      ['Daniel Vilica', 'AGETIC', 'Administrador de Sistema Operativo']
    ]

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          {
            content: 'Administradores',
            colSpan: 3,
            styles: {
              fillColor: [220, 220, 220],
              textColor: 0,
              fontStyle: 'bold'
            }
          }
        ]
      ],
      body: [
        [
          { content: 'Nombre Completo', styles: { fillColor: [240, 240, 240], textColor: 0 } },
          { content: 'Entidad', styles: { fillColor: [240, 240, 240], textColor: 0 } },
          { content: 'Rol', styles: { fillColor: [240, 240, 240], textColor: 0 } }
        ],
        ...administradores.map((a) =>
          a.map((cell) => ({ content: cell, styles: { textColor: 0 } }))
        )
      ],
      theme: 'grid',
      styles: {
        fontSize: 9,
        textColor: 0
      }
    })

    // Guardar el PDF
    doc.save(`Formulario_Registro_Sistema_${sistema.codigo || sistema.id}.pdf`)
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Detalle del Sistema {sistema.id}
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>ID</th>
              <td>{sistema.id}</td>
            </tr>
            <tr>
              <th>ID Padre</th>
              <td>{sistema.id_padre}</td>
            </tr>
            <tr>
              <th>ID Entidad</th>
              <td>{sistema.id_entidad}</td>
            </tr>
            <tr>
              <th>Código</th>
              <td>{sistema.codigo}</td>
            </tr>
            <tr>
              <th>Sigla</th>
              <td>{sistema.sigla}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{sistema.nombre}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>{sistema.descripcion}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{formatEnum(sistema.estado)}</td>
            </tr>
            <tr>
              <th>RA Creación</th>
              <td>{sistema.ra_creacion}</td>
            </tr>
            <tr>
              <th>Fecha Creación</th>
              <td>{timeTag(sistema.fecha_creacion)}</td>
            </tr>
            <tr>
              <th>Usuario Creación</th>
              <td>{sistema.usuario_creacion}</td>
            </tr>
            <tr>
              <th>Fecha Modificación</th>
              <td>{timeTag(sistema.fecha_modificacion)}</td>
            </tr>
            <tr>
              <th>Usuario Modificación</th>
              <td>{sistema.usuario_modificacion}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editSistema({ id: sistema.id })}
          className="rw-button rw-button-blue"
        >
          Editar
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(sistema.id)}
        >
          Eliminar
        </button>
        <button
          type="button"
          className="rw-button rw-button-green"
          onClick={generatePDF}
          style={{ backgroundColor: '#28a745', color: 'white' }}
        >
          Descargar PDF
        </button>
      </nav>
    </>
  )
}

export default Sistema
