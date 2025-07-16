import React, { useState, useMemo } from 'react';
import { Row, Col, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSchemas } from '../../hooks/useSchemas';
import SchemaList from './components/SchemaList';
import TablePreview from './components/TablePreview';
import EmptyPreview from './components/EmptyPreview';
import type { Table, Schema } from '../../../types';
import { useReportBuilder } from '../reportBuilder/context/ReportBuilderContext';

interface SchemaExplorerPageProps {
  theme: string;
}

const SchemaExplorerPage: React.FC<SchemaExplorerPageProps> = ({ theme }) => {
  const navigate = useNavigate();
  const { schemas, loading } = useSchemas();
  const { state: reportState, dispatch } = useReportBuilder();

  const isAddMode = reportState.selectedTables.length > 0;

  const [singleSelectedTable, setSingleSelectedTable] = useState<Table | null>(null);
  const [multiSelectedTables, setMultiSelectedTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const availableSchemas = useMemo(() => {
    if (!isAddMode) return schemas;

    // Filter schemas to only include tables that are related and not already selected
    const selectedTableIds = new Set(reportState.selectedTables.map(t => t.id));
    const existingColumnNames = new Set(
      reportState.selectedTables.flatMap(t => t.columns.map(c => c.name))
    );

    return schemas.map(schema => {
      const filteredTables = schema.tables.filter(table => {
        // Exclude already selected tables
        if (selectedTableIds.has(table.id)) return false;
        // Include tables that have at least one common column name
        return table.columns.some(col => existingColumnNames.has(col.name));
      });
      return { ...schema, tables: filteredTables };
    }).filter(schema => schema.tables.length > 0);
  }, [schemas, isAddMode, reportState.selectedTables]);
  
  const handleSetPrimaryTable = () => {
    if (singleSelectedTable) {
      dispatch({ type: 'SET_PRIMARY_TABLE', payload: singleSelectedTable });
      navigate('/report-builder');
    }
  };

  const handleAddSelectedTables = () => {
    if (multiSelectedTables.length > 0) {
      dispatch({ type: 'ADD_TABLES', payload: multiSelectedTables });
      navigate('/report-builder');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const previewTable = isAddMode ? multiSelectedTables[0] || null : singleSelectedTable;

  return (
    <div className="d-flex flex-column h-100">
      <header className="mb-4">
        <h2>{isAddMode ? 'Add More Tables' : 'Add New Primary Table'}</h2>
        <p className="text-muted">
          {isAddMode 
            ? 'Select one or more related tables to add to your report.'
            : 'You must select one table to be the primary table for your new report.'
          }
        </p>
      </header>

      <Row className="flex-grow-1" style={{ minHeight: 0 }}>
        <Col md={4} className="d-flex flex-column h-100 pb-3">
          <SchemaList
            schemas={availableSchemas}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSingleSelectTable={setSingleSelectedTable}
            onMultiSelectTables={setMultiSelectedTables}
            singleSelectedTable={singleSelectedTable}
            multiSelectedTables={multiSelectedTables}
            isAddMode={isAddMode}
          />
        </Col>

        <Col md={8} className="d-flex flex-column h-100 pb-3">
          {previewTable ? (
            <TablePreview table={previewTable} theme={theme} />
          ) : (
            <EmptyPreview isAddMode={isAddMode} />
          )}
        </Col>
      </Row>

      <footer className="py-3 mt-auto border-top" style={{ background: 'var(--bs-body-bg)' }}>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate(isAddMode ? '/report-builder' : '/folders')}>
            {isAddMode ? 'Back to Builder' : 'Cancel'}
          </Button>
          {isAddMode ? (
             <Button variant="primary" disabled={multiSelectedTables.length === 0} onClick={handleAddSelectedTables}>
                Add Selected Tables
             </Button>
          ) : (
             <Button variant="primary" disabled={!singleSelectedTable} onClick={handleSetPrimaryTable}>
                Add Primary Table
             </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default SchemaExplorerPage;