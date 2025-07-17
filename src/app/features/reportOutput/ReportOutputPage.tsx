import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Card, Spinner, Alert, Button, Toast, ToastContainer } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { BsFileEarmarkExcel, BsSave, BsQuestionCircle } from 'react-icons/bs';
import type { Step } from 'react-joyride';
import type { Report, ReportBuilderState, QueryStep, SelectedColumn, Aggregation, Folder, Filter } from '../../../types';
import { useReportContext } from '../../context/ReportContext';
import { useFolders } from '../../hooks/useFolders';
import SaveReportModal from './components/SaveReportModal';
import { reportOutputTourSteps } from '../../components/AppTour';

interface ReportOutputPageProps {
  theme: string;
  startTour: (steps: Step[], index?: number) => void;
}

// Simple evaluator for a single "Having" filter condition
const evaluateHavingCondition = (row: Record<string, any>, filter: Filter): boolean => {
    const { columnId, operator, value } = filter;
    const rowValue = row[columnId]; // In HAVING, columnId is the alias

    if (rowValue === undefined) return false;

    const numericValue = parseFloat(value);
    const numericRowValue = parseFloat(rowValue);

    switch (operator) {
        case '=': return numericRowValue === numericValue;
        case '!=': return numericRowValue !== numericValue;
        case '>': return numericRowValue > numericValue;
        case '<': return numericRowValue < numericValue;
        case '>=': return numericRowValue >= numericValue;
        case '<=': return numericRowValue <= numericValue;
        default: return false;
    }
};

const ReportOutputPage: React.FC<ReportOutputPageProps> = ({ theme, startTour }) => {
  const [reportState, setReportState] = useState<ReportBuilderState | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const gridApiRef = useRef<GridApi | null>(null);
  
  const { getReportById, addReport, updateReport } = useReportContext();
  const { folders } = useFolders();

  useEffect(() => {
    try {
      const configStr = localStorage.getItem('nexusReportConfig');
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
                 reportName: parsedConfig.reportName || 'Untitled Report',
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
    const primaryTable = reportState.selectedTables[0];
    let data = primaryTable?.sampleData || [];
    let colDefs: ColDef[];

    // --- AGGREGATION & GROUPING LOGIC ---
    if (currentStep.aggregations.length > 0) {
        const groupingCols = currentStep.groupings
            .map(g => currentStep.selectedColumns.find(sc => sc.id === g.columnId))
            .filter((c): c is SelectedColumn => !!c);

        if (groupingCols.length > 0) {
            const groupedData: Record<string, any[]> = {};
            data.forEach(row => {
                const groupKey = JSON.stringify(groupingCols.map(gc => row[gc.column.name]));
                if (!groupedData[groupKey]) {
                    groupedData[groupKey] = [];
                }
                groupedData[groupKey].push(row);
            });

            let aggregatedData = Object.entries(groupedData).map(([key, groupRows]) => {
                const groupValues = JSON.parse(key);
                const resultRow: Record<string, any> = {};

                groupingCols.forEach((gc, index) => {
                    resultRow[gc.alias] = groupValues[index];
                });

                currentStep.aggregations.forEach(agg => {
                    const colToAgg = currentStep.selectedColumns.find(sc => sc.id === agg.columnId);
                    if (!colToAgg) return;

                    switch (agg.func) {
                        case 'COUNT':
                            resultRow[agg.alias] = groupRows.length;
                            break;
                        case 'SUM':
                            resultRow[agg.alias] = groupRows.reduce((sum, r) => sum + (Number(r[colToAgg.column.name]) || 0), 0);
                            break;
                        // Simplified AVG, MIN, MAX for demo
                        case 'AVG':
                             const sum = groupRows.reduce((s, r) => s + (Number(r[colToAgg.column.name]) || 0), 0);
                             resultRow[agg.alias] = groupRows.length > 0 ? sum / groupRows.length : 0;
                             break;
                        case 'MIN':
                            resultRow[agg.alias] = Math.min(...groupRows.map(r => Number(r[colToAgg.column.name]) || 0));
                            break;
                        case 'MAX':
                             resultRow[agg.alias] = Math.max(...groupRows.map(r => Number(r[colToAgg.column.name]) || 0));
                             break;
                    }
                });
                return resultRow;
            });
            
            // --- HAVING CLAUSE FILTERING ---
            if (currentStep.having.length > 0) {
                aggregatedData = aggregatedData.filter(row => {
                    return currentStep.having.every(condition => evaluateHavingCondition(row, condition))
                });
            }

            data = aggregatedData;
        }

        // Define columns for aggregated view
        const groupingColDefs = groupingCols.map(c => ({ headerName: c.alias, field: c.alias, sortable: true, filter: true, resizable: true }));
        const aggColDefs = currentStep.aggregations.map(a => ({ headerName: a.alias, field: a.alias, sortable: true, filter: true, resizable: true }));
        colDefs = [...groupingColDefs, ...aggColDefs];

    } else {
       // Default non-aggregated view
       colDefs = currentStep.selectedColumns.map(col => ({
            headerName: col.alias,
            field: col.column.name,
            sortable: true,
            filter: true,
            resizable: true,
        }));
    }

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
    if (!reportState) return;
  
    const findFolder = (folderId: string): Folder | undefined => {
      let found;
      const search = (folder: Folder) => {
        if (folder.id === folderId) {
          found = folder;
          return true;
        }
        return folder.children?.some(search);
      };
      folders.some(search);
      return found;
    };
    
    const targetFolder = findFolder(saveData.folderId);
    const folderName = targetFolder?.name || 'Unsaved Reports';
  
    if (currentReport && currentReport.id) {
      // Logic for UPDATING an existing report
      const updatedReportState = { ...reportState, reportName: saveData.reportName };
      const updatedReport: Report = {
        ...currentReport,
        reportName: saveData.reportName,
        folderName: folderName,
        modifiedDate: new Date().toLocaleString(),
        config: updatedReportState,
      };
      
      updateReport(updatedReport);
      localStorage.setItem('nexusReportConfig', JSON.stringify(updatedReportState));
      setCurrentReport(updatedReport);
      setReportState(updatedReportState);
  
    } else {
      // Logic for CREATING a new report
      const newId = `rep-${Date.now()}`;
      const newReportStateWithId: ReportBuilderState = { 
        ...reportState, 
        id: newId, 
        reportName: saveData.reportName 
      };
  
      const newReport: Report = {
        id: newId,
        reportName: saveData.reportName,
        folderName: folderName,
        createdBy: 'oidc-client-s',
        createdDate: new Date().toLocaleString(),
        modifiedDate: new Date().toLocaleString(),
        config: newReportStateWithId,
      };
  
      addReport(newReport);
      localStorage.setItem('nexusReportConfig', JSON.stringify(newReportStateWithId));
      setReportState(newReportStateWithId);
      setCurrentReport(newReport);
    }
    
    setShowSaveModal(false);
    setShowSaveToast(true);
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
                    <h4 id="tour-step-output-header" className="mb-0 text-truncate">{currentReport.reportName}</h4>
                    <div>
                        <Button variant="outline-info" size="sm" onClick={() => startTour(reportOutputTourSteps)} className="me-2" title="Take a tour of this page">
                            <BsQuestionCircle className="me-1" /> Page Tour
                        </Button>
                        <Button id="tour-step-output-save" variant="outline-primary" size="sm" onClick={() => setShowSaveModal(true)} className="me-2">
                            <BsSave className="me-2"/>
                            Save Report
                        </Button>
                        <Button id="tour-step-output-export" variant="success" size="sm" onClick={handleExport}>
                            <BsFileEarmarkExcel className="me-2"/>
                            Export to Excel (CSV)
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Body className="p-0 flex-grow-1">
                 <div id="report-output-grid" className={`${gridContainerClass} h-100 w-100`}>
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
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1056 }}>
        <Toast onClose={() => setShowSaveToast(false)} show={showSaveToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>Report saved successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ReportOutputPage;