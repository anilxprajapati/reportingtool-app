import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useReportBuilder } from '../../context/ReportBuilderContext';

const OutputTab: React.FC = () => {
    const { state, dispatch } = useReportBuilder();
    const currentStep = state.steps[state.currentStepIndex];

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const limit = value === '' ? null : parseInt(value, 10);
        if (!isNaN(limit as any) || limit === null) {
            dispatch({ type: 'UPDATE_OUTPUT', payload: { limit } });
        }
    };

    const handleDistinctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'UPDATE_OUTPUT', payload: { distinct: e.target.checked } });
    };

    return (
        <div>
            <p className="text-muted small mb-3">Apply final modifications to the report's output.</p>
            <Card bg="body-tertiary">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="limit-rows">
                                <Form.Label>Limit Rows</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 100"
                                    value={currentStep.limit ?? ''}
                                    onChange={handleLimitChange}
                                    min="1"
                                />
                                <Form.Text>
                                    Leave blank for no limit.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex align-items-center mt-auto">
                            <Form.Group controlId="select-distinct">
                                <Form.Check
                                    type="checkbox"
                                    label="Select Distinct Rows"
                                    checked={currentStep.distinct}
                                    onChange={handleDistinctChange}
                                />
                                <Form.Text>
                                     Return only unique rows.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OutputTab;
