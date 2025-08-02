import type { Step } from 'react-joyride';

export const dashboardTourSteps: Step[] = [
  {
    target: '#dashboard-welcome-header',
    content: 'Welcome to the Nexus BI Dashboard! This is your central hub for data insights.',
    disableBeacon: true,
  },
  {
    target: '#tour-step-stats',
    content: 'These cards give you a high-level overview of your workspace, like total reports and folders.',
  },
  {
    target: '#dashboard-charts-row',
    content: 'Visualize your activity with charts showing reports per folder and creation trends over time.',
    placement: 'top',
  },
  {
    target: '#recent-reports-header',
    content: 'Quickly access your most recently modified reports right here.',
    placement: 'top',
  },
  {
    target: '#tour-step-browse',
    content: "When you're ready to dive deeper, click here to browse all your reports and folders.",
  },
];

export const foldersTourSteps: Step[] = [
  {
    target: '#tour-step-folders',
    content: 'This panel lists all your report folders. You can search, select a folder to filter the report list, or expand folders with children.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '#all-reports-filter',
    content: 'Click "All Reports" to see every report in your workspace, regardless of folder.',
    placement: 'right',
  },
  {
    target: '#tour-step-reports-table',
    content: 'Reports within the selected folder are shown here. You can run, edit, or delete them using the action buttons.',
    placement: 'left',
  },
  {
    target: '#tour-step-create-report',
    content: "Click 'Create Report' to start building a new report from scratch. This will take you to the schema explorer.",
    placement: 'bottom',
  },
  {
    target: '#create-folder-button',
    content: "Use 'Create Folder' to organize your reports. You can create top-level folders or sub-folders inside an existing one.",
    placement: 'bottom',
  },
];

export const schemaExplorerTourSteps: Step[] = [
  {
    target: '#schema-explorer-header',
    content: 'Welcome to the Schema Explorer. The first step of building a report is choosing your primary data source.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#tour-step-schema-list',
    content: 'All available database schemas and tables are listed here. You can search to find what you need.',
    placement: 'right',
  },
  {
    target: '#schema-preview-panel',
    content: 'When you select a table, you can preview its structure and sample data here to make sure it\'s the right one.',
    placement: 'left',
  },
  {
    target: '#schema-explorer-footer',
    content: "Once you've selected your desired primary table, click 'Add Primary Table' to proceed to the report builder.",
    placement: 'top',
  },
];

export const reportBuilderTourSteps: Step[] = [
  {
    target: '#report-builder-header',
    content: "This is the Report Builder! Here you can give your report a name, save your progress, or run it to see the output.",
    disableBeacon: true,
    placement: 'bottom'
  },
  {
    target: '#tour-step-schema-sidebar',
    content: 'Your selected tables appear here. Check the boxes to add columns to your report, or click "Add Table" to join more data sources.',
     placement: 'right',
  },
  {
    target: '#query-steps-panel',
    content: 'You can create multiple query steps within a single report. Each step acts as a separate query configuration, allowing you to create different views of your data. You can add, delete, and rename steps as needed.',
    placement: 'bottom',
  },
  {
    target: '#query-builder-tabs',
    content: 'These tabs are the core of the builder. Configure fields, create joins, add filters, perform aggregations, and more for the currently selected step.',
    placement: 'top',
  },
  {
    target: '#query-tab-content',
    content: "The content for the active tab appears here. For example, in the 'Fields' tab, you can reorder selected columns and give them aliases.",
    placement: 'top',
  },
  {
    target: '#tour-step-run-report',
    content: "When you're done configuring, click 'Save & Run Report' to generate the output. You'll be able to view the results for each step on the next page.",
    placement: 'left',
  },
];


export const reportOutputTourSteps: Step[] = [
  {
    target: '#tour-step-output-header',
    content: "This is the report output page. Your data is displayed in the grid below, reflecting the configurations you set in the builder.",
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#report-output-steps',
    content: 'If your report has multiple steps, you can switch between their results using these buttons.',
    placement: 'bottom',
  },
  {
    target: '#report-output-grid',
    content: 'You can sort and filter the data directly in this grid. Pagination controls are at the bottom.',
    placement: 'top'
  },
  {
    target: '#tour-step-output-save',
    content: "You can save the current report configuration, including its name and folder location. If it's a new report, this will create it.",
  },
  {
    target: '#tour-step-output-export',
    content: 'Export the grid data to a CSV file for use in other applications like Excel.',
  },
];
