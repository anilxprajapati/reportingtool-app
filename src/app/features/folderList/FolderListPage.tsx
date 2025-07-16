import React, { useState, useMemo, useCallback } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import FolderList from './components/FolderList';
import ReportTable from './components/ReportTable';
import CreateFolderModal from './components/CreateFolderModal';
import { useFolders } from '../../hooks/useFolders';
import { useReportContext } from '../../context/ReportContext';
import type { Folder } from '../../../types';

interface FolderListPageProps {
  theme: string;
}

/**
 * Renders the main page for browsing folders and reports.
 * This component orchestrates the folder list, report table, and creation modals.
 */
const FolderListPage: React.FC<FolderListPageProps> = ({ theme }) => {
  const { folders, loading: loadingFolders, addFolder } = useFolders();
  const { reports, loading: loadingReports } = useReportContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);

  const handleCreateFolder = useCallback((folderData: { name: string; isPrivate: boolean; parentId: string | null }) => {
    addFolder(folderData);
    setAlertInfo({ variant: 'success', message: `Folder "${folderData.name}" created successfully!` });
    setShowCreateFolderModal(false);
  }, [addFolder]);

  const filteredReports = useMemo(() => {
    if (selectedFolder) {
      // In a real app, you might recursively find reports in sub-folders too
      return reports.filter(report => report.folderName === selectedFolder.name);
    }
    return reports; // Show all reports if "All Reports" is selected
  }, [reports, selectedFolder]);
  
  const loading = loadingFolders || loadingReports;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {alertInfo && (
        <Alert variant={alertInfo.variant} onClose={() => setAlertInfo(null)} dismissible className="mb-3">
          {alertInfo.message}
        </Alert>
      )}
      <Row className="h-100">
        <Col lg={3} md={4} className="d-flex flex-column h-100 pb-3">
          <Card className="flex-grow-1 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <FolderList
                folders={folders}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8} className="d-flex flex-column h-100 pb-3">
           <Card className="flex-grow-1 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <ReportTable
                reports={filteredReports}
                selectedFolderName={selectedFolder?.name}
                onCreateFolder={() => setShowCreateFolderModal(true)}
                theme={theme}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CreateFolderModal
        show={showCreateFolderModal}
        onHide={() => setShowCreateFolderModal(false)}
        onSave={handleCreateFolder}
        selectedFolder={selectedFolder}
      />
    </>
  );
};

export default FolderListPage;