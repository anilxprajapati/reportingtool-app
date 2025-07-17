import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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
  const [reportName, setReportName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const folderOptions: Options<FolderOption> = useMemo(() => {
    const options: FolderOption[] = [];
    const addFolders = (folderList: Folder[], depth: number) => {
        for (const f of folderList) {
            options.push({ value: f.id, label: `${'  '.repeat(depth)}${f.name}` });
            if (f.children) {
                addFolders(f.children, depth + 1);
            }
        }
    };
    addFolders(folders, 0);
    return options;
  }, [folders]);
  
  useEffect(() => {
    if (show) {
      setReportName(report.reportName);
      
      let initialFolder: Folder | undefined;
      const findFolder = (folderList: Folder[]): Folder | undefined => {
        for (const f of folderList) {
            if (f.name === report.folderName) return f;
            if (f.children) {
                const found = findFolder(f.children);
                if (found) return found;
            }
        }
        return undefined;
      };

      initialFolder = findFolder(folders);
      setSelectedFolderId(initialFolder?.id || null);
      
      setValidated(false);
    }
  }, [show, report, folders]);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const isFormValid = reportName.trim() !== '' && !!selectedFolderId;
    setValidated(true);
    
    if (isFormValid) {
      onSave({ reportName, folderId: selectedFolderId! });
    }
  };
  
  const isSaveDisabled = !reportName.trim() || !selectedFolderId;

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
                <div className="text-danger small mt-1 is-invalid">Please select a folder.</div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={isSaveDisabled}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaveReportModal;
