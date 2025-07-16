import React from 'react';
import { Card, Table as BootstrapTable, Badge } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { BsBox, BsColumnsGap, BsGrid3X3 } from 'react-icons/bs';
import type { Table } from '../../../../types';

interface TablePreviewProps {
  table: Table;
  theme: string;
}

const TablePreview: React.FC<TablePreviewProps> = ({ table, theme }) => {
  const gridContainerClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  const sampleDataColDefs: ColDef[] = table.columns.map(col => ({
    headerName: col.name,
    field: col.name,
    sortable: true,
    filter: true,
    resizable: true,
  }));
  
  return (
    <Card className="d-flex flex-column h-100">
      <Card.Header>
        <h5 className="mb-0">
          Preview of: <span className="text-primary">{table.displayName}</span>
          <Badge bg="info" className="ms-2">{table.name}</Badge>
        </h5>
      </Card.Header>
      <Card.Body className="flex-grow-1" style={{ overflowY: 'auto' }}>
        <Card className="mb-4">
            <Card.Header><BsBox className="me-2"/>Table Details</Card.Header>
            <Card.Body>
                <p><strong>Schema:</strong> {table.name}</p>
                <p><strong>Table Name:</strong> {table.name}</p>
                <p><strong>Display Name:</strong> {table.displayName}</p>
                <p className="mb-0"><strong>Total Rows:</strong> {table.rowCount.toLocaleString()}</p>
            </Card.Body>
        </Card>

        <Card className="mb-4">
            <Card.Header><BsColumnsGap className="me-2"/>Column Structure</Card.Header>
            <BootstrapTable striped bordered hover responsive size="sm" variant={theme}>
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Details</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {table.columns.map(col => (
                        <tr key={col.name}>
                            <td>{col.name}</td>
                            <td><Badge bg="success">{col.dataType}</Badge></td>
                            <td>
                                {col.isPrimaryKey && <Badge bg="primary" className="me-1">PK</Badge>}
                                {col.isForeignKey && <Badge bg="info">FK</Badge>}
                            </td>
                            <td>{col.description}</td>
                        </tr>
                    ))}
                </tbody>
            </BootstrapTable>
        </Card>

        <Card>
            <Card.Header><BsGrid3X3 className="me-2"/>Table Data Preview (Sample)</Card.Header>
             <div className={`${gridContainerClass}`} style={{ height: 300, width: '100%' }}>
                <AgGridReact
                    rowData={table.sampleData}
                    columnDefs={sampleDataColDefs}
                    suppressCellFocus={true}
                />
            </div>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default TablePreview;
