import React, { useEffect, useMemo } from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';
import type { Join } from '../../../../types';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import StyledSelect from '../../../../components/StyledSelect';
import type { Options } from 'react-select';

type SelectOption = { value: string; label: string };

interface JoinSegmentProps {
    join: Join;
    index: number;
    isInvalid?: boolean;
}

const JoinSegment: React.FC<JoinSegmentProps> = ({ join, index, isInvalid }) => {
    const { state, dispatch } = useReportBuilder();
    const { selectedTables } = state;

    const fromTable = useMemo(() => selectedTables.find(t => t.id === join.fromTableId), [join.fromTableId, selectedTables]);
    const toTable = useMemo(() => selectedTables.find(t => t.id === join.toTableId), [join.toTableId, selectedTables]);

    const tableOptions: Options<SelectOption> = useMemo(() => selectedTables.map(t => ({ value: t.id, label: t.displayName })), [selectedTables]);
    const fromColumnOptions: Options<SelectOption> = useMemo(() => fromTable?.columns.map(c => ({ value: c.name, label: c.name })) || [], [fromTable]);
    const toColumnOptions: Options<SelectOption> = useMemo(() => toTable?.columns.map(c => ({ value: c.name, label: c.name })) || [], [toTable]);
    const joinTypeOptions: Options<SelectOption> = [
        { value: 'INNER', label: 'Inner Join' },
        { value: 'LEFT', label: 'Left Join' },
        { value: 'RIGHT', label: 'Right Join' },
        { value: 'FULL', label: 'Full Join' },
    ];

    // Auto-detect best columns to join on when 'toTable' changes
    useEffect(() => {
        if (fromTable && toTable && !join.fromColumn && !join.toColumn) {
            let bestMatch = { from: '', to: '' };

            // Priority 1: PK/FK match
            for (const fromCol of fromTable.columns) {
                for (const toCol of toTable.columns) {
                    if (fromCol.isPrimaryKey && toCol.name === fromCol.name) {
                        bestMatch = { from: fromCol.name, to: toCol.name };
                        break;
                    }
                    if (toCol.isPrimaryKey && fromCol.name === toCol.name) {
                        bestMatch = { from: fromCol.name, to: toCol.name };
                        break;
                    }
                }
                if (bestMatch.from) break;
            }

            // Priority 2: Common column names (if no PK/FK match)
            if (!bestMatch.from) {
                const fromColNames = new Set(fromTable.columns.map(c => c.name));
                for (const toCol of toTable.columns) {
                    if (fromColNames.has(toCol.name)) {
                        bestMatch = { from: toCol.name, to: toCol.name };
                        break;
                    }
                }
            }

            if (bestMatch.from && bestMatch.to) {
                dispatch({ type: 'UPDATE_JOIN', payload: { joinId: join.id, joinData: { fromColumn: bestMatch.from, toColumn: bestMatch.to } } });
            }
        }
    }, [fromTable, toTable, join.id, join.fromColumn, join.toColumn, dispatch]);

    const handleUpdate = (joinData: Partial<Join>) => {
        // If table changes, reset column selections
        if (joinData.fromTableId) joinData.fromColumn = '';
        if (joinData.toTableId) joinData.toColumn = '';
        dispatch({ type: 'UPDATE_JOIN', payload: { joinId: join.id, joinData } });
    };

    const handleSelectChange = (field: keyof Join) => (option: SelectOption | null) => {
        handleUpdate({ [field]: option?.value || '' });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_JOIN', payload: join.id });
    };

    return (
        <Card className={`bg-body-tertiary ${isInvalid ? 'border border-danger border-2' : ''}`}>
            <Card.Body className="p-3">
                <Row className="g-3 mb-3">
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label className="small">From Table:</Form.Label>
                            <StyledSelect
                                value={tableOptions.find(o => o.value === join.fromTableId)}
                                options={tableOptions}
                                onChange={handleSelectChange('fromTableId')}
                                placeholder="Select From Table..."
                                isDisabled={index === 0}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label className="small">Join Type:</Form.Label>
                             <StyledSelect
                                value={joinTypeOptions.find(o => o.value === join.type)}
                                options={joinTypeOptions}
                                onChange={handleSelectChange('type')}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label className="small">To Table:</Form.Label>
                            <StyledSelect
                                value={tableOptions.find(o => o.value === join.toTableId)}
                                options={tableOptions.filter(o => o.value !== join.fromTableId)}
                                onChange={handleSelectChange('toTableId')}
                                placeholder="Select To Table..."
                                isDisabled={!join.fromTableId}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-3">
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label className="small">Column (from {fromTable?.displayName || '...'}):</Form.Label>
                            <StyledSelect
                                value={fromColumnOptions.find(o => o.value === join.fromColumn)}
                                options={fromColumnOptions}
                                onChange={handleSelectChange('fromColumn')}
                                placeholder="Select column..."
                                isDisabled={!fromTable}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={5} className="offset-md-2">
                        <Form.Group>
                            <Form.Label className="small">Column (to {toTable?.displayName || '...'}):</Form.Label>
                             <StyledSelect
                                value={toColumnOptions.find(o => o.value === join.toColumn)}
                                options={toColumnOptions}
                                onChange={handleSelectChange('toColumn')}
                                placeholder="Select column..."
                                isDisabled={!toTable}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                 <div className="text-end mt-2">
                    <Button variant="link" size="sm" className="text-danger text-decoration-none" onClick={handleRemove}>
                        <BsTrash className="me-1" /> Remove Segment
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default JoinSegment;