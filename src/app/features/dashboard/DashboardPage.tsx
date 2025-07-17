import React from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsBoxArrowInRight, BsCollection, BsFileEarmarkText, BsQuestionCircle } from 'react-icons/bs';
import type { Step } from 'react-joyride';
import { useReportContext } from '../../context/ReportContext';
import { useFolders } from '../../hooks/useFolders';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import StatCard from './components/StatCard';
import RecentReportsTable from './components/RecentReportsTable';
import ReportsByFolderChart from './components/ReportsByFolderChart';
import ReportsCreatedChart from './components/ReportsCreatedChart';
import { dashboardTourSteps } from '../../components/AppTour';

interface DashboardPageProps {
  theme: string;
  startTour: (steps: Step[], index?: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ theme, startTour }) => {
  const navigate = useNavigate();
  const { reports, loading: loadingReports } = useReportContext();
  const { folders, loading: loadingFolders } = useFolders();
  const { stats, loading: loadingStats } = useDashboardStats(reports, folders);

  const loading = loadingReports || loadingFolders || loadingStats;
  const totalFolders = folders.reduce((acc, f) => acc + 1 + (f.children?.length || 0), 0);
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime())
    .slice(0, 10);

  return (
    <div className="d-flex flex-column h-100">
        <header className="mb-4">
            <h2 id="dashboard-welcome-header">Dashboard</h2>
            <p className="text-muted">Welcome back! Here's a quick overview of your reporting workspace.</p>
        </header>

        <Row className="mb-4" id="tour-step-stats">
            <Col md={6} lg={3} className="mb-3">
                <StatCard 
                    icon={<BsFileEarmarkText size={32} />}
                    value={reports.length.toLocaleString()}
                    title="Total Reports"
                    variant="primary"
                />
            </Col>
            <Col md={6} lg={3} className="mb-3">
                <StatCard
                    icon={<BsCollection size={32} />}
                    value={totalFolders.toLocaleString()}
                    title="Total Folders"
                    variant="info"
                />
            </Col>
            <Col md={6} lg={3} className="mb-3" id="tour-step-browse">
                 <Card className="h-100">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                        <h5 className="card-title">Explore Your Data</h5>
                        <p className="small text-muted">Dive into your reports and folders.</p>
                        <Button variant="primary" onClick={() => navigate('/folders')}>
                           Browse Reports <BsBoxArrowInRight className="ms-1"/>
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3} className="mb-3">
                 <Card className="h-100">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                        <h5 className="card-title">Quick Start</h5>
                        <p className="small text-muted">Need help? Take the tour again.</p>
                        <Button variant="outline-secondary" onClick={() => startTour(dashboardTourSteps)}>
                           <BsQuestionCircle className="me-2"/> Start Tour
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {loading ? (
             <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading Charts...</span>
                </Spinner>
            </div>
        ) : (
            <>
            <Row className="mb-4" id="dashboard-charts-row">
                <Col lg={6} className="mb-3">
                    <Card className="h-100">
                        <Card.Body style={{ height: '300px' }}>
                            {stats && <ReportsByFolderChart chartData={stats.reportsByFolder} theme={theme} />}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-3">
                    <Card className="h-100">
                        <Card.Body style={{ height: '300px' }}>
                            {stats && <ReportsCreatedChart chartData={stats.reportsCreatedOverTime} theme={theme} />}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="flex-grow-1" style={{ minHeight: 0 }}>
                <Col>
                    <Card className="d-flex flex-column h-100">
                        <Card.Header>
                            <h5 className="mb-0" id="recent-reports-header">Recently Modified Reports</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column p-0">
                            <RecentReportsTable reports={recentReports} theme={theme} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            </>
        )}
    </div>
  );
};

export default DashboardPage;