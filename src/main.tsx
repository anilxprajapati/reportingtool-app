import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './app/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-querybuilder/dist/query-builder.css';
import { ReportBuilderProvider } from './app/features/reportBuilder/context/ReportBuilderContext';
import { ReportProvider } from './app/context/ReportContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <DndProvider backend={HTML5Backend}>
        <ReportProvider>
          <ReportBuilderProvider>
            <App />
          </ReportBuilderProvider>
        </ReportProvider>
      </DndProvider>
    </HashRouter>
  </React.StrictMode>
);