import React from 'react';
import { Card, Form, Badge, ListGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsTable, BsPlusCircle, BsKeyFill, BsTrash, BsDashCircle } from 'react-icons/bs';
import type { Table, Column } from '../../../../types';
import { useReportBuilder } from '../context/ReportBuilderContext';

const getDataTypeIcon = (dataType: string) => {
    switch(dataType) {
        case 'string': return <Badge bg="info" className="fw-normal">Abc</Badge>;
        case 'number': return <Badge bg="success" className="fw-normal">123</Badge>;
        case 'date': return <Badge bg="warning" className="fw-normal">D</Badge>;
        case 'boolean': return <Badge bg="secondary" className="fw-normal">T/F</Badge>;
        default: return null;
    }
}

const DatabaseSchemaSidebar: React.FC = () => {
  const { state, dispatch } = useReportBuilder();
  const navigate = useNavigate();
  
  const currentStep = state.steps[state.currentStepIndex];

  const isColumnSelected = (tableId: string, columnName: string) => {
    return currentStep.selectedColumns.some(c => c.tableId === tableId && c.column.name === columnName);
  }

  const handleColumnToggle = (table: Table, column: Column) => {
    dispatch({ type: 'TOGGLE_COLUMN', payload: { table, column } });
  }

  const handleSelectAll = (table: Table, shouldSelect: boolean) => {
    dispatch({ type: 'SELECT_ALL_COLUMNS', payload: { table, shouldSelect } });
  }
  
  const handleRemoveTable = (tableId: string) => {
    if (window.confirm('Are you sure you want to remove this table and all its related configurations from the report?')) {
      dispatch({ type: 'REMOVE_TABLE', payload: tableId });
    }
  };


  return (
    <Card className="d-flex flex-column h-100">
      <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
        <span>Database Schema</span>
        <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/schema-explorer')}>
            <BsPlusCircle className="me-1"/> Add Table
        </Button>
      </Card.Header>
      <Card.Body className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        {state.selectedTables.map((table, index) => {
          const isPrimary = index === 0;
          const canRemove = !isPrimary || state.selectedTables.length === 1;

          return (
          <Card key={table.id} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center p-2 bg-light-subtle">
                  <div className="fw-bold text-truncate d-flex align-items-center">
                      <BsTable className="me-2"/>
                      {table.displayName}
                      {isPrimary && <Badge bg="primary" className="ms-2 fw-normal">Primary</Badge>}
                  </div>
                  {canRemove && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-danger p-0" 
                      onClick={() => handleRemoveTable(table.id)} 
                      title="Remove Table"
                    >
                        <BsTrash />
                    </Button>
                  )}
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-start align-items-center p-2">
                  <Button variant="link" size="sm" className="text-decoration-none p-0 me-3 small fw-normal" onClick={() => handleSelectAll(table, true)}>
                    <BsPlusCircle className="me-1"/> Select All
                  </Button>
                  <Button variant="link" size="sm" className="text-decoration-none p-0 small fw-normal" onClick={() => handleSelectAll(table, false)}>
                    <BsDashCircle className="me-1"/> Deselect All
                  </Button>
                </ListGroup.Item>
                {table.columns.map(col => (
                    <ListGroup.Item key={col.name} className="d-flex justify-content-between align-items-center p-2">
                        <Form.Check 
                            type="checkbox"
                            id={`col-${table.id}-${col.name}`}
                            label={<span className="text-truncate">{col.name}</span>}
                            checked={isColumnSelected(table.id, col.name)}
                            onChange={() => handleColumnToggle(table, col)}
                        />
                        <div className="d-flex align-items-center">
                           {col.isPrimaryKey && <BsKeyFill title="Primary Key" className="text-warning me-2"/>}
                           {getDataTypeIcon(col.dataType)}
                        </div>
                    </ListGroup.Item>
                ))}
              </ListGroup>
          </Card>
        )})}
      </Card.Body>
    </Card>
  );
};

export default DatabaseSchemaSidebar;