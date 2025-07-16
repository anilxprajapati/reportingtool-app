// This hook is deprecated. Report state is now managed by ReportContext.
// See src/app/context/ReportContext.tsx for the new implementation.

export const useReports = () => {
  console.warn('useReports is deprecated. Please use useReportContext instead.');
  return { reports: [], loading: true, setReports: () => {} };
};
