import React from 'react';
import { Card, Form, InputGroup, ListGroup, Accordion, Badge } from 'react-bootstrap';
import { BsSearch, BsTable } from 'react-icons/bs';
import type { Schema, Table } from '../../../../types';

interface SchemaListProps {
  schemas: Schema[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  singleSelectedTable: Table | null;
  multiSelectedTables: Table[];
  onSingleSelectTable: (table: Table) => void;
  onMultiSelectTables: (tables: Table[]) => void;
  isAddMode: boolean;
}

const SchemaList: React.FC<SchemaListProps> = ({
  schemas,
  searchQuery,
  onSearchQueryChange,
  singleSelectedTable,
  multiSelectedTables,
  onSingleSelectTable,
  onMultiSelectTables,
  isAddMode,
}) => {
  const handleMultiSelectToggle = (table: Table) => {
    const isSelected = multiSelectedTables.some(t => t.id === table.id);
    if (isSelected) {
      onMultiSelectTables(multiSelectedTables.filter(t => t.id !== table.id));
    } else {
      onMultiSelectTables([...multiSelectedTables, table]);
    }
  };

  const filteredSchemas = schemas
    .map(schema => {
      const filteredTables = schema.tables.filter(table =>
        table.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schema.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...schema, tables: filteredTables };
    })
    .filter(schema => schema.tables.length > 0);

  return (
    <Card className="d-flex flex-column h-100">
      <Card.Header className="p-3">
        <InputGroup>
          <Form.Control
            placeholder="Search schemas or tables..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
          <InputGroup.Text><BsSearch /></InputGroup.Text>
        </InputGroup>
      </Card.Header>
      <Card.Body className="flex-grow-1" style={{ overflowY: 'auto' }}>
        <Accordion defaultActiveKey={schemas.map(s => s.id)} alwaysOpen>
          {filteredSchemas.map(schema => (
            <Accordion.Item eventKey={schema.id} key={schema.id}>
              <Accordion.Header>{schema.name}</Accordion.Header>
              <Accordion.Body className="p-0">
                <ListGroup variant="flush">
                  {schema.tables.map(table => (
                    <ListGroup.Item
                      key={table.id}
                      action={!isAddMode}
                      active={!isAddMode && singleSelectedTable?.id === table.id}
                      onClick={!isAddMode ? () => onSingleSelectTable(table) : undefined}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {isAddMode ? (
                        <Form.Check
                          type="checkbox"
                          id={`multiselect-${table.id}`}
                          label={
                            <span className="text-truncate ms-2">
                              <BsTable className="me-2" />
                              {table.displayName}
                            </span>
                          }
                          checked={multiSelectedTables.some(t => t.id === table.id)}
                          onChange={() => handleMultiSelectToggle(table)}
                        />
                      ) : (
                        <span className="text-truncate">
                          <BsTable className="me-2" />
                          {table.displayName}
                        </span>
                      )}
                      
                      <Badge bg="secondary" pill>
                        {table.rowCount.toLocaleString()}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default SchemaList;