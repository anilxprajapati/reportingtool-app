import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import type { ReportBuilderState, Table, Column, SelectedColumn, QueryStep, Join, Aggregation, Filter, Grouping, Sort, Report } from '../../../../types';
import type { RuleGroupType, RuleType } from 'react-querybuilder';

// --- Helper Functions ---
const createNewColumn = (table: Table, column: Column): SelectedColumn => {
    const baseAlias = column.name;
    return {
        id: `${table.id}-${column.name}-${Date.now()}`,
        tableId: table.id,
        tableName: table.displayName,
        column,
        alias: baseAlias,
    };
};

const createNewStep = (name: string): QueryStep => ({
    id: `step-${Date.now()}`,
    name,
    selectedColumns: [],
    joins: [],
    aggregations: [],
    filtersQuery: { combinator: 'and', rules: [] },
    groupings: [],
    having: [],
    sorts: [],
    limit: null,
    distinct: false,
});

// A recursive function to remove filter rules associated with a table
const cleanQueryByTable = (group: RuleGroupType, tableIdToRemove: string): RuleGroupType => {
  const rules = group.rules
    .map(rule => {
      if ('rules' in rule) {
        const cleanedGroup = cleanQueryByTable(rule, tableIdToRemove);
        // Don't keep empty groups
        return cleanedGroup.rules.length > 0 ? cleanedGroup : null;
      }
      // field is 'table.id::column.name'
      if (typeof rule.field === 'string' && rule.field.startsWith(`${tableIdToRemove}::`)) {
          return null;
      }
      return rule;
    })
    .filter((r): r is RuleGroupType | RuleType => r !== null);

  return { ...group, rules };
};


// --- State and Actions ---

type Action =
  | { type: 'LOAD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT_NAME'; payload: string }
  | { type: 'SET_PRIMARY_TABLE'; payload: Table }
  | { type: 'ADD_TABLES'; payload: Table[] }
  | { type: 'REMOVE_TABLE'; payload: string }
  | { type: 'TOGGLE_COLUMN'; payload: { table: Table; column: Column } }
  | { type: 'SELECT_ALL_COLUMNS'; payload: { table: Table; shouldSelect: boolean } }
  | { type: 'REMOVE_COLUMN'; payload: SelectedColumn }
  | { type: 'RESET_REPORT' }
  | { type: 'ADD_STEP' }
  | { type: 'SWITCH_STEP'; payload: number }
  | { type: 'REORDER_COLUMNS'; payload: SelectedColumn[] }
  | { type: 'UPDATE_COLUMN_ALIAS'; payload: { columnId: string; alias: string } }
  | { type: 'ADD_JOIN' }
  | { type: 'UPDATE_JOIN'; payload: { joinId: string; joinData: Partial<Join> } }
  | { type: 'REMOVE_JOIN'; payload: string }
  | { type: 'ADD_AGGREGATION' }
  | { type: 'UPDATE_AGGREGATION'; payload: { aggId: string, data: Partial<Aggregation> } }
  | { type: 'REMOVE_AGGREGATION'; payload: string }
  | { type: 'UPDATE_FILTERS_QUERY'; payload: RuleGroupType }
  | { type: 'ADD_HAVING' }
  | { type: 'UPDATE_HAVING'; payload: { filterId: string, data: Partial<Filter> } }
  | { type: 'REMOVE_HAVING'; payload: string }
  | { type: 'ADD_GROUPING' }
  | { type: 'REMOVE_GROUPING'; payload: string }
  | { type: 'UPDATE_GROUPING_COLUMN'; payload: { groupId: string, columnId: string } }
  | { type: 'ADD_SORT' }
  | { type: 'UPDATE_SORT'; payload: { sortId: string, data: Partial<Sort> } }
  | { type: 'REMOVE_SORT'; payload: string }
  | { type: 'REORDER_SORTS'; payload: Sort[] }
  | { type: 'UPDATE_OUTPUT'; payload: { limit?: number | null, distinct?: boolean } };


const initialState: ReportBuilderState = {
  id: null,
  reportName: '',
  selectedTables: [],
  steps: [createNewStep('Step 1')],
  currentStepIndex: 0,
};

const reportBuilderReducer = (state: ReportBuilderState, action: Action): ReportBuilderState => {
  const { currentStepIndex, steps } = state;
  const currentStep = steps[currentStepIndex];

  // Helper to update the current step immutably
  const updateCurrentStep = (newStepData: Partial<QueryStep>): ReportBuilderState => {
      const newSteps = [...steps];
      newSteps[currentStepIndex] = { ...currentStep, ...newStepData };
      return { ...state, steps: newSteps };
  };

  switch (action.type) {
    case 'LOAD_REPORT': {
      const { id, reportName, config } = action.payload;
      if (config) {
        return { ...config, id, reportName };
      }
      // If report has no config, start with a fresh builder state but keep id/name
      return { ...initialState, id, reportName };
    }
      
    case 'SET_PRIMARY_TABLE':
      return {
        ...initialState,
        reportName: `New Report on ${action.payload.displayName}`,
        selectedTables: [action.payload],
        steps: [createNewStep('Step 1')],
      };
    case 'ADD_TABLES':
        const newTables = action.payload.filter(
            newTable => !state.selectedTables.some(existing => existing.id === newTable.id)
        );
      return {
        ...state,
        selectedTables: [...state.selectedTables, ...newTables],
      };
    
    case 'REMOVE_TABLE': {
        const tableIdToRemove = action.payload;
        const newSelectedTables = state.selectedTables.filter(t => t.id !== tableIdToRemove);

        if (newSelectedTables.length === 0) {
            return initialState;
        }

        const newSteps = state.steps.map(step => {
            const newSelectedColumns = step.selectedColumns.filter(c => c.tableId !== tableIdToRemove);
            const removedColumnIds = new Set(step.selectedColumns.filter(c => c.tableId === tableIdToRemove).map(c => c.id));

            const newJoins = step.joins.filter(j => j.fromTableId !== tableIdToRemove && j.toTableId !== tableIdToRemove);
            const newAggregations = step.aggregations.filter(a => !removedColumnIds.has(a.columnId));
            const newFiltersQuery = cleanQueryByTable(step.filtersQuery, tableIdToRemove);
            const newGroupings = step.groupings.filter(g => !removedColumnIds.has(g.columnId));
            const newSorts = step.sorts.filter(s => !removedColumnIds.has(s.columnId));
            // Also clean having clauses that might reference the removed columns
            const newHaving = step.having.filter(h => !removedColumnIds.has(h.columnId));


            return {
                ...step,
                selectedColumns: newSelectedColumns,
                joins: newJoins,
                aggregations: newAggregations,
                filtersQuery: newFiltersQuery,
                groupings: newGroupings,
                having: newHaving,
                sorts: newSorts,
            };
        });

        return {
            ...state,
            selectedTables: newSelectedTables,
            steps: newSteps,
        };
    }
    
    case 'TOGGLE_COLUMN': {
      const { table, column } = action.payload;
      const isSelected = currentStep.selectedColumns.some(c => c.tableId === table.id && c.column.name === column.name);
      
      let newSelectedColumns;
      if (isSelected) {
        newSelectedColumns = currentStep.selectedColumns.filter(c => !(c.tableId === table.id && c.column.name === column.name));
      } else {
        newSelectedColumns = [...currentStep.selectedColumns, createNewColumn(table, column)];
      }
      return updateCurrentStep({ selectedColumns: newSelectedColumns });
    }

    case 'SELECT_ALL_COLUMNS': {
        const { table, shouldSelect } = action.payload;
        const otherTableColumns = currentStep.selectedColumns.filter(c => c.tableId !== table.id);
        
        if (shouldSelect) {
            const allTableColumns = table.columns.map(col => createNewColumn(table, col));
            return updateCurrentStep({ selectedColumns: [...otherTableColumns, ...allTableColumns] });
        }
        return updateCurrentStep({ selectedColumns: otherTableColumns });
    }

    case 'REMOVE_COLUMN':
        const newSelected = currentStep.selectedColumns.filter(c => c.id !== action.payload.id);
        return updateCurrentStep({ selectedColumns: newSelected });

    case 'REORDER_COLUMNS':
        return updateCurrentStep({ selectedColumns: action.payload });

    case 'UPDATE_COLUMN_ALIAS': {
        const { columnId, alias } = action.payload;
        const updatedColumns = currentStep.selectedColumns.map(c => 
            c.id === columnId ? { ...c, alias } : c
        );
        return updateCurrentStep({ selectedColumns: updatedColumns });
    }

    // --- JOINS ---
    case 'ADD_JOIN': {
        if (state.selectedTables.length < 1) return state;
        
        const isFirstJoin = currentStep.joins.length === 0;
        const fromTableId = isFirstJoin ? state.selectedTables[0].id : '';

        const newJoin: Join = {
            id: `join-${Date.now()}`,
            fromTableId: fromTableId,
            toTableId: '',
            type: 'INNER',
            fromColumn: '',
            toColumn: ''
        };
        return updateCurrentStep({ joins: [...currentStep.joins, newJoin] });
    }

    case 'UPDATE_JOIN': {
        const { joinId, joinData } = action.payload;
        const updatedJoins = currentStep.joins.map(j => 
            j.id === joinId ? { ...j, ...joinData } : j
        );
        return updateCurrentStep({ joins: updatedJoins });
    }
    
    case 'REMOVE_JOIN': {
        const filteredJoins = currentStep.joins.filter(j => j.id !== action.payload);
        return updateCurrentStep({ joins: filteredJoins });
    }
      
    // --- AGGREGATIONS ---
    case 'ADD_AGGREGATION': {
        const newAgg: Aggregation = {
            id: `agg-${Date.now()}`,
            columnId: '',
            func: 'COUNT',
            alias: ''
        };
        return updateCurrentStep({ aggregations: [...currentStep.aggregations, newAgg] });
    }
    case 'UPDATE_AGGREGATION': {
        const { aggId, data } = action.payload;
        const updatedAggs = currentStep.aggregations.map(a => a.id === aggId ? { ...a, ...data } : a);
        return updateCurrentStep({ aggregations: updatedAggs });
    }
    case 'REMOVE_AGGREGATION': {
        const filteredAggs = currentStep.aggregations.filter(a => a.id !== action.payload);
        return updateCurrentStep({ aggregations: filteredAggs });
    }
      
    // --- FILTERS (WHERE) ---
    case 'UPDATE_FILTERS_QUERY': {
        return updateCurrentStep({ filtersQuery: action.payload });
    }

    // --- FILTERS (HAVING) ---
    case 'ADD_HAVING': {
        const newFilter: Filter = {
            id: `having-${Date.now()}`,
            columnId: '',
            operator: '=',
            value: ''
        };
        return updateCurrentStep({ having: [...currentStep.having, newFilter] });
    }
    case 'UPDATE_HAVING': {
        const { filterId, data } = action.payload;
        const updatedHavings = currentStep.having.map(f => f.id === filterId ? { ...f, ...data } : f);
        return updateCurrentStep({ having: updatedHavings });
    }
    case 'REMOVE_HAVING': {
        const filteredHavings = currentStep.having.filter(f => f.id !== action.payload);
        return updateCurrentStep({ having: filteredHavings });
    }
      
    // --- GROUPING ---
    case 'ADD_GROUPING': {
        const newGrouping: Grouping = { id: `group-${Date.now()}`, columnId: '' };
        return updateCurrentStep({ groupings: [...currentStep.groupings, newGrouping] });
    }
    case 'UPDATE_GROUPING_COLUMN': {
        const { groupId, columnId } = action.payload;
        const updatedGroupings = currentStep.groupings.map(g => g.id === groupId ? { ...g, columnId } : g);
        return updateCurrentStep({ groupings: updatedGroupings });
    }
    case 'REMOVE_GROUPING': {
        const filteredGroupings = currentStep.groupings.filter(g => g.id !== action.payload);
        return updateCurrentStep({ groupings: filteredGroupings });
    }

    // --- SORT ---
    case 'ADD_SORT': {
        const newSort: Sort = { id: `sort-${Date.now()}`, columnId: '', direction: 'ASC' };
        return updateCurrentStep({ sorts: [...currentStep.sorts, newSort] });
    }
    case 'UPDATE_SORT': {
        const { sortId, data } = action.payload;
        const updatedSorts = currentStep.sorts.map(s => s.id === sortId ? { ...s, ...data } : s);
        return updateCurrentStep({ sorts: updatedSorts });
    }
    case 'REMOVE_SORT': {
        const filteredSorts = currentStep.sorts.filter(s => s.id !== action.payload);
        return updateCurrentStep({ sorts: filteredSorts });
    }
    case 'REORDER_SORTS':
        return updateCurrentStep({ sorts: action.payload });

    // --- OUTPUT ---
    case 'UPDATE_OUTPUT': {
        return updateCurrentStep(action.payload);
    }

    // --- STEPS / GLOBAL ---
    case 'ADD_STEP': {
        const newStep = createNewStep(`Step ${state.steps.length + 1}`);
        return {
            ...state,
            steps: [...state.steps, newStep],
            currentStepIndex: state.steps.length,
        };
    }
    
    case 'SWITCH_STEP':
        return { ...state, currentStepIndex: action.payload };

    case 'RESET_REPORT':
      return initialState;

    case 'UPDATE_REPORT_NAME':
      return { ...state, reportName: action.payload };
      
    default:
      return state;
  }
};

const ReportBuilderContext = createContext<{
  state: ReportBuilderState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const ReportBuilderProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(reportBuilderReducer, initialState);
  return <ReportBuilderContext.Provider value={{ state, dispatch }}>{children}</ReportBuilderContext.Provider>;
};

export const useReportBuilder = () => {
  const context = useContext(ReportBuilderContext);
  if (context === undefined) {
    throw new Error('useReportBuilder must be used within a ReportBuilderProvider');
  }
  return context;
};