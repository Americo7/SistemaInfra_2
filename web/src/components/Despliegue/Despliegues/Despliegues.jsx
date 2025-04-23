import React, { useState, useMemo, useRef } from 'react';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  DateRange as DateRangeIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Popover,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import * as XLSX from 'xlsx-js-style';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { Link, routes } from '@redwoodjs/router';
import { useMutation, useQuery } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';
import { QUERY } from 'src/components/Despliegue/DesplieguesCell';
import { formatEnum, truncate } from 'src/lib/formatters';

const UPDATE_DESPLIEGUE_MUTATION = gql`
  mutation UpdateDespliegueMutation_fromDesplieguesList($id: Int!, $input: UpdateDespliegueInput!) {
    updateDespliegue(id: $id, input: $input) {
      id
      estado
    }
  }
`;



const GET_COMPONENTES_QUERY = gql`
  query FindComponentes_fronDesplieguesList {
    componentes {
      id
      nombre
      sistemas {
        id
        nombre
      }
    }
  }
`;

const GET_MAQUINAS_QUERY = gql`
  query FindMaquinas_fromDesplieguesList {
    maquinas {
      id
      nombre
      asignacion_servidor_maquina {
        servidores {
          id
          nombre
        }
      }
    }
  }
`;

const GET_SISTEMAS_QUERY = gql`
  query FindSistemas_fromDesplieguesList {
    sistemas {
      id
      nombre
    }
  }
`;

const GET_SERVIDORES_QUERY = gql`
  query FindServidores {
    servidores {
      id
      nombre
      cod_tipo_servidor
      id_padre
    }
  }
`;

const GET_USUARIOS_QUERY = gql`
  query FindUsuarios_fromDesplieguesList {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy, HH:mm', { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'N/A';
  }
};

const DesplieguesList = ({ despliegues = [] }) => {
  const [deleteState, setDeleteState] = useState({ open: false, id: null });
  const [exportMenuAnchor, setExportMenuAnchor] = useState({
    all: null,
    page: null,
    selection: null,
  });
  const [showInactive, setShowInactive] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [dateFilterAnchor, setDateFilterAnchor] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilterType, setDateFilterType] = useState('fecha_despliegue');
  const reportRef = useRef();

  // Consultas GraphQL
  const { data: componentesData } = useQuery(GET_COMPONENTES_QUERY);
  const { data: maquinasData } = useQuery(GET_MAQUINAS_QUERY);
  const { data: sistemasData } = useQuery(GET_SISTEMAS_QUERY);
  const { data: servidoresData } = useQuery(GET_SERVIDORES_QUERY);
  const { data: usuariosData } = useQuery(GET_USUARIOS_QUERY);

  const [updateDespliegue] = useMutation(UPDATE_DESPLIEGUE_MUTATION, {
    onCompleted: () => {
      toast.success('Despliegue desactivado correctamente');
      setDeleteState({ open: false, id: null });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  });

  const desactivarDespliegue = (id) => {
    updateDespliegue({
      variables: {
        id: id,
        input: {
          estado: 'INACTIVO',
          fecha_modificacion: new Date().toISOString(),
        },
      },
    });
  };

  // Funciones auxiliares
  const getNombre = (id, lista, campo = 'nombre') => {
    if (!id || !lista) return 'N/A';
    const item = lista.find((item) => item.id === id);
    return item ? item[campo] : 'N/A';
  };

  const getNombreCompleto = (id) => {
    if (!id || !usuariosData?.usuarios) return 'N/A';
    const usuario = usuariosData.usuarios.find((u) => u.id === id);
    if (!usuario) return 'N/A';
    return `${usuario.nombres || ''} ${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim();
  };

  const getSistemaAsociado = (componenteId) => {
    if (!componenteId || !componentesData?.componentes) return 'N/A';
    const componente = componentesData.componentes.find((c) => c.id === componenteId);
    if (!componente) return 'N/A';

    // Caso 1: El sistema está directamente en el componente
    if (componente.sistemas?.nombre) return componente.sistemas.nombre;

    // Caso 2: El sistema está en un array
    if (componente.sistemas?.[0]?.nombre) return componente.sistemas[0].nombre;

    // Caso 3: Buscar en sistemasData usando el ID
    if (sistemasData?.sistemas && componente.sistemas?.[0]?.id) {
      const sistema = sistemasData.sistemas.find((s) => s.id === componente.sistemas[0].id);
      return sistema?.nombre || 'N/A';
    }

    return 'N/A';
  };

  const getServidorAsociado = (maquinaId) => {
    if (!maquinaId || !maquinasData?.maquinas) return 'N/A';
    const maquina = maquinasData.maquinas.find((m) => m.id === maquinaId);
    if (!maquina || !maquina.asignacion_servidor_maquina?.[0]?.servidores) return 'N/A';

    const servidorId = maquina.asignacion_servidor_maquina[0].servidores.id;
    if (!servidoresData?.servidores) return 'N/A';

    const servidor = servidoresData.servidores.find((s) => s.id === servidorId);
    if (!servidor) return 'N/A';

    let infoServidor = servidor.nombre || 'N/A';
    if (servidor.cod_tipo_servidor) infoServidor += ` (${servidor.cod_tipo_servidor})`;
    if (servidor.id_padre) {
      const servidorPadre = servidoresData.servidores.find((s) => s.id === servidor.id_padre);
      if (servidorPadre) infoServidor += ` - Padre: ${servidorPadre.nombre}`;
    }

    return infoServidor;
  };

  const filterByDateRange = (despliegue) => {
    if (!startDate && !endDate) return true;
    try {
      const dateToFilter = parseISO(despliegue[dateFilterType]);
      if (startDate && !endDate) return dateToFilter >= startDate;
      if (!startDate && endDate) return dateToFilter <= endDate;
      return isWithinInterval(dateToFilter, { start: startDate, end: endDate });
    } catch (error) {
      console.error('Error al filtrar por fecha:', error);
      return true;
    }
  };

  const filteredDespliegues = useMemo(() => {
    let result = despliegues;
    if (!showInactive) result = result.filter((d) => d.estado === 'ACTIVO');
    if (startDate || endDate) result = result.filter(filterByDateRange);
    return result;
  }, [despliegues, showInactive, startDate, endDate, dateFilterType]);

  const generateSystemReport = () => {
    const systemsMap = new Map();
    filteredDespliegues.forEach((despliegue) => {
      const sistemaNombre = getSistemaAsociado(despliegue.id_componente);
      if (!systemsMap.has(sistemaNombre)) {
        systemsMap.set(sistemaNombre, { nombre: sistemaNombre, despliegues: [] });
      }
      systemsMap.get(sistemaNombre).despliegues.push({
        ...despliegue,
        sistemaNombre,
        servidorAsociado: getServidorAsociado(despliegue.id_maquina)
      });
    });

    return Array.from(systemsMap.values()).map((system) => ({
      sistema: system.nombre,
      despliegues: system.despliegues.map((d) => ({
        fecha_despliegue: formatDateTime(d.fecha_despliegue),
        fecha_solicitud: formatDateTime(d.fecha_solicitud),
        componente: getNombre(d.id_componente, componentesData?.componentes),
        maquina: getNombre(d.id_maquina, maquinasData?.maquinas),
        sistema: d.sistemaNombre,
        servidor: d.servidorAsociado,
        solicitante: d.solicitante,
        unidad_solicitante: d.unidad_solicitante,
        referencia_respaldo: d.referencia_respaldo,
      })),
    }));
  };

  const systemReport = useMemo(() => generateSystemReport(), [
    filteredDespliegues, componentesData, maquinasData, sistemasData, servidoresData
  ]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page { size: auto; margin: 10mm; }
      @media print {
        body { padding: 20px; }
        .report-header { margin-bottom: 20px; }
        .system-title { margin: 15px 0 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { background-color: #f5f5f5 !important; font-weight: bold; }
        th, td { border: 1px solid #ddd; padding: 8px; }
      }
    `,
  });

  // Funciones de exportación para la tabla completa
  const exportToPDF = (rows, table) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });
    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(15, 40, 77)
       .text('Reporte de Despliegues', 14, 15);
    doc.setFontSize(10).setTextColor(100)
       .text(`Generado: ${formatDateTime(new Date().toISOString())}`, 14, 22);

    if (startDate || endDate) {
      const filterText = startDate && endDate
        ? `Filtro: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : startDate ? `Filtro: Desde ${format(startDate, 'dd/MM/yyyy')}`
        : `Filtro: Hasta ${format(endDate, 'dd/MM/yyyy')}`;
      doc.text(filterText, 14, 30);
    }

    // Filtrar columnas para excluir acciones y selección
    const visibleColumns = table.getAllColumns()
      .filter((column) => column.getIsVisible() &&
             !['mrt-row-actions', 'mrt-row-select'].includes(column.id));

    const headers = visibleColumns.map((column) => column.columnDef.header);
    const data = rows.map((row) =>
      visibleColumns.map((column) => {
        const cellValue = row.original[column.id];
        if (column.id === 'estado') return row.original.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
        if (column.id === 'id_componente') return getNombre(row.original.id_componente, componentesData?.componentes);
        if (column.id === 'id_maquina') return getNombre(row.original.id_maquina, maquinasData?.maquinas);
        if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion') return getNombreCompleto(cellValue);
        if (column.id.includes('fecha')) return formatDateTime(cellValue);
        if (column.id === 'estado_despliegue') return formatEnum(cellValue);
        return cellValue || 'N/A';
      })
    );

    autoTable(doc, {
      head: [headers.map(h => ({
        content: h,
        styles: { fillColor: [15, 40, 77], textColor: 255, fontStyle: 'bold' }
      }))],
      body: data.map(row => row.map(cell => ({
        content: cell,
        styles: { fillColor: [255, 255, 255] }
      }))),
      startY: startDate || endDate ? 40 : 30,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', font: 'helvetica' },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i).setFontSize(8).text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`reporte-despliegues-${new Date().toISOString()}.pdf`);
  };

  const exportToExcel = (rows, table) => {
    // Filtrar columnas para excluir acciones y selección
    const visibleColumns = table.getAllColumns()
      .filter((column) => column.getIsVisible() &&
             !['mrt-row-actions', 'mrt-row-select'].includes(column.id));

    const headers = visibleColumns.map((column) => column.columnDef.header);
    const data = rows.map((row) =>
      visibleColumns.map((column) => {
        const cellValue = row.original[column.id];
        if (column.id === 'estado') return row.original.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
        if (column.id === 'id_componente') return getNombre(row.original.id_componente, componentesData?.componentes);
        if (column.id === 'id_maquina') return getNombre(row.original.id_maquina, maquinasData?.maquinas);
        if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion') return getNombreCompleto(cellValue);
        if (column.id.includes('fecha')) return formatDateTime(cellValue);
        if (column.id === 'estado_despliegue') return formatEnum(cellValue);
        return cellValue || 'N/A';
      })
    );

    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Estilo para los headers
    for (let C = 0; C < headers.length; C++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: C });
      ws[cell].s = {
        font: { sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '0F284D' } },
        alignment: { horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      };
    }

    // Ajustar ancho de columnas
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, 'Despliegues');
    XLSX.writeFile(wb, `reporte-despliegues-${new Date().toISOString()}.xlsx`);
  };

  const exportToCSV = (rows, table) => {
    // Filtrar columnas para excluir acciones y selección
    const visibleColumns = table.getAllColumns()
      .filter((column) => column.getIsVisible() &&
             !['mrt-row-actions', 'mrt-row-select'].includes(column.id));

    const headers = visibleColumns.map((column) => column.columnDef.header);
    const data = rows.map((row) =>
      visibleColumns.map((column) => {
        const cellValue = row.original[column.id];
        if (column.id === 'estado') return row.original.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
        if (column.id === 'id_componente') return getNombre(row.original.id_componente, componentesData?.componentes);
        if (column.id === 'id_maquina') return getNombre(row.original.id_maquina, maquinasData?.maquinas);
        if (column.id === 'usuario_creacion' || column.id === 'usuario_modificacion') return getNombreCompleto(cellValue);
        if (column.id.includes('fecha')) return formatDateTime(cellValue);
        if (column.id === 'estado_despliegue') return formatEnum(cellValue);
        return cellValue || 'N/A';
      })
    );

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-despliegues-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Funciones de exportación para el reporte de sistemas
  const exportSystemReportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });
    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(15, 40, 77)
       .text('Reporte de Sistemas Desplegados', 14, 15);
    doc.setFontSize(10).setTextColor(100)
       .text(`Generado: ${formatDateTime(new Date().toISOString())}`, 14, 22);

    if (startDate || endDate) {
      const filterText = startDate && endDate
        ? `Filtro: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : startDate ? `Filtro: Desde ${format(startDate, 'dd/MM/yyyy')}`
        : `Filtro: Hasta ${format(endDate, 'dd/MM/yyyy')}`;
      doc.text(filterText, 14, 30);
    }

    let yPosition = startDate || endDate ? 40 : 30;
    systemReport.forEach((system) => {
      doc.setFontSize(12).setFont('helvetica', 'bold')
         .text(`Sistema: ${system.sistema}`, 14, yPosition);
      yPosition += 10;

      const headers = [
        'Fecha Despliegue', 'Fecha Solicitud', 'Componente',
        'Máquina', 'Servidor Asociado', 'Solicitante',
        'Unidad Solicitante', 'Referencia Respaldo'
      ];

      const data = system.despliegues.map((d) => [
        d.fecha_despliegue, d.fecha_solicitud, d.componente,
        d.maquina, d.servidor, d.solicitante,
        d.unidad_solicitante, d.referencia_respaldo
      ]);

      autoTable(doc, {
        head: [headers.map(h => ({
          content: h,
          styles: { fillColor: [15, 40, 77], textColor: 255, fontStyle: 'bold' }
        }))],
        body: data.map(row => row.map(cell => ({
          content: cell,
          styles: { fillColor: [255, 255, 255] }
        }))),
        startY: yPosition,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', font: 'helvetica' },
        margin: { left: 10, right: 10 },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i).setFontSize(8).text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`reporte-sistemas-${new Date().toISOString()}.pdf`);
  };

  const exportSystemReportToExcel = () => {
    const wb = XLSX.utils.book_new();
    systemReport.forEach((system) => {
      const wsData = [
        [`Sistema: ${system.sistema}`], [],
        ['Fecha Despliegue', 'Fecha Solicitud', 'Componente', 'Máquina',
         'Servidor Asociado', 'Solicitante', 'Unidad Solicitante', 'Referencia Respaldo'],
        ...system.despliegues.map(d => [
          d.fecha_despliegue, d.fecha_solicitud, d.componente, d.maquina,
          d.servidor, d.solicitante, d.unidad_solicitante, d.referencia_respaldo
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      if (ws['A1']) {
        ws['A1'].s = { font: { sz: 14, bold: true, color: { rgb: '0F284D' } } };
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
      }

      for (let C = 0; C < 8; C++) {
        const cell = XLSX.utils.encode_cell({ r: 2, c: C });
        ws[cell].s = {
          font: { sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0F284D' } },
          alignment: { horizontal: 'center' },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' },
                   left: { style: 'thin' }, right: { style: 'thin' } }
        };
      }

      ws['!cols'] = [
        { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 },
        { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, system.sistema.substring(0, 31));
    });

    XLSX.writeFile(wb, `reporte-sistemas-${new Date().toISOString()}.xlsx`);
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'id_componente',
      header: 'Componente',
      size: 150,
      Cell: ({ row }) => getNombre(row.original.id_componente, componentesData?.componentes),
    },
    {
      accessorKey: 'id_maquina',
      header: 'Máquina',
      size: 150,
      Cell: ({ row }) => getNombre(row.original.id_maquina, maquinasData?.maquinas),
    },
    {
      id: 'sistema_asociado',
      header: 'Sistema Asociado',
      size: 150,
      Cell: ({ row }) => getSistemaAsociado(row.original.id_componente),
    },
    {
      id: 'servidor_asociado',
      header: 'Servidor Asociado',
      size: 180,
      Cell: ({ row }) => getServidorAsociado(row.original.id_maquina),
    },
    {
      accessorKey: 'fecha_despliegue',
      header: 'Fecha Despliegue',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
    },
    {
      accessorKey: 'fecha_solicitud',
      header: 'Fecha Solicitud',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
    },
    {
      accessorKey: 'unidad_solicitante',
      header: 'Unidad Solicitante',
      size: 150,
    },
    {
      accessorKey: 'solicitante',
      header: 'Solicitante',
      size: 120,
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      size: 200,
    },
    {
      accessorKey: 'cod_tipo_respaldo',
      header: 'Tipo Respaldo',
      size: 120,
    },
    {
      accessorKey: 'referencia_respaldo',
      header: 'Referencia Respaldo',
      size: 150,
    },
    {
      accessorKey: 'estado_despliegue',
      header: 'Estado Despliegue',
      size: 120,
      Cell: ({ cell }) => formatEnum(cell.getValue()),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 100,
      Cell: ({ row }) => (
        <Chip
          label={formatEnum(row.original.estado)}
          color={row.original.estado === 'ACTIVO' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      accessorKey: 'fecha_creacion',
      header: 'Fecha Creación',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
      enableHiding: true,
    },
    {
      accessorKey: 'usuario_creacion',
      header: 'Creado por',
      size: 180,
      Cell: ({ cell }) => getNombreCompleto(cell.getValue()),
      enableHiding: true,
    },
    {
      accessorKey: 'fecha_modificacion',
      header: 'Última Modificación',
      size: 150,
      Cell: ({ cell }) => formatDateTime(cell.getValue()),
      enableHiding: true,
    },
    {
      accessorKey: 'usuario_modificacion',
      header: 'Modificado por',
      size: 180,
      Cell: ({ cell }) => getNombreCompleto(cell.getValue()),
      enableHiding: true,
    },
  ], [componentesData, maquinasData, sistemasData, servidoresData, usuariosData]);

  const table = useMaterialReactTable({
    columns,
    data: filteredDespliegues,
    enableRowActions: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: {
        cursor: 'pointer',
        backgroundColor: row.getIsSelected() ? 'rgba(0, 0, 255, 0.1)' : undefined,
      },
    }),
    initialState: {
      showGlobalFilter: true,
      columnVisibility: {
        fecha_creacion: false,
        usuario_creacion: false,
        fecha_modificacion: false,
        usuario_modificacion: false,
      },
      density: 'compact',
    },

    mrtTableBodyRowDragHandleProps: {
      id: 'mrt-row-drag',
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Acciones',
        id: 'mrt-row-actions',
      },
      'mrt-row-select': {
        header: 'Seleccionar',
        id: 'mrt-row-select',
      },
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Ver detalles">
          <IconButton component={Link} to={routes.despliegue({ id: row.original.id })}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton component={Link} to={routes.editDespliegue({ id: row.original.id })}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.original.estado === 'ACTIVO' && (
          <Tooltip title="Desactivar">
            <IconButton onClick={() => setDeleteState({ open: true, id: row.original.id })}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const hasSelection = selectedRows.length > 0;

      return (
        <Box sx={{ display: 'flex', gap: '16px', p: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                size="small"
              />
            }
            label="Mostrar inactivos"
          />

          <Button
            startIcon={<DateRangeIcon />}
            onClick={(e) => setDateFilterAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
            sx={{
              borderColor: startDate || endDate ? '#0F284D' : undefined,
              backgroundColor: startDate || endDate ? 'rgba(15, 40, 77, 0.08)' : undefined,
            }}
          >
            Filtrar por fecha
            {(startDate || endDate) && (
              <Chip
                label={
                  startDate && endDate
                    ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                    : startDate
                    ? `Desde ${format(startDate, 'dd/MM/yyyy')}`
                    : `Hasta ${format(endDate, 'dd/MM/yyyy')}`
                }
                size="small"
                sx={{ ml: 1 }}
                onDelete={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              />
            )}
          </Button>

          <Popover
            open={Boolean(dateFilterAnchor)}
            anchorEl={dateFilterAnchor}
            onClose={() => setDateFilterAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, width: 300 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Filtrar por"
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="fecha_despliegue">Fecha de Despliegue</MenuItem>
                    <MenuItem value="fecha_solicitud">Fecha de Solicitud</MenuItem>
                    <MenuItem value="fecha_creacion">Fecha de Creación</MenuItem>
                    <MenuItem value="fecha_modificacion">Fecha de Modificación</MenuItem>
                  </TextField>

                  <DatePicker
                    label="Fecha inicial"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />

                  <DatePicker
                    label="Fecha final"
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />

                  <Button
                    onClick={() => { setStartDate(null); setEndDate(null); }}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    Limpiar filtro
                  </Button>
                </Stack>
              </LocalizationProvider>
            </Box>
          </Popover>

          {currentTab === 0 && (
            <>
              <Button
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, all: e.currentTarget })}
                startIcon={<FileDownloadIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Exportar Todos
              </Button>
              <Menu
                anchorEl={exportMenuAnchor.all}
                open={Boolean(exportMenuAnchor.all)}
                onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, all: null })}
              >
                <MenuItem
                  onClick={() => {
                    exportToPDF(table.getPrePaginationRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, all: null });
                  }}
                >
                  PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToExcel(table.getPrePaginationRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, all: null });
                  }}
                >
                  Excel
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToCSV(table.getPrePaginationRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, all: null });
                  }}
                >
                  CSV
                </MenuItem>
              </Menu>

              <Button
                disabled={table.getRowModel().rows.length === 0}
                onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, page: e.currentTarget })}
                startIcon={<FileDownloadIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Exportar Página
              </Button>
              <Menu
                anchorEl={exportMenuAnchor.page}
                open={Boolean(exportMenuAnchor.page)}
                onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, page: null })}
              >
                <MenuItem
                  onClick={() => {
                    exportToPDF(table.getRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, page: null });
                  }}
                >
                  PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToExcel(table.getRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, page: null });
                  }}
                >
                  Excel
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToCSV(table.getRowModel().rows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, page: null });
                  }}
                >
                  CSV
                </MenuItem>
              </Menu>

              <Button
                disabled={!hasSelection}
                onClick={(e) => setExportMenuAnchor({ ...exportMenuAnchor, selection: e.currentTarget })}
                startIcon={<FileDownloadIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Exportar Selección ({hasSelection ? selectedRows.length : 0})
              </Button>
              <Menu
                anchorEl={exportMenuAnchor.selection}
                open={Boolean(exportMenuAnchor.selection)}
                onClose={() => setExportMenuAnchor({ ...exportMenuAnchor, selection: null })}
              >
                <MenuItem
                  onClick={() => {
                    exportToPDF(selectedRows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, selection: null });
                  }}
                >
                  PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToExcel(selectedRows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, selection: null });
                  }}
                >
                  Excel
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    exportToCSV(selectedRows, table);
                    setExportMenuAnchor({ ...exportMenuAnchor, selection: null });
                  }}
                >
                  CSV
                </MenuItem>
              </Menu>
            </>
          )}

          {currentTab === 1 && (
            <>
              <Button
                onClick={exportSystemReportToPDF}
                startIcon={<FileDownloadIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Exportar PDF
              </Button>

              <Button
                onClick={exportSystemReportToExcel}
                startIcon={<FileDownloadIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Exportar Excel
              </Button>

              <Button
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
              >
                Imprimir
              </Button>
            </>
          )}
        </Box>
      );
    },
  });

  return (
    <Box sx={{ p: 1 }}>
      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Tabla Completa" />
        <Tab label="Reporte de Sistemas" />
      </Tabs>

      {currentTab === 0 ? (
        <MaterialReactTable table={table} />
      ) : (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              onClick={exportSystemReportToPDF}
              startIcon={<FileDownloadIcon />}
              variant="contained"
              size="small"
              sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
            >
              Exportar PDF
            </Button>

            <Button
              onClick={exportSystemReportToExcel}
              startIcon={<FileDownloadIcon />}
              variant="contained"
              size="small"
              sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
            >
              Exportar Excel
            </Button>

            <Button
              onClick={handlePrint}
              startIcon={<PrintIcon />}
              variant="contained"
              size="small"
              sx={{ backgroundColor: '#0F284D', '&:hover': { backgroundColor: '#1A3D6D' } }}
            >
              Imprimir
            </Button>
          </Box>

          <Box ref={reportRef}>
            <Box className="report-header">
              <Typography variant="h6" gutterBottom>
                Reporte de Sistemas Desplegados
                {(startDate || endDate) && (
                  <Chip
                    label={
                      startDate && endDate
                        ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
                        : startDate
                        ? `Desde ${format(startDate, 'dd/MM/yyyy')}`
                        : `Hasta ${format(endDate, 'dd/MM/yyyy')}`
                    }
                    size="small"
                    sx={{ ml: 2 }}
                    onDelete={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generado: {formatDateTime(new Date().toISOString())}
              </Typography>
            </Box>

            {systemReport.map((system) => (
              <Box key={system.sistema} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" className="system-title" sx={{ fontWeight: 'bold' }}>
                  {system.sistema}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Despliegue</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Solicitud</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Componente</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Máquina</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Servidor Asociado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Solicitante</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Unidad Solicitante</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Referencia Respaldo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {system.despliegues.map((despliegue, index) => (
                        <TableRow key={index}>
                          <TableCell>{despliegue.fecha_despliegue}</TableCell>
                          <TableCell>{despliegue.fecha_solicitud}</TableCell>
                          <TableCell>{despliegue.componente}</TableCell>
                          <TableCell>{despliegue.maquina}</TableCell>
                          <TableCell>{despliegue.servidor}</TableCell>
                          <TableCell>{despliegue.solicitante}</TableCell>
                          <TableCell>{despliegue.unidad_solicitante}</TableCell>
                          <TableCell>{despliegue.referencia_respaldo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}

            {systemReport.length === 0 && (
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                No hay datos disponibles para el filtro seleccionado
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Dialog open={deleteState.open} onClose={() => setDeleteState({ open: false, id: null })}>
        <DialogTitle>Confirmar Desactivación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de desactivar el despliegue {deleteState.id}? Esta
            acción no eliminará el despliegue de la base de datos, solo cambiará
            su estado a inactivo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => desactivarDespliegue(deleteState.id)}
            color="error"
            variant="contained"
            sx={{ backgroundColor: '#e57373', '&:hover': { backgroundColor: '#ef5350' } }}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesplieguesList;


