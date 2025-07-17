import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Step } from 'react-joyride';
import DatabaseSchemaSidebar from './components/DatabaseSchemaSidebar';
import QueryBuilder from './components/QueryBuilder';
import { useReportBuilder } from './context/ReportBuilderContext';

interface ReportBuilderPageProps {
  theme: string;
  startTour: (steps: Step[], index?: number) => void;
}

const ReportBuilderPage: React.FC<ReportBuilderPageProps> = ({ theme, startTour }) => {
  const { state } = useReportBuilder();
  const navigate = useNavigate();

  if (state.selectedTables.length === 0) {
    return (
        <div className="d-flex flex-column h-100 justify-content-center align-items-center">
            <Card className="text-center p-4 shadow-sm" style={{ maxWidth: '500px' }}>
                <Card.Body>
                    <Card.Title as="h3">No Data Source Selected</Card.Title>
                    <Card.Text className="text-muted my-3">
                        To build or edit a report, you must first select a primary table from your data sources.
                    </Card.Text>
                    <Button variant="primary" size="lg" onClick={() => navigate('/schema-explorer')}>
                        Select a Table
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
  }

  // The page is structured into a two-column layout.
  // The parent container in App.tsx provides necessary padding and context.
  // h-100 ensures the row takes full height of the container.
  // gx-3 provides a gap between the columns.
  return (
    <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
      <Row className="h-100 gx-3 flex-grow-1">
        <Col md={4} lg={3} className="d-flex flex-column h-100 pb-3" id="tour-step-schema-sidebar">
          <DatabaseSchemaSidebar />
        </Col>
        <Col md={8} lg={9} className="d-flex flex-column h-100 pb-3" id="tour-step-query-builder">
          <QueryBuilder startTour={startTour} />
        </Col>
      </Row>
    </div>
  );
};

export default ReportBuilderPage;