import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import type { Report } from '../../../../types';
import ActionCellRenderer from '../../folderList/components/ActionCellRenderer';
import { useReportBuilder } from '../../reportBuilder/context/ReportBuilderContext';
import { useReportContext } from '../../../context/ReportContext';

interface RecentReportsTableProps {
  reports: Report[];
  theme: string;
}

const RecentReportsTable: React.FC<RecentReportsTableProps> = ({ reports, theme }) => {
    const navigate = useNavigate();
    const { dispatch: reportBuilderDispatch } = useReportBuilder();
    const { deleteReport } = useReportContext();

    const columnDefs: ColDef<Report>[] = [
        { headerName: 'Report Name', field: 'reportName', sortable: true, filter: true, resizable: true, flex: 2 },
        { headerName: 'Folder Name', field: 'folderName', sortable: true, filter: true, resizable: true, flex: 1 },
        { headerName: 'Modified Date', field: 'modifiedDate', sortable: true, filter: true, resizable: true, flex: 1 },
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
        suppressCellFocus: true,
        domLayout: 'autoHeight' as 'autoHeight',
    };

    const gridContainerClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    return (
        <div className={`${gridContainerClass} flex-grow-1`}>
            <AgGridReact
                rowData={reports}
                columnDefs={columnDefs}
                gridOptions={gridOptions}
            />
        </div>
    );
};

export default RecentReportsTable;