import React, { useMemo } from 'react';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import { QueryBuilder as ReactQueryBuilder, Field, RuleGroupType, Translations, RuleType } from 'react-querybuilder';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  BsPlus,
  BsTrash,
  BsCopy,
  BsLockFill,
  BsUnlockFill,
} from 'react-icons/bs';

import {
  BootstrapActionElement,
  BootstrapDragHandle,
  BootstrapNotToggle,
  BootstrapStyledSelector,
  BootstrapValueEditor,
} from './QueryBuilderCustomControls';

const mapDataTypeToField = (dataType: string): Partial<Field> => {
  switch (dataType) {
    case 'number':
      return { inputType: 'number' };
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
      return { inputType: 'text' };
  }
};

const customTranslations: Partial<Translations> = {
    addRule: { label: 'Rule', title: 'Add Rule' },
    addGroup: { label: 'Group', title: 'Add Group' },
    cloneRule: { label: '', title: 'Clone Rule' },
    cloneRuleGroup: { label: '', title: 'Clone Group' },
    removeRule: { label: '', title: 'Remove Rule' },
    removeGroup: { label: '', title: 'Remove Group' },
    lockRule: { label: '', title: 'Lock Rule' },
    lockGroup: { label: '', title: 'Lock Group' },
};

// This validator function is used by React Query Builder to check individual rules.
// If it returns false, the component adds an 'is-invalid' class to the rule's DOM element.
const ruleValidator = (rule: RuleType): boolean => {
    // Operators like 'isNull' and 'notNull' don't have a value, so they are always valid.
    if (rule.operator === 'isNull' || rule.operator === 'notNull') {
        return true;
    }
    
    // For other operators, check if the value is not empty.
    const { value } = rule;
    return value !== '' && value !== null && typeof value !== 'undefined';
};


const FiltersTab: React.FC = () => {
  const { state, dispatch } = useReportBuilder();
  const currentStep = state.steps[state.currentStepIndex];

  const fields: Field[] = useMemo(() => {
    if (state.selectedTables.length === 0) {
        return [{ name: 'placeholder', label: 'Please add tables to the report first', disabled: true }];
    }
    return state.selectedTables.flatMap(table =>
      table.columns.map(column => ({
        name: `${table.id}::${column.name}`, // Composite key
        label: `${table.displayName}.${column.name}`,
        ...mapDataTypeToField(column.dataType),
        validator: ruleValidator,
      }))
    );
  }, [state.selectedTables]);

  const handleQueryChange = (query: RuleGroupType) => {
    dispatch({ type: 'UPDATE_FILTERS_QUERY', payload: query });
  };
  
  const controlElements = {
    addGroupAction: props => <BootstrapActionElement {...props} icon={<BsPlus/>} variant="secondary" />,
    addRuleAction: props => <BootstrapActionElement {...props} icon={<BsPlus/>} />,
    cloneGroupAction: props => <BootstrapActionElement {...props} icon={<BsCopy/>} variant="secondary"/>,
    cloneRuleAction: props => <BootstrapActionElement {...props} icon={<BsCopy/>} variant="secondary"/>,
    combinatorSelector: props => <BootstrapStyledSelector {...props} type="combinator" />,
    fieldSelector: props => <BootstrapStyledSelector {...props} type="field" />,
    notToggle: BootstrapNotToggle,
    operatorSelector: props => <BootstrapStyledSelector {...props} type="operator" />,
    removeGroupAction: props => <BootstrapActionElement {...props} icon={<BsTrash/>} variant="danger"/>,
    removeRuleAction: props => <BootstrapActionElement {...props} icon={<BsTrash/>} variant="danger"/>,
    valueEditor: BootstrapValueEditor,
    dragHandle: BootstrapDragHandle,
    lockRuleAction: props => <BootstrapActionElement {...props} icon={props.level === 0 ? <BsUnlockFill/> : <BsLockFill />} variant="secondary" />,
    lockGroupAction: props => <BootstrapActionElement {...props} icon={props.level === 0 ? <BsUnlockFill/> : <BsLockFill />} variant="secondary" />,
  };

  return (
    <div>
        <p className="text-muted small mb-3">
            Build complex filter conditions using the query builder below. This corresponds to the <code>WHERE</code> clause in SQL.
        </p>
        <DndProvider backend={HTML5Backend}>
            <QueryBuilderBootstrap>
                <ReactQueryBuilder
                    fields={fields}
                    query={currentStep.filtersQuery}
                    onQueryChange={handleQueryChange}
                    controlElements={controlElements}
                    translations={customTranslations}
                    addRuleToNewGroups
                    autoSelectField
                    autoSelectOperator
                    resetOnFieldChange
                    showCombinatorsBetweenRules={false}
                    showNotToggle
                    showCloneButtons
                    showLockButtons
                    controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}
                />
            </QueryBuilderBootstrap>
        </DndProvider>
    </div>
  );
};

export default FiltersTab;
