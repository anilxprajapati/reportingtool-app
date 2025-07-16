import type { Report, ReportBuilderState } from '../../types';

const createInitialState = (id: string, reportName: string): ReportBuilderState => ({
  id: id,
  reportName: reportName,
  selectedTables: [],
  steps: [{
    id: `step-${Date.now()}`,
    name: 'Step 1',
    selectedColumns: [],
    joins: [],
    aggregations: [],
    filtersQuery: { combinator: 'and', rules: [] },
    groupings: [],
    having: [],
    sorts: [],
    limit: null,
    distinct: false,
  }],
  currentStepIndex: 0,
});


export const generateMockReports = (count: number): Report[] => {
  const reports: Report[] = [];
  const folderNames = ['Academic Reports', 'Active Students', 'Archived Projects', 'Customer Feedback', 'Finance Reports', 'General Documents'];
  const reportPrefixes = ['Weekly', 'Monthly', 'Quarterly', 'Annual', 'Ad-hoc'];
  const reportSuffixes = ['Summary', 'Analysis', 'Deep Dive', 'Overview', 'Metrics'];
  const users = ['user-001', 'user-002', 'admin-01', 'guest-user', 'oidc-client-s', 'service-account'];

  for (let i = 1; i <= count; i++) {
    const reportId = `rep-${i}`;
    const reportName = `${reportPrefixes[Math.floor(Math.random() * reportPrefixes.length)]} ${reportSuffixes[Math.floor(Math.random() * reportSuffixes.length)]} #${i}`;
    const date = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 90);
    const modifiedDate = new Date(date.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 10);
    
    reports.push({
      id: reportId,
      folderName: folderNames[Math.floor(Math.random() * folderNames.length)],
      reportName: reportName,
      createdBy: users[Math.floor(Math.random() * users.length)],
      createdDate: date.toLocaleString(),
      modifiedDate: modifiedDate.toLocaleString(),
      // Some reports will have a null config, some will have a basic one.
      config: Math.random() > 0.4 ? createInitialState(reportId, reportName) : null,
    });
  }
  return reports;
};
