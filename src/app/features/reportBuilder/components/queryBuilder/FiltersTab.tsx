import React, { useMemo, useState } from 'react';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import {
  QueryBuilder as ReactQueryBuilder,
  Field,
  RuleGroupType,
  formatQuery,
  ActionProps,
} from 'react-querybuilder';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import { Card, Button, Modal, Stack } from 'react-bootstrap';
import { 
    BsArrowCounterclockwise, BsGear, BsTrash, BsCopy, BsLockFill, BsUnlockFill
} from 'react-icons/bs';
import { queryValidator } from '../../utils/queryBuilderUtils';
import { OptionsPanel } from './OptionsPanel';
import { initialOptions } from './queryBuilderConstants';
import type { QueryBuilderOptions } from './types';

const mapDataTypeToField = (dataType: string): Partial<Field> => {
  switch (dataType) {
    case 'number':
      return { inputType: 'number', placeholder: '123' };
    case 'date':
      return { inputType: 'date' };
    case 'boolean':
      return {
        valueEditorType: 'checkbox',
        operators: [{ name: '=', label: 'is' }],
        defaultValue: false,
      };
    case 'string':
    default:
      return { inputType: 'text', placeholder: 'Enter value' };
  }
};

interface QueryBuilderOptionsModalProps {
    show: boolean;
    onHide: () => void;
    options: QueryBuilderOptions;
    setOptions: React.Dispatch<React.SetStateAction<QueryBuilderOptions>>;
}

const QueryBuilderOptionsModal: React.FC<QueryBuilderOptionsModalProps> = ({ show, onHide, options, setOptions }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Query Builder Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small mb-4">
                    Customize the behavior and appearance of the query builder.
                </p>
                <OptionsPanel options={options} setOptions={setOptions} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>
                    Done
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// --- Custom Action Components with Icons ---
const CustomRemoveAction = (props: ActionProps) => (
  <Button variant="link" className="text-danger" title={props.title} onClick={props.handleOnClick} disabled={props.disabled}>
    <BsTrash />
  </Button>
);

const CustomCloneAction = (props: ActionProps) => (
  <Button variant="link" className="text-secondary" title={props.title} onClick={props.handleOnClick} disabled={props.disabled}>
    <BsCopy />
  </Button>
);

const CustomLockAction = (props: ActionProps) => (
  <Button variant="link" className="text-secondary" title={props.title} onClick={props.handleOnClick}>
    {/* The `disabled` prop on ActionProps for lock actions indicates the locked status. */}
    {/* We don't disable the button itself, so it can be clicked to unlock. */}
    {props.disabled ? <BsUnlockFill /> : <BsLockFill />}
  </Button>
);


const FiltersTab: React.FC = () => {
  const { state, dispatch } = useReportBuilder();
  const currentStep = state.steps[state.currentStepIndex];

  const [options, setOptions] = useState<QueryBuilderOptions>(initialOptions);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const fields: Field[] = useMemo(() => {
    if (state.selectedTables.length === 0) {
        return [{ name: 'placeholder', label: 'Please add tables to the report first', disabled: true }];
    }
    return state.selectedTables.flatMap(table =>
      table.columns.map(column => ({
        name: `${table.id}::${column.name}`, // Composite key
        label: `${table.displayName}.${column.name}`,
        ...mapDataTypeToField(column.dataType),
      }))
    );
  }, [state.selectedTables]);

  const handleQueryChange = (query: RuleGroupType) => {
    dispatch({ type: 'UPDATE_FILTERS_QUERY', payload: query });
  };
  
  const handleResetFilters = () => {
    if (window.confirm('Are you sure you want to reset all filters in this step?')) {
        dispatch({ type: 'RESET_FILTERS' });
    }
  };

  const customControlElements = {
    removeRuleAction: CustomRemoveAction,
    removeGroupAction: CustomRemoveAction,
    cloneRuleAction: CustomCloneAction,
    cloneGroupAction: CustomCloneAction,
    lockRuleAction: CustomLockAction,
    lockGroupAction: CustomLockAction,
  };

  const preStyle: React.CSSProperties = {
      backgroundColor: 'var(--bs-tertiary-bg)',
      color: 'var(--bs-body-color)',
      padding: '1rem',
      borderRadius: 'var(--bs-border-radius)',
      maxHeight: '400px', 
      overflowY: 'auto'
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted small mb-0">
              Build complex filter conditions using the query builder below. This corresponds to the <code>WHERE</code> clause in SQL.
          </p>
          <Stack direction="horizontal" gap={2}>
              <Button variant="outline-secondary" size="sm" onClick={() => setShowOptionsModal(true)} title="Query Builder Options">
                  <BsGear className="me-1" /> Options
              </Button>
              {currentStep.filtersQuery.rules.length > 0 && (
                  <Button variant="outline-danger" size="sm" onClick={handleResetFilters} title="Reset all filters">
                      <BsArrowCounterclockwise className="me-1" /> Reset Filters
                  </Button>
              )}
          </Stack>
      </div>
      <Card className="mb-3">
        <Card.Body>
          <QueryBuilderBootstrap>
            <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
                <ReactQueryBuilder
                    fields={fields}
                    query={currentStep.filtersQuery}
                    onQueryChange={handleQueryChange}
                    controlElements={customControlElements}
                    validator={options.useValidation ? queryValidator : undefined}
                    addRuleToNewGroups={options.addRuleToNewGroups}
                    autoSelectField={options.autoSelectField}
                    autoSelectOperator={options.autoSelectOperator}
                    showCombinatorsBetweenRules={options.showCombinatorsBetweenRules}
                    disabled={options.disabled}
                    enableDragAndDrop={options.enableDragAndDrop}
                    independentCombinators={options.independentCombinators}
                    listsAsArrays={options.listsAsArrays}
                    parseNumbers={options.parseNumbers}
                    resetOnFieldChange={options.resetOnFieldChange}
                    resetOnOperatorChange={options.resetOnOperatorChange}
                    showNotToggle={options.showNotToggle}
                    showCloneButtons={options.showCloneButtons}
                    showLockButtons={options.showLockButtons}
                    showShiftActions={options.showShiftActions}
                    suppressStandardClassnames={options.suppressStandardClassnames}
                />
            </QueryBuilderDnD>
          </QueryBuilderBootstrap>
        </Card.Body>
      </Card>

      {options.debugMode && (
        <Card>
          <Card.Header>Formatted Query</Card.Header>
          <Card.Body>
            <pre style={preStyle}>
                <code>{formatQuery(currentStep.filtersQuery, 'json_without_ids')}</code>
            </pre>
          </Card.Body>
        </Card>
      )}

      <QueryBuilderOptionsModal 
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        options={options}
        setOptions={setOptions}
      />
    </>
  );
};

export default FiltersTab;