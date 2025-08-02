import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { Step } from 'react-joyride';
import DashboardPage from '../features/dashboard/DashboardPage';
import FolderListPage from '../features/folderList/FolderListPage';
import SchemaExplorerPage from '../features/schemaExplorer/SchemaExplorerPage';
import ReportBuilderPage from '../features/reportBuilder/ReportBuilderPage';
import ReportOutputPage from '../features/reportOutput/ReportOutputPage';

interface AppRoutesProps {
  theme: string;
  startTour: (steps: Step[], index?: number) => void;
}

/**
 * Defines all the application routes.
 * It sets up a default route to the dashboard and a catch-all redirect.
 */
const AppRoutes: React.FC<AppRoutesProps> = ({ theme, startTour }) => {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage theme={theme} startTour={startTour} />} />
      <Route path="/folders" element={<FolderListPage theme={theme} startTour={startTour} />} />
      <Route path="/schema-explorer" element={<SchemaExplorerPage theme={theme} startTour={startTour} />} />
      <Route path="/report-builder" element={<ReportBuilderPage theme={theme} startTour={startTour} />} />
      <Route path="/report-output" element={<ReportOutputPage theme={theme} startTour={startTour} />} />
      
      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Redirect any unknown paths to the dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;