import React from 'react';
import { Button, ButtonGroup, Badge } from 'react-bootstrap';
import { BsPlus, BsFolderPlus } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { Report } from '../../../../types';
import ActionCellRenderer from './ActionCellRenderer';
import { useReportBuilder } from '../../reportBuilder/context/ReportBuilderContext';
import { useReportContext } from '../../../context/ReportContext';

interface ReportTableProps {
  reports: Report[];
  selectedFolderName?: string;
  onCreateFolder: () => void;
  theme: string;
}

/**
 * Displays reports in an AG Grid data table with themes, pagination, and actions.
 */
const ReportTable: React.FC<ReportTableProps> = ({ reports, selectedFolderName, onCreateFolder, theme }) => {
  const navigate = useNavigate();
  const { dispatch: reportBuilderDispatch } = useReportBuilder();
  const { deleteReport } = useReportContext();
  
  const title = selectedFolderName ? `Reports in "${selectedFolderName}"` : 'All Reports';

  const columnDefs: ColDef<Report>[] = [
    { headerName: 'Folder Name', field: 'folderName', sortable: true, filter: true, resizable: true },
    { headerName: 'Report Name', field: 'reportName', sortable: true, filter: true, resizable: true },
    { headerName: 'Created By', field: 'createdBy', sortable: true, filter: true, resizable: true },
    { headerName: 'Created Date', field: 'createdDate', sortable: true, filter: true, resizable: true },
    { headerName: 'Modified Date', field: 'modifiedDate', sortable: true, filter: true, resizable: true },
    { 
      headerName: 'Actions', 
      cellRenderer: ActionCellRenderer,
      cellRendererParams: {
        reportBuilderDispatch,
        deleteReport,
        navigate,
      },
      filter: false,
      sortable: false,
      resizable: false,
      width: 140,
      cellStyle: { textAlign: 'center' }
    },
  ];

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    suppressCellFocus: true,
  };

  const gridContainerClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  const handleCreateReport = () => {
    reportBuilderDispatch({ type: 'RESET_REPORT' });
    navigate('/schema-explorer');
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0 text-truncate">
          {title} <Badge pill bg="primary">{reports.length}</Badge>
        </h5>
        <ButtonGroup>
          <Button variant="primary" className="me-2" onClick={handleCreateReport}>
            <BsPlus className="me-1" size={20} /> Create Report
          </Button>
          <Button variant="outline-secondary" onClick={onCreateFolder}>
            <BsFolderPlus className="me-1" /> Create Folder
          </Button>
        </ButtonGroup>
      </div>

      {/* The flex-grow-1 class makes this div fill the remaining vertical space,
          and AG Grid will automatically contain its scrollbars within this container. */}
      <div className={`${gridContainerClass} flex-grow-1`}>
        <AgGridReact
          rowData={reports}
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          rowSelection="multiple"
        />
      </div>
    </div>
  );
};

export default ReportTable;