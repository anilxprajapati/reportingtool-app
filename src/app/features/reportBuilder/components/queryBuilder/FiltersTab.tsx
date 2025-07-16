import React, { useMemo } from 'react';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import { QueryBuilder as ReactQueryBuilder, Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';

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

const FiltersTab: React.FC = () => {
  const { state, dispatch } = useReportBuilder();
  const currentStep = state.steps[state.currentStepIndex];

  const fields: Field[] = useMemo(() => {
    if (currentStep.selectedColumns.length === 0) {
        return [{ name: 'placeholder', label: 'Please select columns in the Fields tab first', disabled: true }];
    }
    return currentStep.selectedColumns.map(sc => ({
      name: sc.id,
      label: `${sc.tableName}.${sc.column.name}`,
      ...mapDataTypeToField(sc.column.dataType),
    }));
  }, [currentStep.selectedColumns]);

  const handleQueryChange = (query: RuleGroupType) => {
    dispatch({ type: 'UPDATE_FILTERS_QUERY', payload: query });
  };

  return (
    <div>
        <p className="text-muted small mb-3">
            Build complex filter conditions using the query builder below. This corresponds to the <code>WHERE</code> clause in SQL.
        </p>
        <DndProvider backend={HTML5Backend}>
          <QueryBuilderDnD>
            <QueryBuilderBootstrap>
                <ReactQueryBuilder
                    fields={fields}
                    query={currentStep.filtersQuery}
                    onQueryChange={handleQueryChange}
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
          </QueryBuilderDnD>
        </DndProvider>
    </div>
  );
};

export default FiltersTab;