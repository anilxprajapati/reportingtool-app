import React, { useState } from 'react';
import { Button, Stack, Alert } from 'react-bootstrap';
import { BsPlus, BsExclamationTriangle } from 'react-icons/bs';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import JoinSegment from './JoinSegment';

interface JoinsTabProps {
  validationFocus?: { tab: string; id: string | null } | null;
}

const JoinsTab: React.FC<JoinsTabProps> = ({ validationFocus }) => {
    const { state, dispatch } = useReportBuilder();
    const currentStep = state.steps[state.currentStepIndex];
    const [showIncompleteJoinAlert, setShowIncompleteJoinAlert] = useState(false);

    const handleAddJoin = () => {
        const lastJoin = currentStep.joins[currentStep.joins.length - 1];
        if (lastJoin && (!lastJoin.toTableId || !lastJoin.fromColumn || !lastJoin.toColumn)) {
            setShowIncompleteJoinAlert(true);
            return;
        }
        setShowIncompleteJoinAlert(false);
        dispatch({ type: 'ADD_JOIN' });
    };
    
    if (state.selectedTables.length < 2) {
        return (
            <Alert variant="warning">
                <Alert.Heading><BsExclamationTriangle className="me-2"/>More Tables Needed</Alert.Heading>
                <p>
                    Joins can only be created when you have two or more tables in your report.
                    Please use the "Add Table" button in the schema sidebar to add another table.
                </p>
            </Alert>
        );
    }

    return (
        <div>
            <p className="text-muted small mb-3">Define how tables are connected. The first join must originate from the primary table.</p>
            
            <Stack gap={3}>
                {currentStep.joins.map((join, index) => (
                    <JoinSegment 
                      key={join.id} 
                      join={join} 
                      index={index}
                      isInvalid={validationFocus?.tab === 'joins' && validationFocus.id === join.id}
                    />
                ))}
            </Stack>

            {currentStep.joins.length === 0 && (
                <div className="p-4 bg-body-tertiary rounded text-center text-muted">
                    No joins defined. Click below to add one.
                </div>
            )}
            
            {showIncompleteJoinAlert && (
                 <Alert variant="danger" onClose={() => setShowIncompleteJoinAlert(false)} dismissible className="mt-3">
                    Please complete all fields in the current join segment before adding a new one.
                 </Alert>
            )}

            <div className="mt-3">
                <Button variant="outline-primary" size="sm" onClick={handleAddJoin}>
                    <BsPlus /> Add Join Segment
                </Button>
            </div>
        </div>
    );
};

export default JoinsTab;