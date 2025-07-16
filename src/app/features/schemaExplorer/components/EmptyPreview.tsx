import React from 'react';
import { Card } from 'react-bootstrap';
import { BsKey, BsDiagram3 } from 'react-icons/bs';

interface EmptyPreviewProps {
    isAddMode?: boolean;
}

const EmptyPreview: React.FC<EmptyPreviewProps> = ({ isAddMode }) => {
  return (
    <Card className="d-flex flex-column h-100 justify-content-center align-items-center bg-light-subtle">
      <Card.Body className="text-center">
        {isAddMode ? (
            <BsDiagram3 size={60} className="text-muted mb-4" />
        ) : (
            <BsKey size={60} className="text-muted mb-4" />
        )}
        <h4 className="text-muted">
            {isAddMode ? 'Select related tables to preview.' : 'Select a table to see its preview.'}
        </h4>
        <p className="text-muted">
          {isAddMode
            ? 'Choose one or more tables from the list to add them to your report.'
            : 'You must select one table to be the primary table for your new report.'
          }
        </p>
      </Card.Body>
    </Card>
  );
};

export default EmptyPreview;