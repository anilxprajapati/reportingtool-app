import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { BsTrash, BsGripVertical } from 'react-icons/bs';
import type { SelectedColumn } from '../../../../types';
import { useReportBuilder } from '../context/ReportBuilderContext';

interface SelectedFieldItemProps {
    item: SelectedColumn;
    isDragging: boolean;
    dragHandleProps: any;
}

const SelectedFieldItem: React.FC<SelectedFieldItemProps> = ({ item, isDragging, dragHandleProps }) => {
    const { dispatch } = useReportBuilder();
    const [alias, setAlias] = useState(item.alias);

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_COLUMN', payload: item });
    };

    const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAlias(e.target.value);
    };

    const handleAliasBlur = () => {
        if (item.alias !== alias) {
            dispatch({ type: 'UPDATE_COLUMN_ALIAS', payload: { columnId: item.id, alias } });
        }
    };

    return (
        <div 
            className={`d-flex align-items-center p-2 border rounded ${isDragging ? 'opacity-50 bg-primary-subtle' : 'bg-body-tertiary'}`}
        >
            <span {...dragHandleProps} className="me-2 text-muted" style={{ cursor: 'grab' }} >
                <BsGripVertical />
            </span>
            <span className="fw-medium me-2 text-truncate" style={{ minWidth: '200px' }}>
                {item.tableName}.{item.column.name}
            </span>
            <span className="text-muted me-2">AS</span>
            <InputGroup size="sm" style={{ maxWidth: '200px' }}>
                <Form.Control
                    type="text"
                    value={alias}
                    onChange={handleAliasChange}
                    onBlur={handleAliasBlur}
                    aria-label="Field alias"
                />
            </InputGroup>
            <Button variant="link" className="ms-auto text-danger" onClick={handleRemove} title="Remove field">
                <BsTrash />
            </Button>
        </div>
    );
};

export default SelectedFieldItem;
