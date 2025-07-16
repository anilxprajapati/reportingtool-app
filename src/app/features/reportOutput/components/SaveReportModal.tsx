import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Report, Folder } from '../../../../types';
import StyledSelect from '../../../components/StyledSelect';
import type { Options } from 'react-select';

type FolderOption = { value: string; label: string; };

interface SaveReportModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: { reportName: string; folderId: string; }) => void;
  report: Report;
  folders: Folder[];
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({ show, onHide, onSave, report, folders }) => {
  const [reportName, setReportName] = useState(report.reportName);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const folderOptions: Options<FolderOption> = useMemo(() => {
    return folders.flatMap(f => {
        const parent = { value: f.id, label: f.name };
        const children = f.children?.map(c => ({ value: c.id, label: `  ${c.name}` })) || [];
        return [parent, ...children];
    });
  }, [folders]);
  
  useEffect(() => {
    if (show) {
      setReportName(report.reportName);
      // Find the current folder's ID
      let folderId: string | undefined;
      for (const f of folders) {
        if (f.name === report.folderName) {
            folderId = f.id;
            break;
        }
        const child = f.children?.find(c => c.name === report.folderName);
        if (child) {
            folderId = child.id;
            break;
        }
      }
      setSelectedFolderId(folderId || null);
      setValidated(false);
    }
  }, [show, report, folders]);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (reportName.trim() === '' || !selectedFolderId) {
      setValidated(true);
      return;
    }
    onSave({ reportName, folderId: selectedFolderId });
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Save Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated}>
          <Form.Group className="mb-3" controlId="reportName">
            <Form.Label>Report Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
              isInvalid={validated && reportName.trim() === ''}
            />
            <Form.Control.Feedback type="invalid">
              Report name is required.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="folderSelect">
            <Form.Label>Folder</Form.Label>
            <StyledSelect
                value={folderOptions.find(o => o.value === selectedFolderId)}
                options={folderOptions}
                onChange={(option) => setSelectedFolderId(option?.value || null)}
                placeholder="Select a folder..."
            />
            {validated && !selectedFolderId && (
                <div className="text-danger small mt-1">Please select a folder.</div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaveReportModal;
