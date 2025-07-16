import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-querybuilder/dist/query-builder.css';
import './custom.css';
import { ReportBuilderProvider } from './app/features/reportBuilder/context/ReportBuilderContext';
import { ReportProvider } from './app/context/ReportContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ReportProvider>
        <ReportBuilderProvider>
          <App />
        </ReportBuilderProvider>
      </ReportProvider>
    </BrowserRouter>
  </React.StrictMode>
);