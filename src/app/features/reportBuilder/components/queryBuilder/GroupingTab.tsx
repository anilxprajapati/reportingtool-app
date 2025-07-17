import React, { useMemo } from 'react';
import { Button, Stack, Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { BsPlus, BsTrash, BsExclamationTriangle } from 'react-icons/bs';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import type { Grouping, Filter, FilterOperator } from '../../../../types';
import StyledSelect from '../../../../components/StyledSelect';
import type { Options } from 'react-select';

type SelectOption = { value: string; label: string };

const FILTER_OPERATORS: FilterOperator[] = ['=', '!=', '>', '<', '>=', '<='];
const operatorOptions: Options<SelectOption> = FILTER_OPERATORS.map(op => ({ value: op, label: op }));


const GroupingItem: React.FC<{ grouping: Grouping }> = ({ grouping }) => {
    const { state, dispatch } = useReportBuilder();
    const { selectedColumns } = state.steps[state.currentStepIndex];

    const columnOptions: Options<SelectOption> = useMemo(() => 
        selectedColumns.map(c => ({ 
            value: c.id, 
            label: `${c.tableName}.${c.column.name}` 
        })), [selectedColumns]);


    const handleUpdate = (columnId: string) => {
        dispatch({ type: 'UPDATE_GROUPING_COLUMN', payload: { groupId: grouping.id, columnId } });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_GROUPING', payload: grouping.id });
    };

    return (
        <Card bg="body-tertiary">
            <Card.Body className="p-3">
                 <Row className="g-3 align-items-center">
                    <Col>
                         <Form.Group>
                            <Form.Label className="small">Group by Column</Form.Label>
                            <StyledSelect
                                value={columnOptions.find(o => o.value === grouping.columnId)}
                                options={columnOptions}
                                onChange={(option: SelectOption | null) => handleUpdate(option?.value || '')}
                                placeholder="Select a column to group by..."
                            />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Button variant="link" className="text-danger" size="sm" onClick={handleRemove}>
                            <BsTrash />
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

const HavingItem: React.FC<{ filter: Filter }> = ({ filter }) => {
    const { state, dispatch } = useReportBuilder();
    const { aggregations, groupings, selectedColumns } = state.steps[state.currentStepIndex];

    // Columns available for HAVING are aggregations with aliases and columns in the GROUP BY clause
    const havingColumnOptions: Options<SelectOption> = useMemo(() => {
        const aggOptions = aggregations
            .filter(agg => agg.alias)
            .map(agg => ({ value: agg.alias, label: `${agg.alias} (Agg)` }));

        const groupingOptions = groupings
            .map(g => selectedColumns.find(sc => sc.id === g.columnId))
            .filter(Boolean)
            .map(col => ({ value: col!.alias, label: `${col!.alias} (Group)` }));
        
        return [...aggOptions, ...groupingOptions];
    }, [aggregations, groupings, selectedColumns]);

    const handleUpdate = (data: Partial<Filter>) => {
        dispatch({ type: 'UPDATE_HAVING', payload: { filterId: filter.id, data } });
    };

    const handleSelectChange = (field: keyof Filter) => (option: SelectOption | null) => {
        handleUpdate({ [field]: option?.value || '' });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_HAVING', payload: filter.id });
    };

    return (
        <Card bg="body-tertiary">
            <Card.Body className="p-3">
                <Row className="g-3 align-items-center">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small">Column</Form.Label>
                            <StyledSelect
                                value={havingColumnOptions.find(o => o.value === filter.columnId)}
                                options={havingColumnOptions}
                                onChange={handleSelectChange('columnId')}
                                placeholder="Select column..."
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="small">Operator</Form.Label>
                            <StyledSelect
                                value={operatorOptions.find(o => o.value === filter.operator)}
                                options={operatorOptions}
                                onChange={handleSelectChange('operator')}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                         <Form.Group>
                            <Form.Label className="small">Value</Form.Label>
                            <Form.Control 
                                size="sm" 
                                type="text"
                                value={filter.value}
                                placeholder={'Enter value'}
                                onChange={e => handleUpdate({ value: e.target.value })}
                            />
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

interface GroupingTabProps {
    setActiveTab: (tab: string) => void;
}

const GroupingTab: React.FC<GroupingTabProps> = ({ setActiveTab }) => {
    const { state, dispatch } = useReportBuilder();
    const currentStep = state.steps[state.currentStepIndex];
    const hasAggregations = currentStep.aggregations.length > 0;

    const handleAddGrouping = () => dispatch({ type: 'ADD_GROUPING' });
    const handleAddHaving = () => dispatch({ type: 'ADD_HAVING' });
    
    return (
        <div>
            <p className="text-muted small mb-3">Group rows that have the same values into summary rows. This is typically used with aggregation functions.</p>
            
            <h5>Group By</h5>
            <Stack gap={3} className="mb-4">
                {currentStep.groupings.map(g => (
                    <GroupingItem key={g.id} grouping={g} />
                ))}
                {currentStep.groupings.length === 0 && (
                    <div className="p-4 bg-body-tertiary rounded text-center text-muted">
                        No grouping defined.
                    </div>
                )}
                 <div className="mt-1">
                    <Button variant="outline-primary" size="sm" onClick={handleAddGrouping}>
                        <BsPlus /> Add Grouping
                    </Button>
                </div>
            </Stack>

            <hr/>

            <h5 className="mt-4">Having</h5>
             <p className="text-muted small mb-3">
                Filter groups after aggregations have been applied. This corresponds to the <code>HAVING</code> clause in SQL.
            </p>
            {!hasAggregations ? (
                <Alert variant="warning">
                    <Alert.Heading as="h6"><BsExclamationTriangle className="me-2"/>Action Required</Alert.Heading>
                    <p className="mb-2">
                        The "Having" clause requires at least one aggregation to be defined.
                    </p>
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-secondary" size="sm" onClick={() => setActiveTab('aggregations')}>
                            Go to Aggregations
                        </Button>
                    </div>
                </Alert>
            ) : (
                <Card>
                    <Card.Body>
                        <Stack gap={3}>
                            {currentStep.having.map(h => (
                                <HavingItem key={h.id} filter={h} />
                            ))}
                            {currentStep.having.length === 0 && (
                                <div className="p-4 bg-body-tertiary rounded text-center text-muted">
                                    No "Having" conditions defined.
                                </div>
                            )}
                            <div className="mt-1">
                                <Button variant="outline-primary" size="sm" onClick={handleAddHaving}>
                                    <BsPlus /> Add Having Condition
                                </Button>
                            </div>
                        </Stack>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default GroupingTab;