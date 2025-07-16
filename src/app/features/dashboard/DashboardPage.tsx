import React from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsBoxArrowInRight, BsCollection, BsFileEarmarkText, BsGraphUp } from 'react-icons/bs';
import { useReportContext } from '../../context/ReportContext';
import { useFolders } from '../../hooks/useFolders';
import StatCard from './components/StatCard';
import RecentReportsTable from './components/RecentReportsTable';

interface DashboardPageProps {
  theme: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ theme }) => {
  const navigate = useNavigate();
  const { reports, loading: loadingReports } = useReportContext();
  const { folders, loading: loadingFolders } = useFolders();

  const loading = loadingReports || loadingFolders;

  const totalFolders = folders.reduce((acc, f) => acc + 1 + (f.children?.length || 0), 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </Spinner>
      </div>
    );
  }
  
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime())
    .slice(0, 10);

  return (
    <div className="d-flex flex-column h-100">
        <header className="mb-4">
            <h2>Dashboard</h2>
            <p className="text-muted">Welcome back! Here's a quick overview of your reporting workspace.</p>
        </header>

        <Row className="mb-4">
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
             <Col md={6} lg={3} className="mb-3">
                <StatCard
                    icon={<BsGraphUp size={32} />}
                    value="7"
                    title="Reports Run Today"
                    variant="success"
                />
            </Col>
             <Col md={6} lg={3} className="mb-3">
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
        </Row>
        
        <Row className="flex-grow-1" style={{ minHeight: 0 }}>
            <Col>
                <Card className="d-flex flex-column h-100">
                    <Card.Header>
                        <h5 className="mb-0">Recently Modified Reports</h5>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column p-0">
                        <RecentReportsTable reports={recentReports} theme={theme} />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </div>
  );
};

export default DashboardPage;
