import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { BsFileEarmarkExcel, BsSave } from 'react-icons/bs';
import type { Report, ReportBuilderState, QueryStep, SelectedColumn, Aggregation, Folder } from '../../../types';
import { useReportContext } from '../../context/ReportContext';
import { useFolders } from '../../hooks/useFolders';
import SaveReportModal from './components/SaveReportModal';

interface ReportOutputPageProps {
  theme: string;
}

const ReportOutputPage: React.FC<ReportOutputPageProps> = ({ theme }) => {
  const [reportState, setReportState] = useState<ReportBuilderState | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  
  const { getReportById, updateReport } = useReportContext();
  const { folders } = useFolders();

  useEffect(() => {
    try {
      const configStr = sessionStorage.getItem('nexusReportConfig');
      if (configStr) {
        const parsedConfig: ReportBuilderState = JSON.parse(configStr);
        setReportState(parsedConfig);
        if (parsedConfig.id) {
          const report = getReportById(parsedConfig.id);
          setCurrentReport(report || null);
        } else {
             // This case handles running a report that has never been saved
             setCurrentReport({
                 id: '', // Will be generated on save
                 reportName: parsedConfig.reportName,
                 folderName: 'Unsaved Reports',
                 createdBy: 'oidc-client-s',
                 createdDate: new Date().toLocaleString(),
                 modifiedDate: new Date().toLocaleString(),
                 config: parsedConfig
             });
        }

      } else {
        setError('No report configuration found. Please generate a report from the builder.');
      }
    } catch (e) {
      setError('Failed to parse report configuration. The data might be corrupted.');
      console.error(e);
    }
  }, [getReportById]);

  const { columnDefs, rowData } = useMemo(() => {
    if (!reportState) return { columnDefs: [], rowData: [] };
    
    const currentStep = reportState.steps[reportState.currentStepIndex];
    
    let colDefs: ColDef[];
    if (currentStep.aggregations.length > 0) {
      const groupingCols = currentStep.groupings
        .map(g => currentStep.selectedColumns.find(sc => sc.id === g.columnId))
        .filter((c): c is SelectedColumn => !!c)
        .map(c => ({ headerName: c.alias, field: c.column.name, sortable: true, filter: true, resizable: true }));

      const aggCols = currentStep.aggregations
        .map(a => ({ headerName: a.alias, field: a.alias, sortable: true, filter: true, resizable: true }));
      
      colDefs = [...groupingCols, ...aggCols];
    } else {
      colDefs = currentStep.selectedColumns.map(col => ({
        headerName: col.alias,
        field: col.column.name,
        sortable: true,
        filter: true,
        resizable: true,
      }));
    }

    const primaryTable = reportState.selectedTables[0];
    let data = primaryTable?.sampleData || [];

    if (currentStep.limit && currentStep.limit > 0) {
        data = data.slice(0, currentStep.limit);
    }

    return { columnDefs: colDefs, rowData: data };
  }, [reportState]);

  const onGridReady = (params: GridReadyEvent) => {
    gridApiRef.current = params.api;
  };
  
  const handleExport = () => {
    gridApiRef.current?.exportDataAsCsv({
      fileName: `${reportState?.reportName || 'report'}.csv`
    });
  };

  const handleSave = (saveData: { reportName: string, folderId: string }) => {
    if (!currentReport) return;
    const targetFolder = folders.find(f => f.id === saveData.folderId || f.children?.some(c => c.id === saveData.folderId));
    const folderName = targetFolder?.children?.find(c => c.id === saveData.folderId)?.name ?? targetFolder?.name ?? 'Unfiled';

    const updatedReport: Report = {
        ...currentReport,
        reportName: saveData.reportName,
        folderName: folderName,
        modifiedDate: new Date().toLocaleString(),
    };
    updateReport(updatedReport);
    setCurrentReport(updatedReport);
    setShowSaveModal(false);
  };

  const gridContainerClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!reportState || !currentReport) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Report...</span>
        </Spinner>
      </div>
    );
  }
  
  return (
    <>
    <Container fluid className="h-100 d-flex flex-column py-3">
        <Card className="d-flex flex-column flex-grow-1">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="mb-0 text-truncate">{reportState.reportName}</h4>
                    <div>
                        <Button variant="outline-primary" size="sm" onClick={() => setShowSaveModal(true)} className="me-2">
                            <BsSave className="me-2"/>
                            Save Report
                        </Button>
                        <Button variant="success" size="sm" onClick={handleExport}>
                            <BsFileEarmarkExcel className="me-2"/>
                            Export to Excel (CSV)
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Body className="p-0 flex-grow-1">
                 <div className={`${gridContainerClass} h-100 w-100`}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        onGridReady={onGridReady}
                        pagination={true}
                        paginationPageSize={50}
                    />
                </div>
            </Card.Body>
        </Card>
    </Container>
    {currentReport && (
      <SaveReportModal
          show={showSaveModal}
          onHide={() => setShowSaveModal(false)}
          onSave={handleSave}
          report={currentReport}
          folders={folders}
        />
    )}
    </>
  );
};

export default ReportOutputPage;