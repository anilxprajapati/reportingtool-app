import React from 'react';
import { Button } from 'react-bootstrap';
import { BsPencil, BsTrash, BsPlay } from 'react-icons/bs';
import { ICellRendererParams } from 'ag-grid-community';
import type { Report } from '../../../../types';
import type { NavigateFunction } from 'react-router-dom';

interface ActionCellRendererProps extends ICellRendererParams<Report> {
  reportBuilderDispatch: React.Dispatch<any>;
  deleteReport: (reportId: string) => void;
  navigate: NavigateFunction;
}

/**
 * A custom cell renderer for AG Grid to display action buttons.
 * Receives context functions via `props` from `cellRendererParams`.
 */
const ActionCellRenderer: React.FC<ActionCellRendererProps> = (props) => {
  const { reportBuilderDispatch, deleteReport, navigate, data: report } = props;
    
  const handleEdit = () => {
    if (!report) return;
    console.log('Editing report:', report);
    reportBuilderDispatch({ type: 'LOAD_REPORT', payload: report });
    navigate('/report-builder');
  };
  
  const handleRun = () => {
    if (!report || !report.config) {
        alert('This report has no configuration and cannot be run. Please edit it first.');
        return;
    }
    console.log('Running report:', report);
    sessionStorage.setItem('nexusReportConfig', JSON.stringify(report.config));
    window.open('/report-output', '_blank');
  };

  const handleDelete = () => {
    if (!report) return;
    if (window.confirm(`Are you sure you want to delete the report "${report.reportName}"?`)) {
      console.log('Deleting report:', report);
      deleteReport(report.id);
    }
  };

  return (
    <div>
      <Button variant="outline-primary" title="Edit" onClick={handleEdit} className="me-1" size="sm"><BsPencil /></Button>
      <Button variant="outline-success" title="Run" onClick={handleRun} className="me-1" size="sm" disabled={!report.config}><BsPlay /></Button>
      <Button variant="outline-danger" title="Delete" onClick={handleDelete} size="sm"><BsTrash /></Button>
    </div>
  );
};

export default ActionCellRenderer;
