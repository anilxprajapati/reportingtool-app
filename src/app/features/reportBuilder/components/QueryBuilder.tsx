import React, { useState, ChangeEvent } from 'react';
import { Card, Tabs, Tab, Button, ButtonGroup, Stack, Form, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { 
    BsLayers, BsPlus, BsChevronLeft, BsArrowRepeat, BsPlayFill,
    BsLayoutTextWindowReverse, BsFunnel, BsFilter, BsLink45Deg,
    BsCollection, BsSortAlphaDown, BsBoxArrowUpRight, BsSave, BsQuestionCircle
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import type { RuleGroupType } from 'react-querybuilder';
import type { Step } from 'react-joyride';

import { useReportBuilder } from '../context/ReportBuilderContext';
import { useReportContext } from '../../../context/ReportContext';
import FieldsTab from './queryBuilder/FieldsTab';
import JoinsTab from './queryBuilder/JoinsTab';
import AggregationsTab from './queryBuilder/AggregationsTab';
import FiltersTab from './queryBuilder/FiltersTab';
import GroupingTab from './queryBuilder/GroupingTab';
import SortTab from './queryBuilder/SortTab';
import OutputTab from './queryBuilder/OutputTab';
import type { Report } from '../../../../types';
import { reportBuilderTourSteps } from '../../../components/AppTour';

const countRules = (group: RuleGroupType): number => {
    if (!group || !group.rules) return 0;
    return group.rules.reduce((acc, rule) => {
      if ('rules' in rule) {
        return acc + countRules(rule);
      }
      return acc + 1;
    }, 0);
};

const hasEmptyFilterValue = (group: RuleGroupType): boolean => {
    return group.rules.some(rule => {
        if ('rules' in rule) {
            return hasEmptyFilterValue(rule);
        }
        // Rules with operators like 'isNull' or 'notNull' don't have a value input.
        if (rule.operator === 'isNull' || rule.operator === 'notNull') {
            return false;
        }
        const { value } = rule;
        // A value is considered empty if it's an empty string, null, or undefined.
        // We explicitly allow boolean `false` and number `0`.
        return value === '' || value === null || typeof value === 'undefined';
    });
};

interface QueryBuilderProps {
  startTour: (steps: Step[], index?: number) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({ startTour }) => {
  const { state, dispatch } = useReportBuilder();
  const { getReportById, addReport, updateReport } = useReportContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('fields');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationFocus, setValidationFocus] = useState<{ tab: string; id: string | null } | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const currentStep = state.steps[state.currentStepIndex];

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire report configuration?')) {
      dispatch({ type: 'RESET_REPORT' });
      navigate('/schema-explorer');
    }
  };

  const handleAddStep = () => dispatch({ type: 'ADD_STEP' });
  const handleSwitchStep = (index: number) => dispatch({ type: 'SWITCH_STEP', payload: index });
  
  const validateAndSave = (runAfterSave: boolean) => {
    setValidationError(null);
    setValidationFocus(null);
    
    if (currentStep.selectedColumns.length === 0) {
      setValidationError("Please select at least one column in the 'Fields' tab to generate a report.");
      setActiveTab('fields');
      setValidationFocus({ tab: 'fields', id: 'fields-placeholder' });
      return;
    }

    if (countRules(currentStep.filtersQuery) > 0 && hasEmptyFilterValue(currentStep.filtersQuery)) {
        setValidationError("One or more filters has an empty value. Please provide a value for all filters or remove them.");
        setActiveTab('filters');
        return;
    }

    for (const join of currentStep.joins) {
        if (!join.fromTableId || !join.toTableId || !join.fromColumn || !join.toColumn) {
            setValidationError('One or more join segments are incomplete. Please fill out all fields for each join.');
            setActiveTab('joins');
            setValidationFocus({ tab: 'joins', id: join.id });
            return;
        }
    }

    if (state.selectedTables.length > 1) {
        const allTableIds = new Set(state.selectedTables.map(t => t.id));
        const connectedTables = new Set<string>([state.selectedTables[0].id]);
        let newConnectionFound = true;

        while (newConnectionFound) {
            newConnectionFound = false;
            for (const join of currentStep.joins) {
                const fromConnected = connectedTables.has(join.fromTableId);
                const toConnected = connectedTables.has(join.toTableId);

                if (fromConnected && !toConnected) {
                    connectedTables.add(join.toTableId);
                    newConnectionFound = true;
                } else if (!fromConnected && toConnected) {
                    connectedTables.add(join.fromTableId);
                    newConnectionFound = true;
                }
            }
        }
        
        if (connectedTables.size !== allTableIds.size) {
            setValidationError('All tables must be connected via joins. Please check the "Joins" tab to ensure there are no isolated tables.');
            setActiveTab('joins');
            setValidationFocus({ tab: 'joins', id: null });
            return;
        }
    }

    setValidationError(null); 
    setValidationFocus(null);

    // Save logic
    const existingReport = state.id ? getReportById(state.id) : null;
    const reportData: Report = {
      id: state.id || `rep-${Date.now()}`,
      reportName: state.reportName || 'Untitled Report',
      folderName: existingReport?.folderName || 'Unsaved Reports', // Default new reports to "Unsaved Reports"
      createdBy: existingReport?.createdBy || 'oidc-client-s',
      createdDate: existingReport?.createdDate || new Date().toLocaleString(),
      modifiedDate: new Date().toLocaleString(),
      config: state,
    };

    if (existingReport) {
      updateReport(reportData);
    } else {
      addReport(reportData);
      // Update builder state with the new ID
      dispatch({ type: 'LOAD_REPORT', payload: reportData });
    }
    
    setShowSaveToast(true);

    if (runAfterSave) {
        console.log('--- REPORT CONFIGURATION ---');
        console.log(JSON.stringify(state, null, 2));
        console.log('--- END REPORT CONFIGURATION ---');
        localStorage.setItem('nexusReportConfig', JSON.stringify(state));
        window.open('/report-output', '_blank');
    }
  };
  
  const handleDismissAlert = () => {
    setValidationError(null);
    setValidationFocus(null);
  };

  return (
    <>
    <Card className="h-100 d-flex flex-column">
      <Card.Header className="p-2 border-bottom-0">
        <div className="d-flex justify-content-between align-items-center" id="report-builder-header">
           <Stack direction="horizontal" gap={2} className="flex-grow-1 me-3 align-items-center">
            <Button variant="link" onClick={() => navigate(-1)} className="text-muted p-0 text-decoration-none">
                <BsChevronLeft size={24}/>
            </Button>
            <Form.Control 
                type="text"
                className="fw-bold fs-5 border-0 shadow-none p-0 bg-transparent"
                value={state.reportName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_REPORT_NAME', payload: e.target.value })}
                aria-label="Report Name"
            />
          </Stack>
          <div>
            <Button variant="outline-info" size="sm" onClick={() => startTour(reportBuilderTourSteps)} className="me-3" title="Take a tour of the report builder">
                <BsQuestionCircle className="me-1" /> Page Tour
            </Button>
            <Button variant="light" size="sm" onClick={handleReset} className="me-2">
                <BsArrowRepeat className="me-1" /> Reset All
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => validateAndSave(false)} className="me-2">
                <BsSave className="me-1" /> Save
            </Button>
            <Button variant="primary" size="sm" onClick={() => validateAndSave(true)} id="tour-step-run-report">
                <BsPlayFill className="me-1" /> Save & Run Report
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body className="p-3 d-flex flex-column flex-grow-1 overflow-y-hidden">
        {validationError && (
          <Alert variant="danger" onClose={handleDismissAlert} dismissible className="mb-3">
            <Alert.Heading as="h6">Validation Error</Alert.Heading>
            <p className="mb-0 small">{validationError}</p>
          </Alert>
        )}

        <Stack direction="horizontal" gap={2} className="align-items-center mb-3" id="query-steps-panel">
            <BsLayers className="me-1" />
            <div className="fw-bold">Query Steps:</div>
            <ButtonGroup size="sm">
                {state.steps.map((step, index) => (
                    <Button
                        key={step.id}
                        variant={state.currentStepIndex === index ? 'primary' : 'outline-primary'}
                        onClick={() => handleSwitchStep(index)}
                    >
                        {step.name}
                    </Button>
                ))}
            </ButtonGroup>
            <Button size="sm" variant="link" onClick={handleAddStep} className="text-decoration-none">
                <BsPlus /> Add Step
            </Button>
        </Stack>

        <Card className="flex-grow-1 d-flex flex-column" style={{minHeight: 0}}>
            <Card.Header className="p-3">
                <h6 className="mb-0">{`Step: ${currentStep.name} - Configuration`}</h6>
            </Card.Header>
            <Card.Body className="p-0 d-flex flex-column">
                <Tabs
                    id="query-builder-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k || 'fields')}
                    className="p-3 flex-shrink-0"
                >
                    <Tab eventKey="fields" title={<><BsLayoutTextWindowReverse className="me-2"/>{`Fields (${currentStep.selectedColumns.length})`}</>} />
                    <Tab eventKey="aggregations" title={<><BsFunnel className="me-2"/>{`Aggregations (${currentStep.aggregations.length})`}</>} />
                    <Tab eventKey="filters" title={<><BsFilter className="me-2"/>{`Filters (WHERE) (${countRules(currentStep.filtersQuery)})`}</>} />
                    <Tab eventKey="joins" title={<><BsLink45Deg className="me-2"/>Joins</>} disabled={state.selectedTables.length < 2} />
                    <Tab eventKey="grouping" title={<><BsCollection className="me-2"/>Grouping & Having</>} />
                    <Tab eventKey="sort" title={<><BsSortAlphaDown className="me-2"/>Sort (Global)</>} />
                    <Tab eventKey="output" title={<><BsBoxArrowUpRight className="me-2"/>Output (Global)</>} />
                </Tabs>
                <div className="flex-grow-1 p-3 border-top" style={{ overflowY: 'auto' }} id="query-tab-content">
                    {activeTab === 'fields' && <FieldsTab validationFocus={validationFocus} />}
                    {activeTab === 'aggregations' && <AggregationsTab />}
                    {activeTab === 'filters' && <FiltersTab />}
                    {activeTab === 'joins' && <JoinsTab validationFocus={validationFocus} />}
                    {activeTab === 'grouping' && <GroupingTab setActiveTab={setActiveTab} />}
                    {activeTab === 'sort' && <SortTab />}
                    {activeTab === 'output' && <OutputTab />}
                </div>
            </Card.Body>
        </Card>
      </Card.Body>
    </Card>
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1056 }}>
        <Toast onClose={() => setShowSaveToast(false)} show={showSaveToast} delay={3000} autohide bg="success">
          <Toast.Header closeButton={false}>
            <strong className="me-auto text-white">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">Report saved successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default QueryBuilder;