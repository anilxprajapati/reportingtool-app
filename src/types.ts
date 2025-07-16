import type { RuleGroupType } from 'react-querybuilder';

export interface Report {
  id: string;
  folderName: string;
  reportName: string;
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  config: ReportBuilderState | null;
}

export interface Folder {
  id: string;
  name: string;
  isPrivate: boolean;
  children?: Folder[];
}

export interface Column {
  name: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  description?: string;
}

export interface Table {
  id: string;
  name: string;
  displayName: string;
  rowCount: number;
  columns: Column[];
  sampleData: Record<string, any>[];
}

export interface Schema {
  id: string;
  name: string;
  tables: Table[];
}

export interface SelectedColumn {
  id: string; // Unique ID for drag-n-drop
  tableId: string;
  tableName: string;
  column: Column;
  alias: string;
}

export interface Join {
    id: string;
    fromTableId: string;
    toTableId: string;
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
    fromColumn: string;
    toColumn: string;
}

export type AggregationFunction = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
export interface Aggregation {
    id: string;
    columnId: string; // Refers to SelectedColumn.id
    func: AggregationFunction;
    alias: string;
}

export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';
export interface Filter {
    id: string;
    columnId: string; // Can refer to SelectedColumn.id OR an aggregation alias for HAVING clause
    operator: FilterOperator;
    value: string;
}

export interface Grouping {
    id: string;
    columnId: string; // Refers to SelectedColumn.id
}

export interface Sort {
    id: string;
    columnId: string; // Refers to SelectedColumn.id
    direction: 'ASC' | 'DESC';
}

export interface QueryStep {
    id: string;
    name: string;
    selectedColumns: SelectedColumn[];
    joins: Join[];
    aggregations: Aggregation[];
    filtersQuery: RuleGroupType;
    groupings: Grouping[];
    having: Filter[]; // Filters applied after grouping
    sorts: Sort[];
    limit: number | null;
    distinct: boolean;
}
export interface ReportBuilderState {
  id: string | null;
  reportName: string;
  selectedTables: Table[];
  steps: QueryStep[];
  currentStepIndex: number;
}