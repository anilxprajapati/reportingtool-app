import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Card, Stack } from 'react-bootstrap';
import { BsFolderPlus } from 'react-icons/bs';
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
  addFolder: (folderData: { name: string; isPrivate: boolean; parentId: string | null; }) => Promise<Folder>;
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({ show, onHide, onSave, report, folders, addFolder }) => {
  const [reportName, setReportName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  
  // State for the inline new folder form
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIsPrivate, setNewFolderIsPrivate] = useState(false);
  const [newFolderValidated, setNewFolderValidated] = useState(false);

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
      
      // Reset all states
      setValidated(false);
      setShowCreateFolderForm(false);
      setNewFolderName('');
      setNewFolderIsPrivate(false);
      setNewFolderValidated(false);
    }
  }, [show, report, folders]);

  const handleCreateNewFolder = async () => {
    if (newFolderName.trim() === '') {
        setNewFolderValidated(true);
        return;
    }
    try {
        const newFolder = await addFolder({
            name: newFolderName,
            isPrivate: newFolderIsPrivate,
            parentId: selectedFolderId // Use current selection as parent
        });

        if (newFolder) {
            setSelectedFolderId(newFolder.id); // Auto-select the new folder
        }
        
        // Reset and hide form
        setShowCreateFolderForm(false);
        setNewFolderName('');
        setNewFolderIsPrivate(false);
        setNewFolderValidated(false);
    } catch (error) {
        console.error("Failed to create folder", error);
        // Optionally show an error toast to the user
    }
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const isFormValid = reportName.trim() !== '' && !!selectedFolderId;
    setValidated(true);
    
    if (isFormValid) {
      onSave({ reportName, folderId: selectedFolderId! });
    }
  };
  
  const isSaveDisabled = !reportName.trim() || !selectedFolderId || showCreateFolderForm;

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
            <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="mb-0">Folder</Form.Label>
                {!showCreateFolderForm && (
                    <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => setShowCreateFolderForm(true)}>
                        <BsFolderPlus className="me-1"/> New Folder
                    </Button>
                )}
            </div>

            {showCreateFolderForm ? (
                <Card bg="light-subtle" className="p-3">
                    <Form.Group className="mb-3" controlId="newFolderName">
                        <Form.Control
                            type="text"
                            size="sm"
                            placeholder="Enter new folder name"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            required
                            isInvalid={newFolderValidated && newFolderName.trim() === ''}
                        />
                         <Form.Control.Feedback type="invalid">
                            Folder name is required.
                        </Form.Control.Feedback>
                    </Form.Group>
                     <Form.Group className="mb-3" controlId="newFolderPrivate">
                        <Form.Check
                            type="switch"
                            label="Private Folder"
                            checked={newFolderIsPrivate}
                            onChange={e => setNewFolderIsPrivate(e.target.checked)}
                        />
                    </Form.Group>
                    <Stack direction="horizontal" gap={2} className="justify-content-end">
                        <Button variant="secondary" size="sm" onClick={() => setShowCreateFolderForm(false)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleCreateNewFolder}>Create & Select</Button>
                    </Stack>
                </Card>
            ) : (
                <>
                    <StyledSelect
                        value={folderOptions.find(o => o.value === selectedFolderId)}
                        options={folderOptions}
                        onChange={(option) => setSelectedFolderId(option?.value || null)}
                        placeholder="Select a folder..."
                    />
                    {validated && !selectedFolderId && (
                        <div className="text-danger small mt-1">Please select a folder.</div>
                    )}
                </>
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