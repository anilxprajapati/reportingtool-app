import React, { useMemo } from 'react';
import { Button, Stack, Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { BsPlus, BsTrash, BsArrowCounterclockwise } from 'react-icons/bs';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import type { Aggregation, AggregationFunction } from '../../../../types';
import StyledSelect from '../../../../components/StyledSelect';
import type { Options } from 'react-select';

type SelectOption = { value: string; label: string };

const AGG_FUNCTIONS: AggregationFunction[] = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
const aggFuncOptions: Options<SelectOption> = AGG_FUNCTIONS.map(f => ({ value: f, label: f }));

const AggregationItem: React.FC<{ agg: Aggregation }> = ({ agg }) => {
    const { state, dispatch } = useReportBuilder();
    const { selectedColumns } = state.steps[state.currentStepIndex];

    const columnOptions: Options<SelectOption> = useMemo(() => 
        selectedColumns.map(c => ({ 
            value: c.id, 
            label: `${c.tableName}.${c.column.name}` 
        })), [selectedColumns]);
    
    const selectedColumnName = selectedColumns.find(c => c.id === agg.columnId)?.column.name || '';

    const handleUpdate = (data: Partial<Aggregation>) => {
        dispatch({ type: 'UPDATE_AGGREGATION', payload: { aggId: agg.id, data } });
    };
    
    const handleSelectChange = (field: keyof Aggregation) => (option: SelectOption | null) => {
        // When column or function changes, auto-update the alias
        const data: Partial<Aggregation> = { [field]: option?.value || '' };
        if (field === 'columnId' || field === 'func') {
            const newFunc = field === 'func' ? option?.value : agg.func;
            const newColName = field === 'columnId' 
                ? selectedColumns.find(c => c.id === option?.value)?.column.name || ''
                : selectedColumnName;
            data.alias = `${newFunc}_of_${newColName}`;
        }
        handleUpdate(data);
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_AGGREGATION', payload: agg.id });
    };

    return (
        <Card bg="body-tertiary">
            <Card.Body className="p-3">
                 <Row className="g-3 align-items-center">
                    <Col md={4}>
                         <Form.Group>
                            <Form.Label className="small">Column</Form.Label>
                            <StyledSelect
                                value={columnOptions.find(o => o.value === agg.columnId)}
                                options={columnOptions}
                                onChange={handleSelectChange('columnId')}
                                placeholder="Select a column..."
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="small">Function</Form.Label>
                            <StyledSelect
                                value={aggFuncOptions.find(o => o.value === agg.func)}
                                options={aggFuncOptions}
                                onChange={handleSelectChange('func')}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                         <Form.Group>
                            <Form.Label className="small">Alias</Form.Label>
                             <InputGroup size="sm">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter alias"
                                    value={agg.alias}
                                    onChange={(e) => handleUpdate({ alias: e.target.value })}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={1} className="d-flex align-items-end justify-content-end">
                        <Button variant="link" className="text-danger" size="sm" onClick={handleRemove}>
                            <BsTrash />
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};


const AggregationsTab: React.FC = () => {
    const { state, dispatch } = useReportBuilder();
    const currentStep = state.steps[state.currentStepIndex];

    const handleAdd = () => {
        dispatch({ type: 'ADD_AGGREGATION' });
    };
    
    const handleReset = () => {
        if (window.confirm('Are you sure you want to remove all aggregations?')) {
            dispatch({ type: 'RESET_AGGREGATIONS' });
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <p className="text-muted small mb-0">Define aggregations to summarize your data. If aggregations are used, only aggregated and grouped columns can be selected in the Fields tab.</p>
                 {currentStep.aggregations.length > 0 && (
                    <Button variant="outline-danger" size="sm" onClick={handleReset} title="Remove all aggregations">
                        <BsArrowCounterclockwise className="me-1"/> Reset Aggregations
                    </Button>
                )}
            </div>
            
            <Stack gap={3}>
                {currentStep.aggregations.map(agg => (
                    <AggregationItem key={agg.id} agg={agg} />
                ))}
            </Stack>

            {currentStep.aggregations.length === 0 && (
                <div className="p-4 bg-body-tertiary rounded text-center text-muted">
                    No aggregations defined.
                </div>
            )}

            <div className="mt-3">
                <Button variant="outline-primary" size="sm" onClick={handleAdd}>
                    <BsPlus /> Add Aggregation
                </Button>
            </div>
        </div>
    );
};

export default AggregationsTab;